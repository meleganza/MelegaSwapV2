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
import {
  CATEGORY_TO_GROUP,
  ECOSYSTEM_LIMITATIONS,
  ECOSYSTEM_RESOLVER_REVISION,
  PROJECT_ECOSYSTEM_SCHEMA_VERSION,
  PROJECT_PAGE_ECOSYSTEM_SUMMARY_EXTENSION,
  isCertifiedInternalRoute,
  isServiceCategory,
  isServiceLifecycle,
  isServiceRelationType,
  isServiceType,
  type ServiceAvailability,
  type ServiceCategory,
  type ServiceLifecycle,
} from './schema'
import { buildRelationId, buildServiceId, buildServiceRevision } from './ids'
import { listEcosystemRelationsForSlug, listEcosystemServicesForSlug } from './registry.data'
import type {
  EcosystemCategoryBucket,
  EcosystemRelation,
  EcosystemSummaryForProjectApi,
  EcosystemWarning,
  ProjectEcosystemDocument,
  ProjectService,
} from './types'

const LEVEL_RANK: Record<EvidenceVerificationLevel, number> = {
  NONE: 0,
  SOURCE_CONFIRMED: 1,
  CONTROL_CONFIRMED: 2,
  INDEPENDENTLY_VERIFIED: 3,
  MELEGA_VERIFIED: 4,
}

