import type {
  SpaceBadgeSnapshot,
  SpaceCertificationSnapshot,
  SpaceCredentialVisualStatus,
  SpaceProfessionalProfileSnapshot,
  SpaceProfileReference,
  SpaceServiceSnapshot,
} from './types'

const FETCH_TIMEOUT_MS = 2500
const STALE_MS = 6 * 60 * 60 * 1000
/** Published SPACE production base — override via SPACE_PUBLIC_PROFILE_API_BASE. */
export const DEFAULT_SPACE_PUBLIC_PROFILE_API_BASE = 'https://space.melega.ai'
export const SPACE_PUBLIC_PROFILE_SCHEMA = 'space.professional-profile.public.v1'
const PROFILE_PATH_PREFIX = '/api/public/professional-profiles'

function spaceApiBase(): string | null {
  const raw = process.env.SPACE_PUBLIC_PROFILE_API_BASE ?? process.env.NEXT_PUBLIC_SPACE_PUBLIC_PROFILE_API_BASE
  if (raw !== undefined) {
    if (!raw.trim()) return null
    return raw.replace(/\/$/, '')
  }
  return DEFAULT_SPACE_PUBLIC_PROFILE_API_BASE
}

function sanitizeText(input: unknown, max = 480): string | undefined {
  if (typeof input !== 'string') return undefined
  const cleaned = input.replace(/<[^>]*>/g, '').replace(/[\u0000-\u001F\u007F]/g, '').trim()
  if (!cleaned) return undefined
  return cleaned.slice(0, max)
}

function sanitizeHttpsUrl(input: unknown): string | undefined {
  if (typeof input !== 'string') return undefined
  try {
    const u = new URL(input.trim())
    if (u.protocol !== 'https:') return undefined
    return u.toString()
  } catch {
    return undefined
  }
}

/** Canonical profile/service URLs must stay on the approved SPACE host. */
function sanitizeSpaceUrl(input: unknown): string | undefined {
  const url = sanitizeHttpsUrl(input)
  if (!url) return undefined
  try {
    const host = new URL(url).hostname.toLowerCase()
    if (host === 'space.melega.ai' || host.endsWith('.space.melega.ai')) return url
    return undefined
  } catch {
    return undefined
  }
}

function mapCredentialStatus(raw: unknown): SpaceCredentialVisualStatus {
  const s = typeof raw === 'string' ? raw.trim().toUpperCase() : ''
  if (s === 'ACTIVE' || s === 'VALID') return 'ACTIVE'
  if (s === 'EXPIRED') return 'EXPIRED'
  if (s === 'REVOKED') return 'REVOKED'
  if (s === 'SUSPENDED') return 'SUSPENDED'
  if (s === 'PENDING') return 'UNAVAILABLE'
  return 'UNAVAILABLE'
}

function emptySnapshot(
  status: SpaceProfessionalProfileSnapshot['status'],
  message: string,
  extras: Partial<SpaceProfessionalProfileSnapshot> = {},
): SpaceProfessionalProfileSnapshot {
  const fetchedAt = new Date().toISOString()
  return {
    authority: 'SPACE',
    status,
    profileId: null,
    canonicalUrl: null,
    services: [],
    badges: [],
    certifications: [],
    fetchedAt,
    freshness: status === 'SPACE_UNAVAILABLE' ? 'unavailable' : 'unknown',
    provenance: 'SPACE',
    partialData: false,
    errorState: status === 'SPACE_UNAVAILABLE' ? 'SPACE_SOURCE_UNAVAILABLE' : null,
    message,
    ...extras,
  }
}

function pickArray(raw: Record<string, unknown>, ...keys: string[]): unknown[] {
  for (const key of keys) {
    const value = raw[key]
    if (Array.isArray(value)) return value
  }
  return []
}

function summaryItems(raw: unknown): unknown[] {
  if (!raw || typeof raw !== 'object') return []
  const o = raw as Record<string, unknown>
  return Array.isArray(o.items) ? o.items : []
}

