import type { StaticProjectRecord } from '../../types'
import type { CanonicalProjectDocument } from '../types'
import type { ProjectEvidencePack } from '../evidence/types'
import type { EvidenceFreshnessState, EvidenceVerificationLevel } from '../evidence/schema'
import { resolveProjectBySlug } from '../resolveProject'
import { loadProjectEvidencePack } from '../evidence'
import { fingerprint } from '../evidence/evidenceId'
import { isSafeHttpUrl, sanitizePlainText } from '../urlSafety'
import { buildUpdateId } from '../updates/ids'
import { listRegistryUpdatesForSlug } from '../updates/registry.data'
import { buildServiceId } from '../ecosystem/ids'
import { listEcosystemServicesForSlug } from '../ecosystem/registry.data'
import {
  CATEGORY_TO_DEVELOPER_GROUP,
  DEVELOPER_LIMITATIONS,
  DEVELOPER_RESOLVER_REVISION,
  PROJECT_DEVELOPER_SCHEMA_VERSION,
  PROJECT_PAGE_DEVELOPER_SUMMARY_EXTENSION,
  isCertifiedDeveloperRoute,
  isDeveloperRelationType,
  isDeveloperResourceCategory,
  isDeveloperResourceLifecycle,
  isDeveloperResourceType,
  type DeveloperAvailability,
  type DeveloperResourceCategory,
  type DeveloperResourceLifecycle,
} from './schema'
import { buildDeveloperRelationId, buildDeveloperResourceId, buildDeveloperResourceRevision } from './ids'
import { listDeveloperRelationsForSlug, listDeveloperResourcesForSlug } from './registry.data'
import type {
  DeveloperCategoryBucket,
  DeveloperRelation,
  DeveloperResource,
  DeveloperSummaryForProjectApi,
  DeveloperWarning,
  ProjectDeveloperDocument,
} from './types'

const LEVEL_RANK: Record<EvidenceVerificationLevel, number> = {
  NONE: 0,
  SOURCE_CONFIRMED: 1,
  CONTROL_CONFIRMED: 2,
  INDEPENDENTLY_VERIFIED: 3,
  MELEGA_VERIFIED: 4,
}

const LIFECYCLE_ORDER: Record<DeveloperResourceLifecycle, number> = {
  ACTIVE: 0,
  BETA: 1,
  PREVIEW: 2,
  PLANNED: 3,
  DEPRECATED: 4,
  ARCHIVED: 5,
  UNAVAILABLE: 6,
}

function revisionFromParts(parts: string[]): string {
  return fingerprint(parts.slice().sort().join('|'))
}

function mapAvailability(lifecycle: DeveloperResourceLifecycle): DeveloperAvailability {
  if (lifecycle === 'ACTIVE' || lifecycle === 'BETA' || lifecycle === 'PREVIEW') return 'AVAILABLE'
  if (lifecycle === 'UNAVAILABLE' || lifecycle === 'DEPRECATED' || lifecycle === 'ARCHIVED') {
    return 'UNAVAILABLE'
  }
  return 'NOT_APPLICABLE'
}

function mapVerificationState(
  levels: EvidenceVerificationLevel[],
  resolvedCount: number,
  requestedCount: number,
): string {
  if (requestedCount === 0) return 'UNVERIFIED'
  if (resolvedCount === 0) return 'UNVERIFIED'
  const min = levels.reduce<EvidenceVerificationLevel>((acc, level) => {
    return LEVEL_RANK[level] < LEVEL_RANK[acc] ? level : acc
  }, 'MELEGA_VERIFIED')
  return min === 'NONE' ? 'NONE' : min
}

function aggregateFreshness(states: EvidenceFreshnessState[]): EvidenceFreshnessState {
  if (states.includes('EXPIRED')) return 'EXPIRED'
  if (states.includes('STALE')) return 'STALE'
  if (states.includes('CURRENT')) return 'CURRENT'
  return 'NONE'
}