const LIFECYCLE_ORDER: Record<ServiceLifecycle, number> = {
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

function mapAvailability(lifecycle: ServiceLifecycle): ServiceAvailability {
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

/**
 * Shared Project Ecosystem resolver — public API and Project Page must use this.
 */
export function buildProjectEcosystemDocument(input: {
  project: StaticProjectRecord
  document: CanonicalProjectDocument
  evidencePack: ProjectEvidencePack
  generatedAt?: string
}): ProjectEcosystemDocument {
  const generatedAt = input.generatedAt ?? new Date().toISOString()
  const warnings: EcosystemWarning[] = []
  const registryRows = listEcosystemServicesForSlug(input.document.slug)
  const publicEvidence = input.evidencePack.evidence.filter((e) => e.visibility === 'PUBLIC')

  const idByStableKey = new Map<string, string>()
  for (const row of registryRows) {
    if (!isServiceCategory(row.category) || !isServiceType(row.type) || !isServiceLifecycle(row.lifecycle)) {
      continue
    }
    idByStableKey.set(
      row.stableKey,
      buildServiceId({
        projectId: input.document.projectId,
        stableKey: row.stableKey,
        category: row.category,
        type: row.type,
      }),
    )
  }

  const services: ProjectService[] = []
  for (const row of registryRows) {
    if (!isServiceCategory(row.category)) {
      warnings.push({
        reasonCode: 'INVALID_CATEGORY_DROPPED',
        message: `Dropped service ${row.stableKey}: invalid category.`,
        serviceId: null,
      })
      continue
    }
    if (!isServiceType(row.type)) {
      warnings.push({
        reasonCode: 'INVALID_TYPE_DROPPED',
        message: `Dropped service ${row.stableKey}: invalid type.`,
        serviceId: null,
      })
      continue
    }
    if (!isServiceLifecycle(row.lifecycle)) {
      warnings.push({
        reasonCode: 'INVALID_LIFECYCLE_DROPPED',
        message: `Dropped service ${row.stableKey}: invalid lifecycle.`,
        serviceId: null,
      })
      continue
    }

    let route = row.route ? sanitizePlainText(row.route, 240) : null
    let externalUrl = row.externalUrl ? row.externalUrl.trim() : null

    if (route && !isCertifiedInternalRoute(route)) {
      warnings.push({
        reasonCode: 'UNSAFE_ROUTE_DROPPED',
        message: `Dropped uncertified route for ${row.stableKey}.`,
        serviceId: idByStableKey.get(row.stableKey) ?? null,
      })
      route = null
    }
    if (externalUrl && !isSafeHttpUrl(externalUrl)) {
      warnings.push({
        reasonCode: 'UNSAFE_URL_DROPPED',
        message: `Dropped unsafe external URL for ${row.stableKey}.`,
        serviceId: idByStableKey.get(row.stableKey) ?? null,
      })
      externalUrl = null
    }

    const title = sanitizePlainText(row.title, 120)
    const summary = sanitizePlainText(row.summary, 400)
    if (!title || !summary) continue

    const serviceId = idByStableKey.get(row.stableKey)!
    const matchedEvidence = publicEvidence.filter((e) => row.evidenceClaimTypes.includes(e.claimType))
    const evidenceIds = [...new Set(matchedEvidence.map((e) => e.evidenceId))].sort()
    if (row.evidenceClaimTypes.length > 0 && evidenceIds.length === 0) {
      warnings.push({
        reasonCode: 'EVIDENCE_UNRESOLVED',
        message: `No public evidence resolved for service ${row.stableKey}.`,
        serviceId,
      })
    }

    const levels = matchedEvidence.map((e) => e.verificationLevel)
    const freshness = aggregateFreshness(matchedEvidence.map((e) => e.freshnessState))
    const contentFingerprint = fingerprint([title, summary, route ?? '', externalUrl ?? ''].join('\u001f'))
    const revision = buildServiceRevision({
      serviceId,
      lifecycle: row.lifecycle,
      route,
      externalUrl,
      updatedAt: row.updatedAt,
      contentFingerprint,
    })

    const relatedDocs = row.relatedDocumentationUrls.filter((u) => isSafeHttpUrl(u)).sort()
    const machineTags = row.machineTags
      .map(sanitizeTag)
      .filter((t): t is string => Boolean(t))
      .sort()

    services.push({
      serviceId,
      projectId: input.document.projectId,
      category: row.category,
      type: row.type,
      group: CATEGORY_TO_GROUP[row.category],
      title,
      summary,
      route,
      externalUrl,
      availability: mapAvailability(row.lifecycle),
      lifecycle: row.lifecycle,
      verification: {
        state: mapVerificationState(levels, evidenceIds.length, row.evidenceClaimTypes.length),
        evidenceIds,
        freshness,
        notes:
          evidenceIds.length === 0
            ? ['No public PP002 evidence attached — verification not invented.']
            : [`Resolved ${evidenceIds.length} public evidence record(s).`],
      },
      provenance: { sourceClass: row.provenanceSourceClass },
      evidenceIds,
      capabilities: [...row.capabilities].sort(),
      supportedChains: [...row.supportedChains].sort((a, b) => a - b),
      relatedSectionIds: [...row.relatedSectionIds].sort(),
      relatedUpdateIds: resolveRelatedUpdateIds(
        input.document.projectId,
        input.document.slug,
        row.relatedUpdateStableKeys,
      ),
      relatedDocumentationUrls: relatedDocs,
      machineTags,
      iconKey: sanitizePlainText(row.iconKey, 8)?.toUpperCase() ?? 'SVC',
      updatedAt: row.updatedAt,
      revision,
      stableKey: row.stableKey,
    })
  }

  services.sort((a, b) => {
    const byLife = LIFECYCLE_ORDER[a.lifecycle] - LIFECYCLE_ORDER[b.lifecycle]
    if (byLife !== 0) return byLife
    const byCat = a.category.localeCompare(b.category)
    if (byCat !== 0) return byCat
    return a.title.localeCompare(b.title)
  })

  const relationships: EcosystemRelation[] = []
  for (const edge of listEcosystemRelationsForSlug(input.document.slug)) {
    if (!isServiceRelationType(edge.relationType)) continue
    const fromServiceId = idByStableKey.get(edge.fromStableKey)
    const toServiceId = idByStableKey.get(edge.toStableKey)
    if (!fromServiceId || !toServiceId) {
      warnings.push({
        reasonCode: 'RELATION_TARGET_MISSING',
        message: `Relation ${edge.fromStableKey} -> ${edge.toStableKey} missing endpoint.`,
        serviceId: fromServiceId ?? toServiceId ?? null,
      })
      continue
    }
    relationships.push({
      relationId: buildRelationId({ fromServiceId, toServiceId, relationType: edge.relationType }),
      fromServiceId,
      toServiceId,
      relationType: edge.relationType,
    })
  }
  relationships.sort((a, b) => a.relationId.localeCompare(b.relationId))

  const categoryCounts: Record<string, number> = {}
  const groupCounts: Record<string, number> = {}
  const categoryBuckets = new Map<ServiceCategory, EcosystemCategoryBucket>()
  for (const svc of services) {
    categoryCounts[svc.category] = (categoryCounts[svc.category] ?? 0) + 1
    groupCounts[svc.group] = (groupCounts[svc.group] ?? 0) + 1
    const existing = categoryBuckets.get(svc.category)
    if (existing) {
      existing.count += 1
      if (svc.lifecycle === 'ACTIVE') existing.activeCount += 1
    } else {
      categoryBuckets.set(svc.category, {
        category: svc.category,
        group: svc.group,
        count: 1,
        activeCount: svc.lifecycle === 'ACTIVE' ? 1 : 0,
      })
    }
  }

  const availability: ServiceAvailability = services.length > 0 ? 'AVAILABLE' : 'NOT_APPLICABLE'
  if (services.length === 0) {
    warnings.push({
      reasonCode: 'NO_SERVICES',
      message: 'No ecosystem services are registered for this project.',
      serviceId: null,
    })
  }

  const ecosystemRevision = revisionFromParts([
    input.document.revision,
    ...services.map((s) => `${s.serviceId}:${s.revision}`),
    ...relationships.map((r) => r.relationId),
  ])

  return {
    schemaVersion: PROJECT_ECOSYSTEM_SCHEMA_VERSION,
    projectId: input.document.projectId,
    slug: input.document.slug,
    canonicalUrl: input.document.canonicalUrl,
    projectRevision: input.document.revision,
    ecosystemRevision,
    resolverRevision: ECOSYSTEM_RESOLVER_REVISION,
    generatedAt,
    services,
    relationships,
    categories: [...categoryBuckets.values()].sort((a, b) => a.category.localeCompare(b.category)),
    summary: {
      totalServices: services.length,
      activeServiceCount: services.filter((s) => s.lifecycle === 'ACTIVE').length,
      categoryCounts,
      groupCounts,
      ecosystemEndpoint: `/api/public/projects/${input.document.slug}/ecosystem/`,
    },
    availability,
    warnings: warnings.sort((a, b) => a.reasonCode.localeCompare(b.reasonCode)),
    limitations: ECOSYSTEM_LIMITATIONS,
  }
}

export function toEcosystemSummaryForProjectApi(doc: ProjectEcosystemDocument): EcosystemSummaryForProjectApi {
  return {
    extension: PROJECT_PAGE_ECOSYSTEM_SUMMARY_EXTENSION,
    schemaVersion: doc.schemaVersion,
    categoryCounts: doc.summary.categoryCounts,
    activeServiceCount: doc.summary.activeServiceCount,
    endpoint: doc.summary.ecosystemEndpoint,
    revision: doc.ecosystemRevision,
  }
}

export function loadProjectEcosystemDocument(slug: string, generatedAt?: string): ProjectEcosystemDocument | null {
  const resolved = resolveProjectBySlug(slug)
  if (!resolved.ok) return null
  const at = generatedAt ?? new Date().toISOString()
  const loaded = loadProjectEvidencePack(resolved.slug, { generatedAt: at })
  if (!loaded) return null
  return buildProjectEcosystemDocument({
    project: resolved.project,
    document: loaded.document,
    evidencePack: loaded.evidencePack,
    generatedAt: at,
  })
}