function mapServices(items: unknown[]): SpaceServiceSnapshot[] {
  return items
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const o = item as Record<string, unknown>
      const title = sanitizeText(o.title || o.name, 120)
      if (!title) return null
      const publicStatus = sanitizeText(o.public_status || o.status, 64)?.toUpperCase()
      if (publicStatus && ['HIDDEN', 'SUSPENDED', 'UNAVAILABLE'].includes(publicStatus)) return null
      return {
        serviceId: sanitizeText(o.service_id || o.serviceId || o.id, 64),
        title,
        category: sanitizeText(o.family || o.category || o.outcome_category, 80),
        shortOutcome: sanitizeText(o.short_description || o.shortOutcome || o.summary, 200),
        status: publicStatus,
        priceStatus: sanitizeText(o.price_status || o.priceStatus, 80),
        mCreditsSupported: typeof o.m_credits_supported === 'boolean' ? o.m_credits_supported : undefined,
        directCryptoSupported:
          typeof o.direct_crypto_supported === 'boolean' ? o.direct_crypto_supported : undefined,
        serviceUrl: sanitizeSpaceUrl(o.canonical_service_url || o.serviceUrl || o.url),
        provenance: 'SPACE' as const,
      }
    })
    .filter(Boolean) as SpaceServiceSnapshot[]
}

function mapBadges(items: unknown[]): SpaceBadgeSnapshot[] {
  return items
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const o = item as Record<string, unknown>
      const badgeId = sanitizeText(o.badge_id || o.badgeId || o.id, 64)
      const publicName = sanitizeText(o.public_name || o.publicName || o.name, 120)
      if (!badgeId || !publicName) return null
      return {
        badgeId,
        publicName,
        shortMeaning: sanitizeText(o.short_meaning || o.shortMeaning || o.meaning, 200),
        issuer: sanitizeText(o.issuer, 120),
        issuedAt: sanitizeText(o.issued_at || o.issuedAt, 40),
        status: mapCredentialStatus(o.status),
        validUntil: sanitizeText(o.valid_until || o.validUntil, 40),
        revocationState: sanitizeText(o.revocation_state || o.revocationState, 64),
        evidenceUrl: sanitizeHttpsUrl(o.evidence_url || o.evidenceUrl),
        artworkUrl: sanitizeHttpsUrl(o.artwork_url || o.artworkUrl || o.iconUrl),
        provenance: 'SPACE' as const,
      }
    })
    .filter(Boolean) as SpaceBadgeSnapshot[]
}

function mapCertifications(items: unknown[]): SpaceCertificationSnapshot[] {
  return items
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const o = item as Record<string, unknown>
      const certificationId = sanitizeText(o.certification_id || o.certificationId || o.id, 64)
      const publicTitle = sanitizeText(o.public_title || o.publicTitle || o.title || o.name, 160)
      if (!certificationId || !publicTitle) return null
      return {
        certificationId,
        publicTitle,
        scope: sanitizeText(o.scope, 160),
        issuer: sanitizeText(o.issuer, 120),
        issuedAt: sanitizeText(o.issued_at || o.issuedAt, 40),
        validUntil: sanitizeText(o.valid_until || o.validUntil, 40),
        status: mapCredentialStatus(o.status),
        evidenceUrl: sanitizeHttpsUrl(o.evidence_url || o.evidenceUrl),
        provenance: 'SPACE' as const,
      }
    })
    .filter(Boolean) as SpaceCertificationSnapshot[]
}

function mapFreshness(raw: unknown, updatedAt: string | null): SpaceProfessionalProfileSnapshot['freshness'] {
  if (typeof raw === 'string') {
    const f = raw.trim().toUpperCase()
    if (f === 'CURRENT') return 'current'
    if (f === 'STALE') return 'stale'
    if (f === 'PARTIAL') return 'unknown'
    if (f === 'UNAVAILABLE') return 'unavailable'
  }
  if (updatedAt) {
    const t = Date.parse(updatedAt)
    if (Number.isFinite(t) && Date.now() - t > STALE_MS) return 'stale'
    return 'current'
  }
  return 'unknown'
}

