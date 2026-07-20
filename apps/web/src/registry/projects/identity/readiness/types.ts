import type {
  PROJECT_READINESS_SCHEMA_VERSION,
  READINESS_SNAPSHOT_REVISION,
  ReadinessCheckResult,
  ReadinessComponentId,
  ReadinessState,
  TrustDimensionId,
  TrustDimensionState,
  WarningCategory,
  WarningSeverity,
} from './schema'

export interface ReadinessCheck {
  checkId: string
  description: string
  pointContribution: number
  result: ReadinessCheckResult
  availability: 'AVAILABLE' | 'UNAVAILABLE' | 'NOT_APPLICABLE'
  sourceFields: string[]
  evidenceIds: string[]
  reasonCode: string
  required: boolean
}

export interface ReadinessComponentResult {
  componentId: ReadinessComponentId
  label: string
  maxPoints: number
  achievedPoints: number
  normalizedPercentage: number
  status: ReadinessCheckResult
  checks: ReadinessCheck[]
  unmetCheckIds: string[]
  unavailableCheckIds: string[]
  evidenceIds: string[]
  calculationRevision: string
  lastCalculatedAt: string
}

export interface ReadinessOverview {
  score: number
  maxScore: number
  state: ReadinessState
  stateLabel: string
  explanation: string
  calculationRevision: string
  lastCalculatedAt: string
  methodologyPath: string
}

export interface TrustDimensionResult {
  dimensionId: TrustDimensionId
  availability: 'AVAILABLE' | 'UNAVAILABLE' | 'NOT_APPLICABLE'
  status: TrustDimensionState
  verificationLevel: string | null
  evidenceCount: number
  activeEvidenceIds: string[]
  staleEvidenceCount: number
  conflictCount: number
  missingExpectedEvidenceCount: number
  reasonCode: string
  displaySummary: string
}

export interface MaterialWarning {
  warningId: string
  category: WarningCategory
  severity: WarningSeverity
  subjectReference: string
  reasonCode: string
  evidenceIds: string[]
  firstObservedAt: string | null
  status: 'ACTIVE' | 'RESOLVED'
  publicExplanation: string
}

export interface TrustSnapshot {
  identityEvidenceState: TrustDimensionState
  officialResourceEvidenceState: TrustDimensionState
  deploymentEvidenceState: TrustDimensionState
  assetAndContractEvidenceState: TrustDimensionState
  projectControlEvidenceState: TrustDimensionState
  melegaVerificationEvidenceState: TrustDimensionState
  freshnessSummary: {
    currentCount: number
    staleCount: number
    expiredCount: number
    noneCount: number
  }
  conflictSummary: {
    activeConflictCount: number
    conflictGroupIds: string[]
  }
  missingEvidenceSummary: {
    missingExpectedCount: number
    missingReasonCodes: string[]
  }
  materialWarningSummary: {
    total: number
    bySeverity: Record<WarningSeverity, number>
  }
  lastEvidenceUpdate: string | null
  evidenceCoverageRatio: number | null
  evidenceCoverageNote: string
}

export interface ProjectReadinessDocument {
  schemaVersion: typeof PROJECT_READINESS_SCHEMA_VERSION
  projectId: string
  slug: string
  canonicalUrl: string
  projectRevision: string
  evidenceRevision: string
  calculationRevision: string
  snapshotRevision: typeof READINESS_SNAPSHOT_REVISION
  generatedAt: string
  readiness: ReadinessOverview
  components: ReadinessComponentResult[]
  trustSnapshot: TrustSnapshot
  trustDimensions: TrustDimensionResult[]
  warnings: MaterialWarning[]
  limitations: readonly string[]
  methodology: ReadinessMethodology
  availability: string
  provenance: {
    formulaSource: string
    evidenceSource: string
    notes: string[]
  }
}

export interface ReadinessMethodology {
  scoreMaximum: number
  calculationRevision: string
  snapshotRevision: string
  components: Array<{
    componentId: ReadinessComponentId
    label: string
    maxPoints: number
    weightFraction: number
  }>
  checkEvaluation: string
  missingDataTreatment: string
  notApplicableTreatment: string
  staleEvidenceTreatment: string
  conflictTreatment: string
  privateEvidenceTreatment: string
  sourceDistinctions: string
  limitations: readonly string[]
  thresholds: Array<{ state: ReadinessState; minInclusive: number; maxInclusive: number }>
}

/** Compact additive fields for PP001 project API. */
export interface ReadinessSummaryForProjectApi {
  extension: typeof import('./schema').PROJECT_PAGE_READINESS_EXTENSION
  score: number
  maxScore: number
  state: ReadinessState
  components: Array<{
    componentId: ReadinessComponentId
    achievedPoints: number
    maxPoints: number
    status: ReadinessCheckResult
  }>
  trustEvidenceAvailability: string
  staleEvidenceCount: number
  unresolvedConflictCount: number
  warningCountBySeverity: Record<WarningSeverity, number>
  readinessApiPath: string
  calculationRevision: string
  calculatedAt: string
}

export interface TrustSnapshotSummaryForProjectApi {
  extension: typeof import('./schema').PROJECT_PAGE_TRUST_SNAPSHOT_EXTENSION
  availability: string
  staleEvidenceCount: number
  unresolvedConflictCount: number
  warningCount: number
  evidenceCoverageRatio: number | null
  readinessApiPath: string
}