function sanitizeTag(raw: string): string | null {
  const cleaned = sanitizePlainText(raw, 64)
  if (!cleaned) return null
  return cleaned
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9._-]/g, '')
}

function resolveRelatedUpdateIds(projectId: string, slug: string, stableKeys: string[]): string[] {
  const registry = listRegistryUpdatesForSlug(slug)
  const byKey = new Map(registry.map((u) => [u.stableKey, u]))
  const ids: string[] = []
  for (const key of stableKeys) {
    const row = byKey.get(key)
    if (!row) continue
    ids.push(
      buildUpdateId({
        projectId,
        stableKey: row.stableKey,
        version: row.version,
        publishedAt: row.publishedAt,
        category: row.category,
      }),
    )
  }
  return ids.sort()
}

function resolveRelatedServiceIds(projectId: string, slug: string, stableKeys: string[]): string[] {
  const registry = listEcosystemServicesForSlug(slug)
  const byKey = new Map(registry.map((s) => [s.stableKey, s]))
  const ids: string[] = []
  for (const key of stableKeys) {
    const row = byKey.get(key)
    if (!row) continue
    ids.push(
      buildServiceId({
        projectId,
        stableKey: row.stableKey,
        category: row.category,
        type: row.type,
      }),
    )
  }
  return ids.sort()
}

/**
 * Shared Developer Hub resolver — public API and Project Page must use this.
 */
