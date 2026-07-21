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
import { buildDeveloperResourceId } from '../developer/ids'
import { listDeveloperResourcesForSlug } from '../developer/registry.data'
import {
  CATEGORY_TO_GROWTH_GROUP,
  GROWTH_LIMITATIONS,
  GROWTH_RESOLVER_REVISION,
  PROJECT_GROWTH_SCHEMA_VERSION,
  PROJECT_PAGE_GROWTH_SUMMARY_EXTENSION,
  isCertifiedGrowthRoute,
  isGrowthProgramCategory,
  isGrowthProgramStatus,
  isGrowthProgramType,
  isGrowthRelationType,
  type GrowthAvailability,
  type GrowthProgramCategory,
  type GrowthProgramStatus,
} from './schema'
import { buildGrowthProgramId, buildGrowthProgramRevision, buildGrowthRelationId } from './ids'
import { listGrowthProgramsForSlug, listGrowthRelationsForSlug } from './registry.data'
import type {
  GrowthCategoryBucket,
  GrowthProgram,
  GrowthRelation,
  GrowthSummaryForProjectApi,
  GrowthWarning,
  ProjectGrowthDocument,
} from './types'

const LEVEL_RANK: Record<EvidenceVerificationLevel, number> = {
  NONE: 0,
  SOURCE_CONFIRMED: 1,
  CONTROL_CONFIRMED: 2,
  INDEPENDENTLY_VERIFIED: 3,
  MELEGA_VERIFIED: 4,
}

const STATUS_ORDER: Record<GrowthProgramStatus, number> = {
  ACTIVE: 0,
  BETA: 1,
  PREVIEW: 2,
  PLANNED: 3,
  ARCHIVED: 4,
  UNAVAILABLE: 5,
}

function revisionFromParts(parts: string[]): string {
  return fingerprint(parts.slice().sort().join('|'))
}

