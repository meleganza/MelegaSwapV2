import type { CanonicalProjectDocument } from '../types'
import type { ProjectEvidencePack, ProjectEvidenceRecord } from '../evidence/types'
import { ACTIVE_EVIDENCE_STATUSES } from '../evidence/schema'
import {
  TRUST_DIMENSION_IDS,
  type TrustDimensionId,
  type TrustDimensionState,
  type WarningSeverity,
} from './schema'
import type { MaterialWarning, TrustDimensionResult, TrustSnapshot } from './types'
import { buildMaterialWarnings } from './buildWarnings'

function isActivePublic(record: ProjectEvidenceRecord): boolean {
  return (
    record.visibility === 'PUBLIC' &&
    (ACTIVE_EVIDENCE_STATUSES as readonly string[]).includes(record.status)
  )
}

function claimMatches(record: ProjectEvidenceRecord, claimTypes: string[]): boolean {
  return claimTypes.includes(record.claimType)
}

function dimensionStateFromRecords(
  records: ProjectEvidenceRecord[],
  conflicts: number,
  expected: boolean,
): { status: TrustDimensionState; reasonCode: string; verificationLevel: string | null } {
  if (!expected) {
    return { status: 'NOT_APPLICABLE', reasonCode: 'NOT_EXPECTED_FOR_PROJECT', verificationLevel: null }
  }
  if (conflicts > 0) {
    return { status: 'CONFLICTED', reasonCode: 'ACTIVE_CONFLICT', verificationLevel: null }
  }
  if (!records.length) {
    return { status: 'UNAVAILABLE', reasonCode: 'NO_PUBLIC_EVIDENCE', verificationLevel: null }
  }
  if (records.some((r) => r.freshnessState === 'STALE' || r.freshnessState === 'EXPIRED')) {
    return { status: 'STALE', reasonCode: 'STALE_OR_EXPIRED_EVIDENCE', verificationLevel: records[0]?.verificationLevel ?? null }
  }
  const levels = new Set(records.map((r) => r.verificationLevel))
  const statuses = new Set(records.map((r) => r.status))
  if (levels.has('INDEPENDENTLY_VERIFIED') || levels.has('MELEGA_VERIFIED')) {
    return {
      status: levels.size === 1 ? 'VERIFIED' : 'PARTIALLY_VERIFIED',
      reasonCode: 'VERIFIED_EVIDENCE_PRESENT',
      verificationLevel: records[0]?.verificationLevel ?? null,
    }
  }
  if (statuses.has('OBSERVED') || levels.has('SOURCE_CONFIRMED')) {
    return {
      status: 'OBSERVED',
      reasonCode: 'OBSERVED_EVIDENCE',
      verificationLevel: records[0]?.verificationLevel ?? null,
    }
  }
  if (statuses.has('ASSERTED') || records.some((r) => r.sourceType === 'PROJECT_ATTESTED')) {
    return {
      status: 'ASSERTED',
      reasonCode: 'PROJECT_ATTESTED_ONLY',
      verificationLevel: records[0]?.verificationLevel ?? null,
    }
  }
  return {
    status: 'UNRESOLVED',
    reasonCode: 'VERIFICATION_UNRESOLVED',
    verificationLevel: records[0]?.verificationLevel ?? null,
  }
}

function pickRecords(pack: ProjectEvidencePack, claimTypes: string[]): ProjectEvidenceRecord[] {
  return pack.evidence.filter((e) => isActivePublic(e) && claimMatches(e, claimTypes))
}

function conflictCountFor(pack: ProjectEvidencePack, claimTypes: string[]): number {
  return pack.conflicts.filter((c) => claimTypes.includes(c.claimType)).length
}