export function buildProjectDeveloperDocument(input: {
  project: StaticProjectRecord
  document: CanonicalProjectDocument
  evidencePack: ProjectEvidencePack
  generatedAt?: string
}): ProjectDeveloperDocument {
  const generatedAt = input.generatedAt ?? new Date().toISOString()
  const warnings: DeveloperWarning[] = []
  const registryRows = listDeveloperResourcesForSlug(input.document.slug)
  const publicEvidence = input.evidencePack.evidence.filter((e) => e.visibility === 'PUBLIC')

  const idByStableKey = new Map<string, string>()
  for (const row of registryRows) {
    if (
      !isDeveloperResourceCategory(row.category) ||
      !isDeveloperResourceType(row.type) ||
      !isDeveloperResourceLifecycle(row.lifecycle)
    ) {
      continue
    }
    idByStableKey.set(
      row.stableKey,
      buildDeveloperResourceId({
        projectId: input.document.projectId,
        stableKey: row.stableKey,
        category: row.category,
        version: row.version,
      }),
    )
  }

  const resources: DeveloperResource[] = []
  for (const row of registryRows) {
    if (!isDeveloperResourceCategory(row.category)) {
      warnings.push({
        reasonCode: 'INVALID_CATEGORY_DROPPED',
        message: `Dropped resource ${row.stableKey}: invalid category.`,
        resourceId: null,
      })
      continue
    }
    if (!isDeveloperResourceType(row.type)) {
      warnings.push({
        reasonCode: 'INVALID_TYPE_DROPPED',
        message: `Dropped resource ${row.stableKey}: invalid type.`,
        resourceId: null,
      })
      continue
    }
    if (!isDeveloperResourceLifecycle(row.lifecycle)) {
      warnings.push({
        reasonCode: 'INVALID_LIFECYCLE_DROPPED',
        message: `Dropped resource ${row.stableKey}: invalid lifecycle.`,
        resourceId: null,
      })
      continue
    }

    let route = row.route ? sanitizePlainText(row.route, 320) : null
    let url = row.url ? row.url.trim() : null
    if (route && !isCertifiedDeveloperRoute(route)) {
      warnings.push({
        reasonCode: 'UNSAFE_ROUTE_DROPPED',
        message: `Dropped uncertified route for ${row.stableKey}.`,
        resourceId: idByStableKey.get(row.stableKey) ?? null,
      })
      route = null
    }
    if (url && !isSafeHttpUrl(url)) {
      warnings.push({
        reasonCode: 'UNSAFE_URL_DROPPED',
        message: `Dropped unsafe URL for ${row.stableKey}.`,
        resourceId: idByStableKey.get(row.stableKey) ?? null,
      })
      url = null
    }

    const title = sanitizePlainText(row.title, 160)
    const summary = sanitizePlainText(row.summary, 500)
    const version = sanitizePlainText(row.version, 32) ?? '0.0.0'
    if (!title || !summary) continue

    const resourceId = idByStableKey.get(row.stableKey)!
    const matchedEvidence = publicEvidence.filter((e) => row.evidenceClaimTypes.includes(e.claimType))
    const evidenceIds = [...new Set(matchedEvidence.map((e) => e.evidenceId))].sort()
    if (row.evidenceClaimTypes.length > 0 && evidenceIds.length === 0) {
      warnings.push({
        reasonCode: 'EVIDENCE_UNRESOLVED',
        message: `No public evidence resolved for resource ${row.stableKey}.`,
        resourceId,
      })
    }

    const levels = matchedEvidence.map((e) => e.verificationLevel)
    const freshness = aggregateFreshness(matchedEvidence.map((e) => e.freshnessState))
    const contentFingerprint = fingerprint(
      [title, summary, version, route ?? '', url ?? '', row.contractAddress ?? ''].join('\u001f'),
    )
    const revision = buildDeveloperResourceRevision({
      resourceId,
      lifecycle: row.lifecycle,
      version,
      url,
      route,
      updatedAt: row.updatedAt,
      contentFingerprint,
    })

    resources.push({
      resourceId,
      projectId: input.document.projectId,
      category: row.category,
      type: row.type,
      group: CATEGORY_TO_DEVELOPER_GROUP[row.category],
      title,
      summary,
      version,
      url,
      route,
      lifecycle: row.lifecycle,
      availability: mapAvailability(row.lifecycle),
      provenance: { sourceClass: row.provenanceSourceClass },
      verification: {
        state: mapVerificationState(levels, evidenceIds.length, row.evidenceClaimTypes.length),
        evidenceIds,
        freshness,
        notes:
          evidenceIds.length === 0
            ? ['No public PP002 evidence attached — verification not invented.']
            : [`Resolved ${evidenceIds.length} public evidence record(s).`],
      },
      evidenceIds,
      machineReadable: row.machineReadable,
      supportedChains: [...row.supportedChains].sort((a, b) => a - b),
      relatedSectionIds: [...row.relatedSectionIds].sort(),
      relatedServiceIds: resolveRelatedServiceIds(
        input.document.projectId,
        input.document.slug,
        row.relatedServiceStableKeys,
      ),
      relatedUpdateIds: resolveRelatedUpdateIds(
        input.document.projectId,
        input.document.slug,
        row.relatedUpdateStableKeys,
      ),
      contractAddress: row.contractAddress ? sanitizePlainText(row.contractAddress, 64)?.toLowerCase() ?? null : null,
      machineTags: row.machineTags
        .map(sanitizeTag)
        .filter((t): t is string => Boolean(t))
        .sort(),
      updatedAt: row.updatedAt,
      revision,
      stableKey: row.stableKey,
    })
  }

  resources.sort((a, b) => {
    const byLife = LIFECYCLE_ORDER[a.lifecycle] - LIFECYCLE_ORDER[b.lifecycle]
    if (byLife !== 0) return byLife
    const byCat = a.category.localeCompare(b.category)
    if (byCat !== 0) return byCat
    return a.title.localeCompare(b.title)
  })

  const relationships: DeveloperRelation[] = []
  for (const edge of listDeveloperRelationsForSlug(input.document.slug)) {
    if (!isDeveloperRelationType(edge.relationType)) continue
    const fromResourceId = idByStableKey.get(edge.fromStableKey)
    const toResourceId = idByStableKey.get(edge.toStableKey)
    if (!fromResourceId || !toResourceId) {
      warnings.push({
        reasonCode: 'RELATION_TARGET_MISSING',
        message: `Relation ${edge.fromStableKey} -> ${edge.toStableKey} missing endpoint.`,
        resourceId: fromResourceId ?? toResourceId ?? null,
      })
      continue
    }
    relationships.push({
      relationId: buildDeveloperRelationId({
        fromResourceId,
        toResourceId,
        relationType: edge.relationType,
      }),
      fromResourceId,
      toResourceId,
      relationType: edge.relationType,
    })
  }
  relationships.sort((a, b) => a.relationId.localeCompare(b.relationId))

  const categoryCounts: Record<string, number> = {}
  const resourceCounts: Record<string, number> = {}
  const categoryBuckets = new Map<DeveloperResourceCategory, DeveloperCategoryBucket>()
  for (const res of resources) {
    categoryCounts[res.category] = (categoryCounts[res.category] ?? 0) + 1
    resourceCounts[res.group] = (resourceCounts[res.group] ?? 0) + 1
    const existing = categoryBuckets.get(res.category)
    if (existing) {
      existing.count += 1
      if (res.lifecycle === 'ACTIVE') existing.activeCount += 1
    } else {
      categoryBuckets.set(res.category, {
        category: res.category,
        group: res.group,
        count: 1,
        activeCount: res.lifecycle === 'ACTIVE' ? 1 : 0,
      })
    }
  }

  const availability: DeveloperAvailability = resources.length > 0 ? 'AVAILABLE' : 'NOT_APPLICABLE'
  if (resources.length === 0) {
    warnings.push({
      reasonCode: 'NO_RESOURCES',
      message: 'No developer resources are registered for this project.',
      resourceId: null,
    })
  }

  const developerRevision = revisionFromParts([
    input.document.revision,
    ...resources.map((r) => `${r.resourceId}:${r.revision}`),
    ...relationships.map((r) => r.relationId),
  ])

  return {
    schemaVersion: PROJECT_DEVELOPER_SCHEMA_VERSION,
    projectId: input.document.projectId,
    slug: input.document.slug,
    canonicalUrl: input.document.canonicalUrl,
    projectRevision: input.document.revision,
    developerRevision,
    resolverRevision: DEVELOPER_RESOLVER_REVISION,
    generatedAt,
    resources,
    relationships,
    categories: [...categoryBuckets.values()].sort((a, b) => a.category.localeCompare(b.category)),
    summary: {
      totalResources: resources.length,
      activeResourceCount: resources.filter((r) => r.lifecycle === 'ACTIVE').length,
      resourceCounts,
      categoryCounts,
      developerEndpoint: `/api/public/projects/${input.document.slug}/developer/`,
    },
    availability,
    warnings: warnings.sort((a, b) => a.reasonCode.localeCompare(b.reasonCode)),
    limitations: DEVELOPER_LIMITATIONS,
  }
}

export function toDeveloperSummaryForProjectApi(doc: ProjectDeveloperDocument): DeveloperSummaryForProjectApi {
  return {
    extension: PROJECT_PAGE_DEVELOPER_SUMMARY_EXTENSION,
    schemaVersion: doc.schemaVersion,
    resourceCounts: doc.summary.resourceCounts,
    categoryCounts: doc.summary.categoryCounts,
    endpoint: doc.summary.developerEndpoint,
    revision: doc.developerRevision,
  }
}

export function loadProjectDeveloperDocument(slug: string, generatedAt?: string): ProjectDeveloperDocument | null {
  const resolved = resolveProjectBySlug(slug)
  if (!resolved.ok) return null
  const at = generatedAt ?? new Date().toISOString()
  const loaded = loadProjectEvidencePack(resolved.slug, { generatedAt: at })
  if (!loaded) return null
  return buildProjectDeveloperDocument({
    project: resolved.project,
    document: loaded.document,
    evidencePack: loaded.evidencePack,
    generatedAt: at,
  })
}