function mapAvailability(status: GrowthProgramStatus): GrowthAvailability {
  if (status === 'ACTIVE' || status === 'BETA' || status === 'PREVIEW') return 'AVAILABLE'
  if (status === 'UNAVAILABLE' || status === 'ARCHIVED') return 'UNAVAILABLE'
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

function resolveRelatedDeveloperIds(projectId: string, slug: string, stableKeys: string[]): string[] {
  const registry = listDeveloperResourcesForSlug(slug)
  const byKey = new Map(registry.map((r) => [r.stableKey, r]))
  const ids: string[] = []
  for (const key of stableKeys) {
    const row = byKey.get(key)
    if (!row) continue
    ids.push(
      buildDeveloperResourceId({
        projectId,
        stableKey: row.stableKey,
        category: row.category,
        version: row.version,
      }),
    )
  }
  return ids.sort()
}

/**
 * Shared Growth Hub resolver — public API and Project Page must use this.
 */
export function buildProjectGrowthDocument(input: {
  project: StaticProjectRecord
  document: CanonicalProjectDocument
  evidencePack: ProjectEvidencePack
  generatedAt?: string
}): ProjectGrowthDocument {
  const generatedAt = input.generatedAt ?? new Date().toISOString()
  const warnings: GrowthWarning[] = []
  const registryRows = listGrowthProgramsForSlug(input.document.slug)
  const publicEvidence = input.evidencePack.evidence.filter((e) => e.visibility === 'PUBLIC')
  const projectId = input.document.projectId
  const slug = input.document.slug

  const idByStableKey = new Map<string, string>()
  for (const row of registryRows) {
    if (
      !isGrowthProgramCategory(row.category) ||
      !isGrowthProgramType(row.type) ||
      !isGrowthProgramStatus(row.status)
    ) {
      continue
    }
    idByStableKey.set(
      row.stableKey,
      buildGrowthProgramId({
        projectId,
        stableKey: row.stableKey,
        category: row.category,
        type: row.type,
      }),
    )
  }

  const programs: GrowthProgram[] = []
  for (const row of registryRows) {
    if (!isGrowthProgramCategory(row.category)) {
      warnings.push({
        reasonCode: 'INVALID_CATEGORY_DROPPED',
        message: `Dropped program ${row.stableKey}: invalid category.`,
        programId: null,
      })
      continue
    }
    if (!isGrowthProgramType(row.type)) {
      warnings.push({
        reasonCode: 'INVALID_TYPE_DROPPED',
        message: `Dropped program ${row.stableKey}: invalid type.`,
        programId: null,
      })
      continue
    }
    if (!isGrowthProgramStatus(row.status)) {
      warnings.push({
        reasonCode: 'INVALID_STATUS_DROPPED',
        message: `Dropped program ${row.stableKey}: invalid status.`,
        programId: null,
      })
      continue
    }

    let route = row.route ? sanitizePlainText(row.route, 240) : null
    let externalUrl = row.externalUrl ? row.externalUrl.trim() : null
    if (route && !isCertifiedGrowthRoute(route)) {
      warnings.push({
        reasonCode: 'UNSAFE_ROUTE_DROPPED',
        message: `Dropped uncertified route for ${row.stableKey}.`,
        programId: idByStableKey.get(row.stableKey) ?? null,
      })
      route = null
    }
    if (externalUrl && !isSafeHttpUrl(externalUrl)) {
      warnings.push({
        reasonCode: 'UNSAFE_URL_DROPPED',
        message: `Dropped unsafe URL for ${row.stableKey}.`,
        programId: idByStableKey.get(row.stableKey) ?? null,
      })
      externalUrl = null
    }

    let status = row.status
    // Never invent ACTIVE without a live destination.
    if (status === 'ACTIVE' && !route && !externalUrl) {
      warnings.push({
        reasonCode: 'ACTIVE_WITHOUT_DESTINATION',
        message: `Downgraded ACTIVE for ${row.stableKey} — no certified destination.`,
        programId: idByStableKey.get(row.stableKey) ?? null,
      })
      status = 'UNAVAILABLE'
    }

    const title = sanitizePlainText(row.title, 160)
    const summary = sanitizePlainText(row.summary, 500)
    if (!title || !summary) continue

    const programId = idByStableKey.get(row.stableKey)!
    const matchedEvidence = publicEvidence.filter((e) => row.evidenceClaimTypes.includes(e.claimType))
    const evidenceIds = [...new Set(matchedEvidence.map((e) => e.evidenceId))].sort()
    if (row.evidenceClaimTypes.length > 0 && evidenceIds.length === 0) {
      warnings.push({
        reasonCode: 'EVIDENCE_UNRESOLVED',
        message: `No public evidence resolved for program ${row.stableKey}.`,
        programId,
      })
    }

    const levels = matchedEvidence.map((e) => e.verificationLevel)
    const freshness = aggregateFreshness(matchedEvidence.map((e) => e.freshnessState))
    const contentFingerprint = fingerprint([title, summary, route ?? '', externalUrl ?? '', status].join('\u001f'))
    const revision = buildGrowthProgramRevision({
      programId,
      status,
      route,
      externalUrl,
      updatedAt: row.updatedAt,
      contentFingerprint,
    })
    const openable =
      Boolean(route || externalUrl) &&
      (status === 'ACTIVE' || status === 'BETA' || status === 'PREVIEW' || status === 'PLANNED')

    programs.push({
      programId,
      projectId,
      category: row.category,
      type: row.type,
      group: CATEGORY_TO_GROWTH_GROUP[row.category],
      title,
      summary,
      status,
      availability: mapAvailability(status),
      lifecycle: status,
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
      evidence: evidenceIds,
      capabilities: [...row.capabilities].sort(),
      destination: { route, externalUrl, openable },
      supportedChains: [...row.supportedChains].sort((a, b) => a - b),
      relatedSectionIds: [...row.relatedSectionIds].sort(),
      relatedServiceIds: resolveRelatedServiceIds(projectId, slug, row.relatedServiceStableKeys),
      relatedUpdateIds: resolveRelatedUpdateIds(projectId, slug, row.relatedUpdateStableKeys),
      relatedDeveloperResourceIds: resolveRelatedDeveloperIds(projectId, slug, row.relatedDeveloperStableKeys),
      machineTags: row.machineTags
        .map(sanitizeTag)
        .filter((t): t is string => Boolean(t))
        .sort(),
      updatedAt: row.updatedAt,
      revision,
      stableKey: row.stableKey,
    })
  }

  programs.sort((a, b) => {
    const byStatus = STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
    if (byStatus !== 0) return byStatus
    const byCat = a.category.localeCompare(b.category)
    if (byCat !== 0) return byCat
    return a.title.localeCompare(b.title)
  })

  const relationships: GrowthRelation[] = []
  for (const edge of listGrowthRelationsForSlug(slug)) {
    if (!isGrowthRelationType(edge.relationType)) continue
    const fromProgramId = idByStableKey.get(edge.fromStableKey)
    const toProgramId = idByStableKey.get(edge.toStableKey)
    if (!fromProgramId || !toProgramId) {
      warnings.push({
        reasonCode: 'RELATION_TARGET_MISSING',
        message: `Relation ${edge.fromStableKey} -> ${edge.toStableKey} missing endpoint.`,
        programId: fromProgramId ?? toProgramId ?? null,
      })
      continue
    }
    relationships.push({
      relationId: buildGrowthRelationId({
        fromProgramId,
        toId: toProgramId,
        relationType: edge.relationType,
      }),
      fromProgramId,
      toId: toProgramId,
      relationType: edge.relationType,
    })
  }

  for (const program of programs) {
    for (const sectionId of program.relatedSectionIds) {
      const toId = `section:${sectionId}`
      relationships.push({
        relationId: buildGrowthRelationId({
          fromProgramId: program.programId,
          toId,
          relationType: 'LINKS_SECTION',
        }),
        fromProgramId: program.programId,
        toId,
        relationType: 'LINKS_SECTION',
      })
    }
    for (const serviceId of program.relatedServiceIds) {
      relationships.push({
        relationId: buildGrowthRelationId({
          fromProgramId: program.programId,
          toId: serviceId,
          relationType: 'LINKS_SERVICE',
        }),
        fromProgramId: program.programId,
        toId: serviceId,
        relationType: 'LINKS_SERVICE',
      })
    }
    for (const updateId of program.relatedUpdateIds) {
      relationships.push({
        relationId: buildGrowthRelationId({
          fromProgramId: program.programId,
          toId: updateId,
          relationType: 'LINKS_UPDATE',
        }),
        fromProgramId: program.programId,
        toId: updateId,
        relationType: 'LINKS_UPDATE',
      })
    }
    for (const developerId of program.relatedDeveloperResourceIds) {
      relationships.push({
        relationId: buildGrowthRelationId({
          fromProgramId: program.programId,
          toId: developerId,
          relationType: 'LINKS_DEVELOPER',
        }),
        fromProgramId: program.programId,
        toId: developerId,
        relationType: 'LINKS_DEVELOPER',
      })
    }
    for (const evidenceId of program.evidence) {
      relationships.push({
        relationId: buildGrowthRelationId({
          fromProgramId: program.programId,
          toId: evidenceId,
          relationType: 'LINKS_EVIDENCE',
        }),
        fromProgramId: program.programId,
        toId: evidenceId,
        relationType: 'LINKS_EVIDENCE',
      })
    }
  }
  relationships.sort((a, b) => a.relationId.localeCompare(b.relationId))

  const categoryCounts: Record<string, number> = {}
  const categoryBuckets = new Map<GrowthProgramCategory, GrowthCategoryBucket>()
  for (const program of programs) {
    categoryCounts[program.category] = (categoryCounts[program.category] ?? 0) + 1
    const existing = categoryBuckets.get(program.category)
    if (existing) {
      existing.count += 1
      if (program.status === 'ACTIVE') existing.activeCount += 1
    } else {
      categoryBuckets.set(program.category, {
        category: program.category,
        group: program.group,
        count: 1,
        activeCount: program.status === 'ACTIVE' ? 1 : 0,
      })
    }
  }

  if (programs.length === 0) {
    warnings.push({
      reasonCode: 'NO_PROGRAMS',
      message: 'No growth programs are registered for this project.',
      programId: null,
    })
  }

  const activeProgramCount = programs.filter((p) => p.status === 'ACTIVE').length
  const availability: GrowthAvailability = programs.length > 0 ? 'AVAILABLE' : 'NOT_APPLICABLE'
  const revision = revisionFromParts([
    input.document.revision,
    ...programs.map((p) => `${p.programId}:${p.revision}`),
    ...relationships.map((r) => r.relationId),
  ])

  return {
    schemaVersion: PROJECT_GROWTH_SCHEMA_VERSION,
    projectId,
    slug,
    canonicalUrl: input.document.canonicalUrl,
    projectRevision: input.document.revision,
    revision,
    resolverRevision: GROWTH_RESOLVER_REVISION,
    generatedAt,
    programs,
    relationships,
    categories: [...categoryBuckets.values()].sort((a, b) => a.category.localeCompare(b.category)),
    summary: {
      programCount: programs.length,
      activeProgramCount,
      categoryCounts,
      growthEndpoint: `/api/public/projects/${slug}/growth/`,
    },
    availability,
    warnings: warnings.sort((a, b) => a.reasonCode.localeCompare(b.reasonCode)),
    limitations: GROWTH_LIMITATIONS,
  }
}

export function toGrowthSummaryForProjectApi(doc: ProjectGrowthDocument): GrowthSummaryForProjectApi {
  return {
    extension: PROJECT_PAGE_GROWTH_SUMMARY_EXTENSION,
    schemaVersion: doc.schemaVersion,
    programCount: doc.summary.programCount,
    activeProgramCount: doc.summary.activeProgramCount,
    endpoint: doc.summary.growthEndpoint,
    revision: doc.revision,
  }
}

export function loadProjectGrowthDocument(slug: string, generatedAt?: string): ProjectGrowthDocument | null {
  const resolved = resolveProjectBySlug(slug)
  if (!resolved.ok) return null
  const at = generatedAt ?? new Date().toISOString()
  const loaded = loadProjectEvidencePack(resolved.slug, { generatedAt: at })
  if (!loaded) return null
  return buildProjectGrowthDocument({
    project: resolved.project,
    document: loaded.document,
    evidencePack: loaded.evidencePack,
    generatedAt: at,
  })
}