export function buildTrustDimensions(
  document: CanonicalProjectDocument,
  pack: ProjectEvidencePack,
): TrustDimensionResult[] {
  const hasToken = document.assets.length > 0 || document.contracts.length > 0
  const hasDeployments = document.deployments.length > 0
  const hasResources = document.resources.length > 0

  const specs: Array<{
    id: TrustDimensionId
    claims: string[]
    expected: boolean
    summary: string
  }> = [
    {
      id: 'IDENTITY',
      claims: ['PROJECT_IDENTITY', 'PROJECT_NAME', 'PROJECT_PURPOSE', 'PROJECT_TYPE'],
      expected: true,
      summary: 'Identity claims and supporting evidence',
    },
    {
      id: 'OFFICIAL_RESOURCES',
      claims: [
        'OFFICIAL_WEBSITE',
        'OFFICIAL_DOCUMENTATION',
        'OFFICIAL_SOCIAL',
        'OFFICIAL_REPOSITORY',
        'OFFICIAL_WHITEPAPER',
      ],
      expected: hasResources || Boolean(document.resources.length),
      summary: 'Official resource evidence',
    },
    {
      id: 'DEPLOYMENTS',
      claims: ['DEPLOYMENT_IDENTITY', 'SUPPORTED_CHAIN'],
      expected: hasDeployments || document.chains.length > 0,
      summary: 'Deployment and chain presence evidence',
    },
    {
      id: 'ASSETS',
      claims: ['ASSET_IDENTITY'],
      expected: hasToken,
      summary: 'Registered asset evidence',
    },
    {
      id: 'CONTRACTS',
      claims: ['CONTRACT_IDENTITY', 'CONTRACT_CLASSIFICATION', 'CONTRACT_SOURCE_VERIFICATION'],
      expected: hasToken,
      summary: 'Contract evidence',
    },
    {
      id: 'PROJECT_CONTROL',
      claims: ['PROJECT_CONTROL'],
      expected: true,
      summary: 'Public project-control evidence',
    },
    {
      id: 'MELEGA_VERIFICATION',
      claims: ['MELEGA_VERIFICATION', 'READINESS_INPUT'],
      expected: true,
      summary: 'Melega registry verification evidence',
    },
    {
      id: 'DATA_FRESHNESS',
      claims: [],
      expected: true,
      summary: 'Evidence freshness across the pack',
    },
    {
      id: 'CONFLICTS',
      claims: [],
      expected: true,
      summary: 'Unresolved evidence conflicts',
    },
  ]

  return specs.map((spec) => {
    if (spec.id === 'DATA_FRESHNESS') {
      const stale = pack.freshness.staleCount + pack.freshness.expiredCount
      const status: TrustDimensionState =
        stale > 0 ? 'STALE' : pack.freshness.currentCount > 0 ? 'OBSERVED' : 'UNAVAILABLE'
      return {
        dimensionId: spec.id,
        availability: pack.evidence.length ? 'AVAILABLE' : 'UNAVAILABLE',
        status,
        verificationLevel: null,
        evidenceCount: pack.summary.publicEvidenceCount,
        activeEvidenceIds: [],
        staleEvidenceCount: pack.freshness.staleCount,
        conflictCount: 0,
        missingExpectedEvidenceCount: 0,
        reasonCode: stale > 0 ? 'STALE_EVIDENCE_PRESENT' : 'FRESHNESS_OK',
        displaySummary: spec.summary,
      }
    }
    if (spec.id === 'CONFLICTS') {
      const n = pack.summary.activeConflictCount
      return {
        dimensionId: spec.id,
        availability: 'AVAILABLE',
        status: n > 0 ? 'CONFLICTED' : 'OBSERVED',
        verificationLevel: null,
        evidenceCount: n,
        activeEvidenceIds: pack.conflicts.flatMap((c) => c.evidenceIds),
        staleEvidenceCount: 0,
        conflictCount: n,
        missingExpectedEvidenceCount: 0,
        reasonCode: n > 0 ? 'ACTIVE_CONFLICTS' : 'NO_ACTIVE_CONFLICTS',
        displaySummary: spec.summary,
      }
    }

    const records = pickRecords(pack, spec.claims)
    const conflicts = conflictCountFor(pack, spec.claims)
    const derived = dimensionStateFromRecords(records, conflicts, spec.expected)
    const missing =
      spec.expected && records.length === 0 && derived.status === 'UNAVAILABLE' ? 1 : 0

    return {
      dimensionId: spec.id,
      availability: !spec.expected
        ? 'NOT_APPLICABLE'
        : records.length
          ? 'AVAILABLE'
          : 'UNAVAILABLE',
      status: derived.status,
      verificationLevel: derived.verificationLevel,
      evidenceCount: records.length,
      activeEvidenceIds: records.map((r) => r.evidenceId),
      staleEvidenceCount: records.filter((r) => r.freshnessState === 'STALE' || r.freshnessState === 'EXPIRED')
        .length,
      conflictCount: conflicts,
      missingExpectedEvidenceCount: missing,
      reasonCode: derived.reasonCode,
      displaySummary: spec.summary,
    }
  })
}

