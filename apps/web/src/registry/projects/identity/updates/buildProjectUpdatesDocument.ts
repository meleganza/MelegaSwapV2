import type { StaticProjectRecord } from '../../types'
import type { CanonicalProjectDocument } from '../types'
import type { ProjectEvidencePack } from '../evidence/types'
import type { EvidenceFreshnessState, EvidenceVerificationLevel } from '../evidence/schema'
import { resolveProjectBySlug } from '../resolveProject'
import { normalizeProjectDocument } from '../normalizeProject'
import { loadProjectEvidencePack } from '../evidence'
import { fingerprint } from '../evidence/evidenceId'
import { sanitizePlainText } from '../urlSafety'
import {
  PROJECT_PAGE_UPDATES_SUMMARY_EXTENSION,
  PROJECT_UPDATES_SCHEMA_VERSION,
  UPDATES_LIMITATIONS,
  UPDATES_RESOLVER_REVISION,
  isUpdateAuthorType,
  isUpdateCategory,
  isUpdateStatus,
  type UpdateAvailability,
  type UpdateCategory,
  type UpdateVerificationState,
} from './schema'
import { buildUpdateId, buildUpdateRevision } from './ids'
import { listRegistryUpdatesForSlug } from './registry.data'
import type { ProjectUpdate, ProjectUpdatesDocument, ProjectUpdatesWarning, UpdatesSummaryForProjectApi } from './types'

const LEVEL_RANK: Record<EvidenceVerificationLevel, number> = {
  NONE: 0,
  SOURCE_CONFIRMED: 1,
  CONTROL_CONFIRMED: 2,
  INDEPENDENTLY_VERIFIED: 3,
  MELEGA_VERIFIED: 4,
}

function revisionFromParts(parts: string[]): string {
  return fingerprint(parts.slice().sort().join('|'))
}

function contentFingerprint(title: string, summary: string, content: string): string {
  return fingerprint([title, summary, content].join('\u001f'))
}

function mapVerificationState(
  levels: EvidenceVerificationLevel[],
  resolvedCount: number,
  requestedCount: number,
): UpdateVerificationState {
  if (requestedCount === 0) return 'UNVERIFIED'
  if (resolvedCount === 0) return 'UNVERIFIED'
  const min = levels.reduce<EvidenceVerificationLevel>((acc, level) => {
    return LEVEL_RANK[level] < LEVEL_RANK[acc] ? level : acc
  }, 'MELEGA_VERIFIED')
  if (min === 'NONE') return 'NONE'
  return min
}

function aggregateFreshness(states: EvidenceFreshnessState[]): EvidenceFreshnessState {
  if (states.includes('EXPIRED')) return 'EXPIRED'
  if (states.includes('STALE')) return 'STALE'
  if (states.includes('CURRENT')) return 'CURRENT'
  return 'NONE'
}

function normalizeAuthorIdentity(raw: string): string {
  return (
    sanitizePlainText(raw, 120)
      ?.toLowerCase()
      .replace(/[^a-z0-9:_.-]/g, '') ?? 'unknown'
  )
}

function sanitizeTag(raw: string): string | null {
  const cleaned = sanitizePlainText(raw, 64)
  if (!cleaned) return null
  return cleaned
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9._-]/g, '')
}

/**
 * Shared Project Updates resolver — public API and Project Page must use this.
 * Does not implement publishing. Does not create a social feed.
 */