function mapPayload(raw: Record<string, unknown>, reference: SpaceProfileReference): SpaceProfessionalProfileSnapshot {
  const fetchedAt = new Date().toISOString()
  const schema = sanitizeText(raw.schema, 80)
  if (schema && schema !== SPACE_PUBLIC_PROFILE_SCHEMA) {
    return emptySnapshot('SPACE_UNAVAILABLE', 'SPACE profile temporarily unavailable', {
      profileId: reference.profileId,
      errorState: 'SPACE_SCHEMA_MISMATCH',
    })
  }

  const subject =
    raw.subject && typeof raw.subject === 'object' ? (raw.subject as Record<string, unknown>) : {}
  const verification =
    raw.verification && typeof raw.verification === 'object'
      ? (raw.verification as Record<string, unknown>)
      : {}

  const updatedAt =
    (typeof raw.updated_at === 'string' && raw.updated_at) ||
    (typeof raw.updatedAt === 'string' && raw.updatedAt) ||
    null
  const profileStatus = sanitizeText(raw.profile_status || raw.profileStatus || raw.status, 64)
  const suspended =
    typeof profileStatus === 'string' && /suspend/i.test(profileStatus)

  const services = mapServices([
    ...summaryItems(raw.services_summary),
    ...pickArray(raw, 'services'),
  ])
  const badges = mapBadges([...summaryItems(raw.badges_summary), ...pickArray(raw, 'badges')])
  const certifications = mapCertifications([
    ...summaryItems(raw.certifications_summary),
    ...pickArray(raw, 'certifications'),
  ])

  const freshness = mapFreshness(raw.freshness, updatedAt)
  const spaceFreshness = typeof raw.freshness === 'string' ? raw.freshness.toUpperCase() : ''
  const partial =
    Boolean(raw.partialData) ||
    spaceFreshness === 'PARTIAL' ||
    (!sanitizeText(subject.display_name || raw.displayName) &&
      services.length === 0 &&
      badges.length === 0 &&
      certifications.length === 0)

  const displayName = sanitizeText(subject.display_name || raw.displayName, 120)
  const profileType = sanitizeText(subject.type || raw.profileType, 64)
  const avatarOrLogo = sanitizeHttpsUrl(subject.avatar_url || raw.avatarOrLogo || raw.logoUrl)
  const shortProfessionalDescription = sanitizeText(
    subject.short_description || raw.shortProfessionalDescription || raw.description,
    400,
  )
  const verificationState = sanitizeText(verification.status || raw.verificationState, 64)
  const canonicalUrl = sanitizeSpaceUrl(raw.canonical_url || raw.canonicalUrl) || null
  const version = sanitizeText(raw.version, 64)
  const profileId = sanitizeText(raw.profile_id || raw.profileId, 128) || reference.profileId

  if (suspended) {
    return {
      authority: 'SPACE',
      status: 'SUSPENDED_PROFILE',
      profileId,
      canonicalUrl,
      displayName,
      profileType,
      avatarOrLogo,
      shortProfessionalDescription,
      verificationState,
      profileStatus,
      services: [],
      badges: [],
      certifications: [],
      version,
      updatedAt,
      fetchedAt,
      freshness,
      provenance: 'SPACE',
      partialData: true,
      errorState: 'PROFILE_SUSPENDED',
      message: 'This SPACE Professional Profile is suspended.',
    }
  }

  if (profileStatus?.toUpperCase() === 'UNAVAILABLE') {
    return emptySnapshot('SPACE_UNAVAILABLE', 'SPACE profile temporarily unavailable', {
      profileId,
      canonicalUrl,
      errorState: 'PROFILE_UNAVAILABLE',
      freshness: 'unavailable',
    })
  }

  const status =
    freshness === 'stale'
      ? 'STALE_DATA'
      : partial
        ? 'PARTIAL_DATA'
        : ('PROFILE_LINKED' as const)

  return {
    authority: 'SPACE',
    status,
    profileId,
    canonicalUrl,
    displayName,
    profileType,
    avatarOrLogo,
    shortProfessionalDescription,
    verificationState,
    profileStatus,
    services,
    badges,
    certifications,
    reputationSummary:
      raw.reputation_summary && typeof raw.reputation_summary === 'object'
        ? (raw.reputation_summary as Record<string, unknown>)
        : raw.reputationSummary && typeof raw.reputationSummary === 'object'
          ? (raw.reputationSummary as Record<string, unknown>)
          : undefined,
    version,
    updatedAt,
    fetchedAt,
    freshness,
    provenance: 'SPACE',
    partialData: partial,
    errorState: null,
    message:
      status === 'STALE_DATA'
        ? `Last verified from SPACE ${updatedAt}`
        : status === 'PARTIAL_DATA'
          ? 'Some SPACE profile information is temporarily unavailable.'
          : 'Authoritative SPACE Professional Profile.',
  }
}

async function fetchJson(
  url: string,
  signal: AbortSignal,
): Promise<{ ok: true; status: number; json: unknown } | { ok: false; status: number; json: unknown | null }> {
  const res = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    signal,
  })
  let json: unknown = null
  try {
    json = await res.json()
  } catch {
    json = null
  }
  if (!res.ok) return { ok: false, status: res.status, json }
  return { ok: true, status: res.status, json }
}

function mergeCredentialPayload(
  detail: Record<string, unknown>,
  credentials: Record<string, unknown> | null,
  services: Record<string, unknown> | null,
): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...detail }
  if (services && Array.isArray(services.items)) {
    merged.services_summary = {
      ...(typeof detail.services_summary === 'object' && detail.services_summary
        ? (detail.services_summary as object)
        : {}),
      items: services.items,
    }
  }
  if (credentials) {
    if (Array.isArray(credentials.badges) || credentials.badges_summary) {
      merged.badges_summary = credentials.badges_summary || {
        items: credentials.badges,
      }
    }
    if (Array.isArray(credentials.certifications) || credentials.certifications_summary) {
      merged.certifications_summary = credentials.certifications_summary || {
        items: credentials.certifications,
      }
    }
  }
  return merged
}