export function buildTrustSnapshot(
  document: CanonicalProjectDocument,
  pack: ProjectEvidencePack,
  warnings: MaterialWarning[],
): TrustSnapshot {
  const dimensions = buildTrustDimensions(document, pack)
  const byId = (id: TrustDimensionId) =>
    dimensions.find((d) => d.dimensionId === id)?.status ?? 'UNAVAILABLE'

  const expectedDims = dimensions.filter((d) => d.availability !== 'NOT_APPLICABLE')
  const covered = expectedDims.filter((d) => d.evidenceCount > 0 || d.status === 'OBSERVED' || d.status === 'VERIFIED' || d.status === 'PARTIALLY_VERIFIED' || d.status === 'ASSERTED')
  const coverage =
    expectedDims.length > 0 ? Math.round((covered.length / expectedDims.length) * 1000) / 1000 : null

  const bySeverity: Record<WarningSeverity, number> = { INFO: 0, NOTICE: 0, ATTENTION: 0 }
  for (const w of warnings) {
    bySeverity[w.severity] += 1
  }

  const lastUpdate =
    pack.evidence
      .filter((e) => e.visibility === 'PUBLIC')
      .map((e) => e.updatedAt || e.observedAt)
      .filter((x): x is string => Boolean(x))
      .sort()
      .slice(-1)[0] ?? pack.asOf

  const missingCodes = dimensions
    .filter((d) => d.missingExpectedEvidenceCount > 0)
    .map((d) => d.reasonCode)

  return {
    identityEvidenceState: byId('IDENTITY'),
    officialResourceEvidenceState: byId('OFFICIAL_RESOURCES'),
    deploymentEvidenceState: byId('DEPLOYMENTS'),
    assetAndContractEvidenceState:
      byId('CONTRACTS') === 'NOT_APPLICABLE' && byId('ASSETS') === 'NOT_APPLICABLE'
        ? 'NOT_APPLICABLE'
        : byId('CONTRACTS') === 'CONFLICTED' || byId('ASSETS') === 'CONFLICTED'
          ? 'CONFLICTED'
          : byId('CONTRACTS') !== 'UNAVAILABLE'
            ? byId('CONTRACTS')
            : byId('ASSETS'),
    projectControlEvidenceState: byId('PROJECT_CONTROL'),
    melegaVerificationEvidenceState: byId('MELEGA_VERIFICATION'),
    freshnessSummary: { ...pack.freshness },
    conflictSummary: {
      activeConflictCount: pack.summary.activeConflictCount,
      conflictGroupIds: pack.conflicts.map((c) => c.conflictGroupId),
    },
    missingEvidenceSummary: {
      missingExpectedCount: dimensions.reduce((s, d) => s + d.missingExpectedEvidenceCount, 0),
      missingReasonCodes: [...new Set(missingCodes)],
    },
    materialWarningSummary: {
      total: warnings.length,
      bySeverity,
    },
    lastEvidenceUpdate: lastUpdate,
    evidenceCoverageRatio: coverage,
    evidenceCoverageNote:
      'Coverage ratio is expected applicable dimensions with any supporting public evidence, not a quality score.',
  }
}

export function buildTrustLayer(
  document: CanonicalProjectDocument,
  pack: ProjectEvidencePack,
): { trustSnapshot: TrustSnapshot; trustDimensions: TrustDimensionResult[]; warnings: MaterialWarning[] } {
  const trustDimensions = buildTrustDimensions(document, pack)
  const warnings = buildMaterialWarnings(document, pack, trustDimensions)
  const trustSnapshot = buildTrustSnapshot(document, pack, warnings)
  // Ensure TRUST_DIMENSION_IDS stay covered
  void TRUST_DIMENSION_IDS
  return { trustSnapshot, trustDimensions, warnings }
}