export function buildProjectUpdatesDocument(input: {
  project: StaticProjectRecord
  document: CanonicalProjectDocument
  evidencePack: ProjectEvidencePack
  generatedAt?: string
}): ProjectUpdatesDocument {
  const generatedAt = input.generatedAt ?? new Date().toISOString()
  const warnings: ProjectUpdatesWarning[] = []
  const registryRows = listRegistryUpdatesForSlug(input.document.slug)

  const idByStableKey = new Map<string, string>()
  for (const row of registryRows) {
    if (!isUpdateCategory(row.category) || !isUpdateAuthorType(row.authorType) || !isUpdateStatus(row.status)) {
      continue
    }
    const updateId = buildUpdateId({
      projectId: input.document.projectId,
      stableKey: row.stableKey,
      version: row.version,
      publishedAt: row.publishedAt,
      category: row.category,
    })
    idByStableKey.set(row.stableKey, updateId)
  }

  const publicEvidence = input.evidencePack.evidence.filter((e) => e.visibility === 'PUBLIC')

  const updates: ProjectUpdate[] = []
  for (const row of registryRows) {
    if (!isUpdateCategory(row.category)) {
      warnings.push({
        reasonCode: 'INVALID_CATEGORY_DROPPED',
        message: `Dropped update ${row.stableKey}: invalid category.`,
        updateId: null,
      })
      continue
    }
    if (!isUpdateAuthorType(row.authorType)) {
      warnings.push({
        reasonCode: 'INVALID_AUTHOR_DROPPED',
        message: `Dropped update ${row.stableKey}: invalid author type.`,
        updateId: null,
      })
      continue
    }
    if (!isUpdateStatus(row.status)) continue
    if (row.visibility !== 'PUBLIC') continue

    const title = sanitizePlainText(row.title, 200)
    const summary = sanitizePlainText(row.summary, 500)
    const content = sanitizePlainText(row.content, 8000)
    if (!title || !summary || !content) continue

    const updateId = idByStableKey.get(row.stableKey)!
    const matchedEvidence = publicEvidence.filter((e) => row.evidenceClaimTypes.includes(e.claimType))
    const evidenceIds = [...new Set(matchedEvidence.map((e) => e.evidenceId))].sort()
    if (row.evidenceClaimTypes.length > 0 && evidenceIds.length === 0) {
      warnings.push({
        reasonCode: 'EVIDENCE_UNRESOLVED',
        message: `No public evidence resolved for update ${row.stableKey}.`,
        updateId,
      })
    }

    const levels = matchedEvidence.map((e) => e.verificationLevel)
    const freshness = aggregateFreshness(matchedEvidence.map((e) => e.freshnessState))
    const verificationState = mapVerificationState(levels, evidenceIds.length, row.evidenceClaimTypes.length)

    const supersedesUpdate = row.supersedesStableKey ? idByStableKey.get(row.supersedesStableKey) ?? null : null
    if (row.supersedesStableKey && !supersedesUpdate) {
      warnings.push({
        reasonCode: 'SUPERSESSION_CHAIN',
        message: `Supersedes key ${row.supersedesStableKey} not resolved for ${row.stableKey}.`,
        updateId,
      })
    }

    const machineTags = row.machineTags
      .map(sanitizeTag)
      .filter((t): t is string => Boolean(t))
      .sort()

    const revision = buildUpdateRevision({
      updateId,
      status: row.status,
      updatedAt: row.updatedAt,
      contentFingerprint: contentFingerprint(title, summary, content),
      supersedesUpdate,
    })

    updates.push({
      updateId,
      projectId: input.document.projectId,
      version: sanitizePlainText(row.version, 32) ?? '0.0.0',
      publishedAt: row.publishedAt,
      updatedAt: row.updatedAt,
      authorType: row.authorType,
      authorIdentity: normalizeAuthorIdentity(row.authorIdentity),
      title,
      summary,
      content,
      category: row.category,
      affectedCapabilities: [...row.affectedCapabilities]
        .map((c) => sanitizePlainText(c, 64) ?? '')
        .filter(Boolean)
        .sort(),
      affectedDeployments: [...row.affectedDeployments]
        .map((c) => sanitizePlainText(c, 120) ?? '')
        .filter(Boolean)
        .sort(),
      affectedAssets: [...row.affectedAssets]
        .map((c) => sanitizePlainText(c, 160) ?? '')
        .filter(Boolean)
        .sort(),
      affectedContracts: [...row.affectedContracts]
        .map((c) => sanitizePlainText(c, 120)?.toLowerCase() ?? '')
        .filter(Boolean)
        .sort(),
      evidenceIds,
      provenance: {
        sourceClass: row.provenanceSourceClass,
        authorType: row.authorType,
        authorIdentity: normalizeAuthorIdentity(row.authorIdentity),
      },
      verification: {
        state: verificationState,
        evidenceIds,
        freshness,
        notes:
          evidenceIds.length === 0
            ? ['No public PP002 evidence attached — verification not invented.']
            : [`Resolved ${evidenceIds.length} public evidence record(s) via claim-type match.`],
      },
      visibility: 'PUBLIC',
      machineTags,
      revision,
      supersedesUpdate,
      status: row.status,
      stableKey: row.stableKey,
    })
  }

  updates.sort((a, b) => {
    const byTime = b.publishedAt.localeCompare(a.publishedAt)
    if (byTime !== 0) return byTime
    return a.updateId.localeCompare(b.updateId)
  })

  const categoriesPresent = [...new Set(updates.map((u) => u.category))].sort() as UpdateCategory[]
  const availability: UpdateAvailability = updates.length > 0 ? 'AVAILABLE' : 'NOT_APPLICABLE'
  if (updates.length === 0) {
    warnings.push({
      reasonCode: 'NO_PUBLIC_UPDATES',
      message: 'No public project updates are registered for this project.',
      updateId: null,
    })
  }

  const updatesRevision = revisionFromParts([
    input.document.revision,
    ...updates.map((u) => `${u.updateId}:${u.revision}:${u.status}`),
  ])

  return {
    schemaVersion: PROJECT_UPDATES_SCHEMA_VERSION,
    projectId: input.document.projectId,
    slug: input.document.slug,
    canonicalUrl: input.document.canonicalUrl,
    projectRevision: input.document.revision,
    updatesRevision,
    resolverRevision: UPDATES_RESOLVER_REVISION,
    generatedAt,
    updates,
    summary: {
      totalPublicUpdates: updates.length,
      latestPublishedAt: updates[0]?.publishedAt ?? null,
      categoriesPresent,
      activeCount: updates.filter((u) => u.status === 'ACTIVE').length,
      supersededCount: updates.filter((u) => u.status === 'SUPERSEDED').length,
      retractedCount: updates.filter((u) => u.status === 'RETRACTED').length,
      archivedCount: updates.filter((u) => u.status === 'ARCHIVED').length,
      updatesEndpoint: `/api/public/projects/${input.document.slug}/updates/`,
    },
    availability,
    warnings: warnings.sort((a, b) => a.reasonCode.localeCompare(b.reasonCode)),
    limitations: UPDATES_LIMITATIONS,
  }
}

export function toUpdatesSummaryForProjectApi(doc: ProjectUpdatesDocument): UpdatesSummaryForProjectApi {
  return {
    extension: PROJECT_PAGE_UPDATES_SUMMARY_EXTENSION,
    schemaVersion: doc.schemaVersion,
    totalPublicUpdates: doc.summary.totalPublicUpdates,
    latestPublishedAt: doc.summary.latestPublishedAt,
    categoriesPresent: doc.summary.categoriesPresent,
    endpoint: doc.summary.updatesEndpoint,
    revision: doc.updatesRevision,
  }
}

export function loadProjectUpdatesDocument(slug: string, generatedAt?: string): ProjectUpdatesDocument | null {
  const resolved = resolveProjectBySlug(slug)
  if (!resolved.ok) return null
  const at = generatedAt ?? new Date().toISOString()
  const loaded = loadProjectEvidencePack(resolved.slug, { generatedAt: at })
  if (!loaded) return null
  return buildProjectUpdatesDocument({
    project: resolved.project,
    document: loaded.document,
    evidencePack: loaded.evidencePack,
    generatedAt: at,
  })
}