/**
 * Fetch authoritative SPACE profile. Never invents payloads.
 * Defaults to live SPACE production base; set SPACE_PUBLIC_PROFILE_API_BASE="" to disable.
 */
export async function fetchSpaceProfessionalProfile(
  reference: SpaceProfileReference | null,
): Promise<SpaceProfessionalProfileSnapshot> {
  if (!reference) {
    return emptySnapshot(
      'NO_CANONICAL_LINK',
      'This Project Page is not currently linked to a verified SPACE Professional Profile.',
    )
  }

  const base = spaceApiBase()
  if (!base) {
    return emptySnapshot('SPACE_UNAVAILABLE', 'SPACE profile temporarily unavailable', {
      profileId: reference.profileId,
      errorState: 'SPACE_PUBLIC_PROFILE_API_BASE_NOT_CONFIGURED',
    })
  }

  const encodedId = encodeURIComponent(reference.profileId)
  const detailUrl = `${base}${PROFILE_PATH_PREFIX}/${encodedId}`
  const servicesUrl = `${detailUrl}/services`
  const credentialsUrl = `${detailUrl}/credentials`

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const detail = await fetchJson(detailUrl, controller.signal)
    if (!detail.ok) {
      const err =
        detail.json && typeof detail.json === 'object'
          ? ((detail.json as Record<string, unknown>).error as Record<string, unknown> | undefined)
          : undefined
      const code = typeof err?.code === 'string' ? err.code : null
      if (detail.status === 404 || code === 'PROFILE_NOT_FOUND' || code === 'INVALID_PROFILE_ID') {
        return emptySnapshot(
          'PROFILE_NOT_FOUND',
          'Configured SPACE profile ID is not a public Professional Profile.',
          {
            profileId: reference.profileId,
            errorState: code || 'PROFILE_NOT_FOUND',
          },
        )
      }
      if (code === 'PROFILE_NOT_PUBLIC' || code === 'PROFILE_SUSPENDED') {
        return emptySnapshot(
          code === 'PROFILE_SUSPENDED' ? 'SUSPENDED_PROFILE' : 'PROFILE_NOT_FOUND',
          code === 'PROFILE_SUSPENDED'
            ? 'This SPACE Professional Profile is suspended.'
            : 'Configured SPACE profile is no longer public.',
          {
            profileId: reference.profileId,
            errorState: code,
          },
        )
      }
      return emptySnapshot('SPACE_UNAVAILABLE', 'SPACE profile temporarily unavailable', {
        profileId: reference.profileId,
        errorState: code || `SPACE_HTTP_${detail.status}`,
      })
    }

    if (!detail.json || typeof detail.json !== 'object') {
      return emptySnapshot('SPACE_UNAVAILABLE', 'SPACE profile temporarily unavailable', {
        profileId: reference.profileId,
        errorState: 'SPACE_INVALID_PAYLOAD',
      })
    }

    // Enrich from sibling contracts when available; failures stay partial, not invented.
    const [servicesRes, credentialsRes] = await Promise.all([
      fetchJson(servicesUrl, controller.signal).catch(() => null),
      fetchJson(credentialsUrl, controller.signal).catch(() => null),
    ])

    const merged = mergeCredentialPayload(
      detail.json as Record<string, unknown>,
      credentialsRes?.ok && credentialsRes.json && typeof credentialsRes.json === 'object'
        ? (credentialsRes.json as Record<string, unknown>)
        : null,
      servicesRes?.ok && servicesRes.json && typeof servicesRes.json === 'object'
        ? (servicesRes.json as Record<string, unknown>)
        : null,
    )

    return mapPayload(merged, reference)
  } catch (err) {
    const aborted = err instanceof Error && err.name === 'AbortError'
    return emptySnapshot('SPACE_UNAVAILABLE', 'SPACE profile temporarily unavailable', {
      profileId: reference.profileId,
      errorState: aborted ? 'SPACE_TIMEOUT' : 'SPACE_FETCH_FAILED',
    })
  } finally {
    clearTimeout(timer)
  }
}

export function activeCredentials<T extends { status: SpaceCredentialVisualStatus }>(items: T[]): T[] {
  return items.filter((item) => item.status === 'ACTIVE')
}
