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

function spaceApiBase(): string | null {
  const raw = process.env.SPACE_PUBLIC_PROFILE_API_BASE || process.env.NEXT_PUBLIC_SPACE_PUBLIC_PROFILE_API_BASE
  if (!raw || !raw.trim()) return null
  return raw.replace(/\/$/, '')
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

function mapCredentialStatus(raw: unknown): SpaceCredentialVisualStatus {
  const s = typeof raw === 'string' ? raw.trim().toUpperCase() : ''
  if (s === 'ACTIVE' || s === 'VALID') return 'ACTIVE'
  if (s === 'EXPIRED') return 'EXPIRED'
  if (s === 'REVOKED') return 'REVOKED'
  if (s === 'SUSPENDED') return 'SUSPENDED'
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

function mapPayload(raw: Record<string, unknown>, reference: SpaceProfileReference): SpaceProfessionalProfileSnapshot {
  const fetchedAt = new Date().toISOString()
  const updatedAt = typeof raw.updatedAt === 'string' ? raw.updatedAt : null
  const profileStatus = sanitizeText(raw.profileStatus || raw.status, 64)
  const suspended = typeof profileStatus === 'string' && /suspend/i.test(profileStatus)

  const servicesRaw = Array.isArray(raw.services) ? raw.services : []
  const badgesRaw = Array.isArray(raw.badges) ? raw.badges : []
  const certsRaw = Array.isArray(raw.certifications) ? raw.certifications : []

  const services: SpaceServiceSnapshot[] = servicesRaw
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const o = item as Record<string, unknown>
      const title = sanitizeText(o.title || o.name, 120)
      if (!title) return null
      return {
        serviceId: sanitizeText(o.serviceId || o.id, 64),
        title,
        category: sanitizeText(o.category, 80),
        shortOutcome: sanitizeText(o.shortOutcome || o.summary, 200),
        status: sanitizeText(o.status, 64),
        priceStatus: sanitizeText(o.priceStatus, 80),
        serviceUrl: sanitizeHttpsUrl(o.serviceUrl || o.url),
        provenance: 'SPACE' as const,
      }
    })
    .filter(Boolean) as SpaceServiceSnapshot[]

  const badges: SpaceBadgeSnapshot[] = badgesRaw
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const o = item as Record<string, unknown>
      const badgeId = sanitizeText(o.badgeId || o.id, 64)
      const publicName = sanitizeText(o.publicName || o.name, 120)
      if (!badgeId || !publicName) return null
      return {
        badgeId,
        publicName,
        shortMeaning: sanitizeText(o.shortMeaning || o.meaning, 200),
        issuer: sanitizeText(o.issuer, 120),
        issuedAt: sanitizeText(o.issuedAt, 40),
        status: mapCredentialStatus(o.status),
        validUntil: sanitizeText(o.validUntil, 40),
        revocationState: sanitizeText(o.revocationState, 64),
        evidenceUrl: sanitizeHttpsUrl(o.evidenceUrl),
        artworkUrl: sanitizeHttpsUrl(o.artworkUrl || o.iconUrl),
        provenance: 'SPACE' as const,
      }
    })
    .filter(Boolean) as SpaceBadgeSnapshot[]

  const certifications: SpaceCertificationSnapshot[] = certsRaw
    .map((item) => {
      if (!item || typeof item !== 'object') return null
      const o = item as Record<string, unknown>
      const certificationId = sanitizeText(o.certificationId || o.id, 64)
      const publicTitle = sanitizeText(o.publicTitle || o.title || o.name, 160)
      if (!certificationId || !publicTitle) return null
      return {
        certificationId,
        publicTitle,
        scope: sanitizeText(o.scope, 160),
        issuer: sanitizeText(o.issuer, 120),
        issuedAt: sanitizeText(o.issuedAt, 40),
        validUntil: sanitizeText(o.validUntil, 40),
        status: mapCredentialStatus(o.status),
        evidenceUrl: sanitizeHttpsUrl(o.evidenceUrl),
        provenance: 'SPACE' as const,
      }
    })
    .filter(Boolean) as SpaceCertificationSnapshot[]

  let freshness: SpaceProfessionalProfileSnapshot['freshness'] = 'current'
  if (updatedAt) {
    const t = Date.parse(updatedAt)
    if (Number.isFinite(t) && Date.now() - t > STALE_MS) freshness = 'stale'
  } else {
    freshness = 'unknown'
  }

  const partial =
    Boolean(raw.partialData) ||
    (!sanitizeText(raw.displayName) && services.length === 0 && badges.length === 0 && certifications.length === 0)

  if (suspended) {
    return {
      authority: 'SPACE',
      status: 'SUSPENDED_PROFILE',
      profileId: reference.profileId,
      canonicalUrl: sanitizeHttpsUrl(raw.canonicalUrl) || null,
      displayName: sanitizeText(raw.displayName, 120),
      profileType: sanitizeText(raw.profileType, 64),
      avatarOrLogo: sanitizeHttpsUrl(raw.avatarOrLogo || raw.logoUrl),
      shortProfessionalDescription: sanitizeText(raw.shortProfessionalDescription || raw.description, 400),
      verificationState: sanitizeText(raw.verificationState, 64),
      profileStatus,
      services: [],
      badges: [],
      certifications: [],
      version: sanitizeText(raw.version, 64),
      updatedAt,
      fetchedAt,
      freshness,
      provenance: 'SPACE',
      partialData: true,
      errorState: null,
      message: 'This SPACE Professional Profile is suspended.',
    }
  }

  const status =
    freshness === 'stale' ? 'STALE_DATA' : partial ? 'PARTIAL_DATA' : ('PROFILE_LINKED' as const)

  return {
    authority: 'SPACE',
    status,
    profileId: reference.profileId,
    canonicalUrl: sanitizeHttpsUrl(raw.canonicalUrl) || null,
    displayName: sanitizeText(raw.displayName, 120),
    profileType: sanitizeText(raw.profileType, 64),
    avatarOrLogo: sanitizeHttpsUrl(raw.avatarOrLogo || raw.logoUrl),
    shortProfessionalDescription: sanitizeText(raw.shortProfessionalDescription || raw.description, 400),
    verificationState: sanitizeText(raw.verificationState, 64),
    profileStatus,
    services,
    badges,
    certifications,
    reputationSummary:
      raw.reputationSummary && typeof raw.reputationSummary === 'object'
        ? (raw.reputationSummary as Record<string, unknown>)
        : undefined,
    version: sanitizeText(raw.version, 64),
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

/**
 * Fetch authoritative SPACE profile. Never invents payloads.
 * When SPACE_PUBLIC_PROFILE_API_BASE is unset, returns SPACE_UNAVAILABLE for linked refs.
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
    return emptySnapshot(
      'SPACE_UNAVAILABLE',
      'SPACE profile temporarily unavailable',
      {
        profileId: reference.profileId,
        errorState: 'SPACE_PUBLIC_PROFILE_API_BASE_NOT_CONFIGURED',
      },
    )
  }

  const url = `${base}/professional-profiles/${encodeURIComponent(reference.profileId)}`
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    })
    if (!res.ok) {
      return emptySnapshot('SPACE_UNAVAILABLE', 'SPACE profile temporarily unavailable', {
        profileId: reference.profileId,
        errorState: `SPACE_HTTP_${res.status}`,
      })
    }
    const json = (await res.json()) as unknown
    if (!json || typeof json !== 'object') {
      return emptySnapshot('SPACE_UNAVAILABLE', 'SPACE profile temporarily unavailable', {
        profileId: reference.profileId,
        errorState: 'SPACE_INVALID_PAYLOAD',
      })
    }
    return mapPayload(json as Record<string, unknown>, reference)
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
