import type { StaticProjectRecord } from '../../types'
import type { CanonicalProjectDocument } from '../types'
import type { ProjectEvidencePack } from '../evidence/types'
import type { EvidenceFreshnessState, EvidenceVerificationLevel } from '../evidence/schema'
import { resolveProjectBySlug } from '../resolveProject'
import { loadProjectEvidencePack } from '../evidence'
import { fingerprint } from '../evidence/evidenceId'
import { normalizeEvmAddress, toCaip10Contract } from '../caip'
import { isSafeHttpUrl, sanitizePlainText } from '../urlSafety'
import { buildUpdateId } from '../updates/ids'
import { listRegistryUpdatesForSlug } from '../updates/registry.data'
import { buildServiceId } from '../ecosystem/ids'
import { listEcosystemServicesForSlug } from '../ecosystem/registry.data'
import { buildDeveloperResourceId } from '../developer/ids'
import { listDeveloperResourcesForSlug } from '../developer/registry.data'
import {
  GOVERNANCE_LIMITATIONS,
  GOVERNANCE_RESOLVER_REVISION,
  PROJECT_GOVERNANCE_SCHEMA_VERSION,
  PROJECT_PAGE_GOVERNANCE_SUMMARY_EXTENSION,
  isDisclosureLevel,
  isGovernanceLifecycle,
  isGovernanceModel,
  isGovernanceRelationType,
  isGovernanceResourceKind,
  isOwnerModel,
  isProxyModel,
  isTimelockModel,
  isTreasuryLifecycle,
  isTreasuryType,
  isUpgradeabilityModel,
  type DisclosureLevel,
  type GovernanceAvailability,
  type GovernanceLifecycle,
} from './schema'
import {
  buildGovernanceEntityRevision,
  buildGovernanceId,
  buildGovernanceRelationId,
  buildGovernanceResourceId,
  buildOwnershipId,
  buildTreasuryId,
  buildUpgradeabilityId,
} from './ids'
import {
  listGovernanceRecordsForSlug,
  listGovernanceRelationsForSlug,
  listGovernanceResourcesForSlug,
  listOwnershipRecordsForSlug,
  listTreasuryRecordsForSlug,
  listUpgradeabilityRecordsForSlug,
} from './registry.data'
import type {
  GovernanceEntity,
  GovernanceRelation,
  GovernanceResource,
  GovernanceSummaryForProjectApi,
  GovernanceVerification,
  GovernanceWarning,
  OwnershipEntity,
  ProjectGovernanceDocument,
  TreasuryEntity,
  UpgradeabilityEntity,
} from './types'

const LEVEL_RANK: Record<EvidenceVerificationLevel, number> = {
  NONE: 0,
  SOURCE_CONFIRMED: 1,
  CONTROL_CONFIRMED: 2,
  INDEPENDENTLY_VERIFIED: 3,
  MELEGA_VERIFIED: 4,
}

const DISCLOSURE_RANK: Record<DisclosureLevel, number> = {
  PUBLIC_VERIFIED: 4,
  PUBLIC_DECLARED: 3,
  PARTIAL: 2,
  UNKNOWN: 1,
  UNAVAILABLE: 0,
}

function revisionFromParts(parts: string[]): string {
  return fingerprint(parts.slice().sort().join('|'))
}

function mapLifecycleAvailability(lifecycle: GovernanceLifecycle): GovernanceAvailability {
  if (lifecycle === 'ACTIVE' || lifecycle === 'DECLARED') return 'AVAILABLE'
  if (lifecycle === 'UNAVAILABLE' || lifecycle === 'ARCHIVED') return 'UNAVAILABLE'
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

function resolveEvidence(
  pack: ProjectEvidencePack,
  claimTypes: string[],
): { evidenceIds: string[]; levels: EvidenceVerificationLevel[]; freshness: EvidenceFreshnessState[] } {
  const publicEvidence = pack.evidence.filter((e) => e.visibility === 'PUBLIC')
  const matched = publicEvidence.filter((e) => claimTypes.includes(e.claimType))
  return {
    evidenceIds: [...new Set(matched.map((e) => e.evidenceId))].sort(),
    levels: matched.map((e) => e.verificationLevel),
    freshness: matched.map((e) => e.freshnessState),
  }
}

function buildVerification(pack: ProjectEvidencePack, claimTypes: string[]): GovernanceVerification {
  const resolved = resolveEvidence(pack, claimTypes)
  return {
    state: mapVerificationState(resolved.levels, resolved.evidenceIds.length, claimTypes.length),
    evidenceIds: resolved.evidenceIds,
    freshness: aggregateFreshness(resolved.freshness),
    notes:
      claimTypes.length === 0
        ? ['No evidence claim types requested — verification not invented.']
        : resolved.evidenceIds.length === 0
        ? ['No public PP002 evidence attached — verification not invented.']
        : [`Resolved ${resolved.evidenceIds.length} public evidence record(s).`],
  }
}

function normalizeDisclosure(
  level: DisclosureLevel,
  verification: GovernanceVerification,
  warnings: GovernanceWarning[],
  entityId: string,
): DisclosureLevel {
  // Never invent PUBLIC_VERIFIED without independently verified evidence.
  if (level === 'PUBLIC_VERIFIED') {
    const independentlyVerified =
      verification.state === 'INDEPENDENTLY_VERIFIED' || verification.state === 'MELEGA_VERIFIED'
    if (!independentlyVerified || verification.evidenceIds.length === 0) {
      warnings.push({
        reasonCode: 'PUBLIC_VERIFIED_FORBIDDEN_WITHOUT_EVIDENCE',
        message: `Downgraded PUBLIC_VERIFIED for ${entityId} — independent evidence required.`,
        entityId,
      })
      return verification.evidenceIds.length > 0 ? 'PUBLIC_DECLARED' : 'UNKNOWN'
    }
  }
  return level
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

function aggregateDisclosure(levels: DisclosureLevel[]): DisclosureLevel {
  if (levels.length === 0) return 'UNAVAILABLE'
  return levels.reduce((best, level) => (DISCLOSURE_RANK[level] > DISCLOSURE_RANK[best] ? level : best))
}

/**
 * Shared Governance & Treasury Transparency resolver — public API and Project Page must use this.
 */
export function buildProjectGovernanceDocument(input: {
  project: StaticProjectRecord
  document: CanonicalProjectDocument
  evidencePack: ProjectEvidencePack
  generatedAt?: string
}): ProjectGovernanceDocument {
  const generatedAt = input.generatedAt ?? new Date().toISOString()
  const warnings: GovernanceWarning[] = []
  const slug = input.document.slug
  const projectId = input.document.projectId
  const idByStableKey = new Map<string, string>()

  // Pre-compute IDs
  for (const row of listGovernanceRecordsForSlug(slug)) {
    if (!isGovernanceModel(row.governanceModel)) continue
    idByStableKey.set(
      row.stableKey,
      buildGovernanceId({
        projectId,
        stableKey: row.stableKey,
        governanceModel: row.governanceModel,
      }),
    )
  }
  for (const row of listTreasuryRecordsForSlug(slug)) {
    if (!isTreasuryType(row.treasuryType)) continue
    idByStableKey.set(
      row.stableKey,
      buildTreasuryId({
        projectId,
        stableKey: row.stableKey,
        treasuryType: row.treasuryType,
        chainId: row.chainId,
      }),
    )
  }
  for (const row of listOwnershipRecordsForSlug(slug)) {
    if (!isOwnerModel(row.ownerModel)) continue
    idByStableKey.set(
      row.stableKey,
      buildOwnershipId({ projectId, stableKey: row.stableKey, ownerModel: row.ownerModel }),
    )
  }
  for (const row of listUpgradeabilityRecordsForSlug(slug)) {
    if (!isUpgradeabilityModel(row.upgradeability)) continue
    idByStableKey.set(
      row.stableKey,
      buildUpgradeabilityId({
        projectId,
        stableKey: row.stableKey,
        upgradeability: row.upgradeability,
      }),
    )
  }
  for (const row of listGovernanceResourcesForSlug(slug)) {
    if (!isGovernanceResourceKind(row.kind)) continue
    idByStableKey.set(row.stableKey, buildGovernanceResourceId({ projectId, stableKey: row.stableKey, kind: row.kind }))
  }

  const governance: GovernanceEntity[] = []
  for (const row of listGovernanceRecordsForSlug(slug)) {
    if (!isGovernanceModel(row.governanceModel)) {
      warnings.push({
        reasonCode: 'INVALID_MODEL_DROPPED',
        message: `Dropped governance ${row.stableKey}: invalid model.`,
        entityId: null,
      })
      continue
    }
    if (!isGovernanceLifecycle(row.lifecycle)) {
      warnings.push({
        reasonCode: 'INVALID_LIFECYCLE_DROPPED',
        message: `Dropped governance ${row.stableKey}: invalid lifecycle.`,
        entityId: null,
      })
      continue
    }
    const summary = sanitizePlainText(row.summary, 600)
    if (!summary) continue
    const governanceId = idByStableKey.get(row.stableKey)!
    const verification = buildVerification(input.evidencePack, row.evidenceClaimTypes)
    if (row.evidenceClaimTypes.length > 0 && verification.evidenceIds.length === 0) {
      warnings.push({
        reasonCode: 'EVIDENCE_UNRESOLVED',
        message: `No public evidence resolved for governance ${row.stableKey}.`,
        entityId: governanceId,
      })
    }
    const resourceIds = listGovernanceResourcesForSlug(slug)
      .map((r) => idByStableKey.get(r.stableKey))
      .filter((id): id is string => Boolean(id))
      .sort()
    const contentFingerprint = fingerprint(
      [row.governanceModel, summary, row.lifecycle, resourceIds.join(',')].join('\u001f'),
    )
    governance.push({
      governanceId,
      projectId,
      governanceModel: row.governanceModel,
      lifecycle: row.lifecycle,
      availability: mapLifecycleAvailability(row.lifecycle),
      provenance: { sourceClass: row.provenanceSourceClass },
      verification,
      evidence: verification.evidenceIds,
      governanceResources: resourceIds,
      governanceContracts: [...row.governanceContractRefs]
        .map((c) => normalizeEvmAddress(c) ?? sanitizePlainText(c, 80))
        .filter((c): c is string => Boolean(c))
        .sort(),
      governanceCapabilities: [...row.governanceCapabilities].sort(),
      supportedChains: [...row.supportedChains].sort((a, b) => a - b),
      summary,
      machineTags: row.machineTags
        .map(sanitizeTag)
        .filter((t): t is string => Boolean(t))
        .sort(),
      updatedAt: row.updatedAt,
      revision: buildGovernanceEntityRevision({
        entityId: governanceId,
        lifecycle: row.lifecycle,
        updatedAt: row.updatedAt,
        contentFingerprint,
      }),
      stableKey: row.stableKey,
    })
  }
  governance.sort((a, b) => a.governanceId.localeCompare(b.governanceId))

  const treasury: TreasuryEntity[] = []
  for (const row of listTreasuryRecordsForSlug(slug)) {
    if (!isTreasuryType(row.treasuryType)) {
      warnings.push({
        reasonCode: 'INVALID_TREASURY_TYPE_DROPPED',
        message: `Dropped treasury ${row.stableKey}: invalid type.`,
        entityId: null,
      })
      continue
    }
    if (!isDisclosureLevel(row.disclosureLevel) || !isTreasuryLifecycle(row.lifecycle)) {
      warnings.push({
        reasonCode: 'INVALID_DISCLOSURE_DROPPED',
        message: `Dropped treasury ${row.stableKey}: invalid disclosure or lifecycle.`,
        entityId: null,
      })
      continue
    }
    const summary = sanitizePlainText(row.summary, 600)
    if (!summary) continue
    const treasuryId = idByStableKey.get(row.stableKey)!
    let address: string | null = null
    if (row.walletAddress) {
      address = normalizeEvmAddress(row.walletAddress)
      if (!address) {
        warnings.push({
          reasonCode: 'INVALID_WALLET_DROPPED',
          message: `Dropped invalid wallet for treasury ${row.stableKey}.`,
          entityId: treasuryId,
        })
      }
    }
    const caip10 = address && row.chainId != null ? toCaip10Contract(row.chainId, address) : null
    const verification = buildVerification(input.evidencePack, row.evidenceClaimTypes)
    const disclosureLevel = normalizeDisclosure(row.disclosureLevel, verification, warnings, treasuryId)
    const contentFingerprint = fingerprint(
      [row.treasuryType, disclosureLevel, address ?? '', String(row.chainId ?? ''), summary].join('\u001f'),
    )
    treasury.push({
      treasuryId,
      projectId,
      treasuryType: row.treasuryType,
      walletReference: {
        caip10,
        address,
        chainId: row.chainId,
      },
      disclosureLevel,
      provenance: { sourceClass: row.provenanceSourceClass },
      verification,
      evidence: verification.evidenceIds,
      lifecycle: row.lifecycle,
      supportedChains: row.chainId != null ? [row.chainId] : [],
      summary,
      machineTags: row.machineTags
        .map(sanitizeTag)
        .filter((t): t is string => Boolean(t))
        .sort(),
      updatedAt: row.updatedAt,
      revision: buildGovernanceEntityRevision({
        entityId: treasuryId,
        lifecycle: row.lifecycle,
        updatedAt: row.updatedAt,
        contentFingerprint,
      }),
      stableKey: row.stableKey,
    })
  }
  treasury.sort((a, b) => a.treasuryId.localeCompare(b.treasuryId))

  const ownership: OwnershipEntity[] = []
  for (const row of listOwnershipRecordsForSlug(slug)) {
    if (!isOwnerModel(row.ownerModel) || !isProxyModel(row.proxyModel) || !isTimelockModel(row.timelockModel)) {
      continue
    }
    const summary = sanitizePlainText(row.summary, 600)
    const subjectLabel = sanitizePlainText(row.subjectLabel, 120)
    if (!summary || !subjectLabel) continue
    const ownershipId = idByStableKey.get(row.stableKey)!
    const verification = buildVerification(input.evidencePack, row.evidenceClaimTypes)
    const contractAddress = row.contractAddress ? normalizeEvmAddress(row.contractAddress) : null
    const contentFingerprint = fingerprint(
      [row.ownerModel, row.proxyModel, row.timelockModel, subjectLabel, summary].join('\u001f'),
    )
    ownership.push({
      ownershipId,
      projectId,
      ownerModel: row.ownerModel,
      proxyModel: row.proxyModel,
      timelockModel: row.timelockModel,
      subjectLabel,
      summary,
      contractAddress,
      chainId: row.chainId,
      provenance: { sourceClass: row.provenanceSourceClass },
      verification,
      evidence: verification.evidenceIds,
      relatedSectionIds: [...row.relatedSectionIds].sort(),
      relatedDeveloperResourceIds: resolveRelatedDeveloperIds(projectId, slug, row.relatedDeveloperStableKeys),
      machineTags: row.machineTags
        .map(sanitizeTag)
        .filter((t): t is string => Boolean(t))
        .sort(),
      updatedAt: row.updatedAt,
      revision: buildGovernanceEntityRevision({
        entityId: ownershipId,
        lifecycle: 'DECLARED',
        updatedAt: row.updatedAt,
        contentFingerprint,
      }),
      stableKey: row.stableKey,
    })
  }
  ownership.sort((a, b) => a.ownershipId.localeCompare(b.ownershipId))

  const upgradeability: UpgradeabilityEntity[] = []
  for (const row of listUpgradeabilityRecordsForSlug(slug)) {
    if (!isUpgradeabilityModel(row.upgradeability)) continue
    const summary = sanitizePlainText(row.summary, 600)
    const subjectLabel = sanitizePlainText(row.subjectLabel, 120)
    if (!summary || !subjectLabel) continue
    const upgradeabilityId = idByStableKey.get(row.stableKey)!
    const verification = buildVerification(input.evidencePack, row.evidenceClaimTypes)
    const contractAddress = row.contractAddress ? normalizeEvmAddress(row.contractAddress) : null
    const contentFingerprint = fingerprint(
      [row.upgradeability, subjectLabel, summary, contractAddress ?? ''].join('\u001f'),
    )
    upgradeability.push({
      upgradeabilityId,
      projectId,
      upgradeability: row.upgradeability,
      subjectLabel,
      summary,
      contractAddress,
      chainId: row.chainId,
      provenance: { sourceClass: row.provenanceSourceClass },
      verification,
      evidence: verification.evidenceIds,
      relatedSectionIds: [...row.relatedSectionIds].sort(),
      relatedDeveloperResourceIds: resolveRelatedDeveloperIds(projectId, slug, row.relatedDeveloperStableKeys),
      machineTags: row.machineTags
        .map(sanitizeTag)
        .filter((t): t is string => Boolean(t))
        .sort(),
      updatedAt: row.updatedAt,
      revision: buildGovernanceEntityRevision({
        entityId: upgradeabilityId,
        lifecycle: 'DECLARED',
        updatedAt: row.updatedAt,
        contentFingerprint,
      }),
      stableKey: row.stableKey,
    })
  }
  upgradeability.sort((a, b) => a.upgradeabilityId.localeCompare(b.upgradeabilityId))

  const resources: GovernanceResource[] = []
  for (const row of listGovernanceResourcesForSlug(slug)) {
    if (!isGovernanceResourceKind(row.kind) || !isGovernanceLifecycle(row.lifecycle)) continue
    const title = sanitizePlainText(row.title, 160)
    const summary = sanitizePlainText(row.summary, 500)
    if (!title || !summary) continue
    const resourceId = idByStableKey.get(row.stableKey)!
    let route = row.route ? sanitizePlainText(row.route, 320) : null
    let url = row.url ? row.url.trim() : null
    if (url && !isSafeHttpUrl(url)) {
      warnings.push({
        reasonCode: 'UNSAFE_URL_DROPPED',
        message: `Dropped unsafe URL for resource ${row.stableKey}.`,
        entityId: resourceId,
      })
      url = null
    }
    if (route && !route.startsWith('/')) {
      warnings.push({
        reasonCode: 'UNSAFE_URL_DROPPED',
        message: `Dropped unsafe route for resource ${row.stableKey}.`,
        entityId: resourceId,
      })
      route = null
    }
    const verification = buildVerification(input.evidencePack, row.evidenceClaimTypes)
    const contentFingerprint = fingerprint([title, summary, route ?? '', url ?? ''].join('\u001f'))
    resources.push({
      resourceId,
      projectId,
      kind: row.kind,
      title,
      summary,
      url,
      route,
      lifecycle: row.lifecycle,
      availability: mapLifecycleAvailability(row.lifecycle),
      provenance: { sourceClass: row.provenanceSourceClass },
      verification,
      evidence: verification.evidenceIds,
      relatedSectionIds: [...row.relatedSectionIds].sort(),
      machineTags: row.machineTags
        .map(sanitizeTag)
        .filter((t): t is string => Boolean(t))
        .sort(),
      updatedAt: row.updatedAt,
      revision: buildGovernanceEntityRevision({
        entityId: resourceId,
        lifecycle: row.lifecycle,
        updatedAt: row.updatedAt,
        contentFingerprint,
      }),
      stableKey: row.stableKey,
    })
  }
  resources.sort((a, b) => a.resourceId.localeCompare(b.resourceId))

  // Attach cross-module relationship IDs onto primary governance for machine readability
  for (const gov of governance) {
    const row = listGovernanceRecordsForSlug(slug).find((r) => r.stableKey === gov.stableKey)
    if (!row) continue
    // related service/update/developer ids are exposed via relationships graph below
    void resolveRelatedServiceIds(projectId, slug, row.relatedServiceStableKeys)
    void resolveRelatedUpdateIds(projectId, slug, row.relatedUpdateStableKeys)
    void resolveRelatedDeveloperIds(projectId, slug, row.relatedDeveloperStableKeys)
  }

  const relationships: GovernanceRelation[] = []
  for (const edge of listGovernanceRelationsForSlug(slug)) {
    if (!isGovernanceRelationType(edge.relationType)) continue
    const fromId = idByStableKey.get(edge.fromStableKey)
    const toId = idByStableKey.get(edge.toStableKey)
    if (!fromId || !toId) {
      warnings.push({
        reasonCode: 'RELATION_TARGET_MISSING',
        message: `Relation ${edge.fromStableKey} -> ${edge.toStableKey} missing endpoint.`,
        entityId: fromId ?? toId ?? null,
      })
      continue
    }
    relationships.push({
      relationId: buildGovernanceRelationId({
        fromId,
        toId,
        relationType: edge.relationType,
      }),
      fromId,
      toId,
      relationType: edge.relationType,
    })
  }

  // Explicit cross-module links (stable, deterministic)
  for (const row of listGovernanceRecordsForSlug(slug)) {
    const fromId = idByStableKey.get(row.stableKey)
    if (!fromId) continue
    for (const sectionId of row.relatedSectionIds) {
      const toId = `section:${sectionId}`
      relationships.push({
        relationId: buildGovernanceRelationId({
          fromId,
          toId,
          relationType: 'LINKS_SECTION',
        }),
        fromId,
        toId,
        relationType: 'LINKS_SECTION',
      })
    }
    for (const serviceId of resolveRelatedServiceIds(projectId, slug, row.relatedServiceStableKeys)) {
      relationships.push({
        relationId: buildGovernanceRelationId({
          fromId,
          toId: serviceId,
          relationType: 'LINKS_SERVICE',
        }),
        fromId,
        toId: serviceId,
        relationType: 'LINKS_SERVICE',
      })
    }
    for (const updateId of resolveRelatedUpdateIds(projectId, slug, row.relatedUpdateStableKeys)) {
      relationships.push({
        relationId: buildGovernanceRelationId({
          fromId,
          toId: updateId,
          relationType: 'LINKS_UPDATE',
        }),
        fromId,
        toId: updateId,
        relationType: 'LINKS_UPDATE',
      })
    }
    for (const developerId of resolveRelatedDeveloperIds(projectId, slug, row.relatedDeveloperStableKeys)) {
      relationships.push({
        relationId: buildGovernanceRelationId({
          fromId,
          toId: developerId,
          relationType: 'LINKS_DEVELOPER',
        }),
        fromId,
        toId: developerId,
        relationType: 'LINKS_DEVELOPER',
      })
    }
    for (const evidenceId of buildVerification(input.evidencePack, row.evidenceClaimTypes).evidenceIds) {
      relationships.push({
        relationId: buildGovernanceRelationId({
          fromId,
          toId: evidenceId,
          relationType: 'LINKS_EVIDENCE',
        }),
        fromId,
        toId: evidenceId,
        relationType: 'LINKS_EVIDENCE',
      })
    }
  }
  relationships.sort((a, b) => a.relationId.localeCompare(b.relationId))

  if (governance.length === 0) {
    warnings.push({
      reasonCode: 'NO_GOVERNANCE_DECLARED',
      message: 'No governance entities are registered for this project.',
      entityId: null,
    })
  }

  const primaryModel = governance[0]?.governanceModel ?? 'UNKNOWN'
  const disclosureState = aggregateDisclosure(treasury.map((t) => t.disclosureLevel))
  const availability: GovernanceAvailability =
    governance.length + treasury.length + resources.length > 0 ? 'AVAILABLE' : 'NOT_APPLICABLE'

  const revision = revisionFromParts([
    input.document.revision,
    ...governance.map((g) => `${g.governanceId}:${g.revision}`),
    ...treasury.map((t) => `${t.treasuryId}:${t.revision}`),
    ...ownership.map((o) => `${o.ownershipId}:${o.revision}`),
    ...upgradeability.map((u) => `${u.upgradeabilityId}:${u.revision}`),
    ...resources.map((r) => `${r.resourceId}:${r.revision}`),
    ...relationships.map((r) => r.relationId),
  ])

  return {
    schemaVersion: PROJECT_GOVERNANCE_SCHEMA_VERSION,
    projectId,
    slug,
    canonicalUrl: input.document.canonicalUrl,
    projectRevision: input.document.revision,
    revision,
    resolverRevision: GOVERNANCE_RESOLVER_REVISION,
    generatedAt,
    governance,
    treasury,
    ownership,
    upgradeability,
    resources,
    relationships,
    summary: {
      governanceModel: primaryModel,
      disclosureState,
      treasuryCount: treasury.length,
      ownershipCount: ownership.length,
      upgradeabilityCount: upgradeability.length,
      resourceCount: resources.length,
      governanceEndpoint: `/api/public/projects/${slug}/governance/`,
    },
    availability,
    warnings: warnings.sort((a, b) => a.reasonCode.localeCompare(b.reasonCode)),
    limitations: GOVERNANCE_LIMITATIONS,
  }
}

export function toGovernanceSummaryForProjectApi(doc: ProjectGovernanceDocument): GovernanceSummaryForProjectApi {
  return {
    extension: PROJECT_PAGE_GOVERNANCE_SUMMARY_EXTENSION,
    schemaVersion: doc.schemaVersion,
    governanceModel: doc.summary.governanceModel,
    disclosureState: doc.summary.disclosureState,
    endpoint: doc.summary.governanceEndpoint,
    revision: doc.revision,
  }
}

export function loadProjectGovernanceDocument(slug: string, generatedAt?: string): ProjectGovernanceDocument | null {
  const resolved = resolveProjectBySlug(slug)
  if (!resolved.ok) return null
  const at = generatedAt ?? new Date().toISOString()
  const loaded = loadProjectEvidencePack(resolved.slug, { generatedAt: at })
  if (!loaded) return null
  return buildProjectGovernanceDocument({
    project: resolved.project,
    document: loaded.document,
    evidencePack: loaded.evidencePack,
    generatedAt: at,
  })
}
