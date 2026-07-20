/**
 * PP003 — Project Readiness and Trust Snapshot schema constants.
 * Readiness formula ownership remains Organ 01 / discovery.ts.
 */

export const PROJECT_READINESS_SCHEMA_VERSION = 'melega.project-readiness.v1' as const
export const PROJECT_PAGE_READINESS_EXTENSION = 'readinessSummary.v1' as const
export const PROJECT_PAGE_TRUST_SNAPSHOT_EXTENSION = 'trustSnapshotSummary.v1' as const

/** Snapshot assembly revision (formula revision stays CIVILIZATION_READINESS_V1). */
export const READINESS_SNAPSHOT_REVISION = 'PP003_READINESS_TRUST_SNAPSHOT_V1' as const

export const READINESS_COMPONENT_IDS = [
  'IDENTITY',
  'CAPABILITIES',
  'ECOSYSTEM',
  'MACHINE_READINESS',
  'MULTI_CHAIN',
  'TRUST_EVIDENCE',
] as const

export type ReadinessComponentId = (typeof READINESS_COMPONENT_IDS)[number]

export const READINESS_COMPONENT_LABELS: Record<ReadinessComponentId, string> = {
  IDENTITY: 'Identity',
  CAPABILITIES: 'Capabilities',
  ECOSYSTEM: 'Ecosystem',
  MACHINE_READINESS: 'Machine readiness',
  MULTI_CHAIN: 'Multi-chain',
  TRUST_EVIDENCE: 'Trust evidence',
}

/** Maps PP003 component IDs → discovery weight keys. */
export const READINESS_COMPONENT_TO_WEIGHT_KEY = {
  IDENTITY: 'identity',
  CAPABILITIES: 'capabilities',
  ECOSYSTEM: 'ecosystemSurfaces',
  MACHINE_READINESS: 'machineReadiness',
  MULTI_CHAIN: 'multiChain',
  TRUST_EVIDENCE: 'trustSignals',
} as const

/**
 * Operational readiness bands — information completeness, not safety.
 * Centralized; do not duplicate in UI.
 */
export const READINESS_STATE_THRESHOLDS = [
  { state: 'FOUNDATIONAL', minInclusive: 0, maxInclusive: 24 },
  { state: 'DEVELOPING', minInclusive: 25, maxInclusive: 49 },
  { state: 'OPERATIONAL', minInclusive: 50, maxInclusive: 74 },
  { state: 'ADVANCED', minInclusive: 75, maxInclusive: 89 },
  { state: 'COMPREHENSIVE', minInclusive: 90, maxInclusive: 100 },
] as const

export type ReadinessState = (typeof READINESS_STATE_THRESHOLDS)[number]['state']

export const READINESS_CHECK_RESULTS = [
  'SATISFIED',
  'PARTIALLY_SATISFIED',
  'UNSATISFIED',
  'UNAVAILABLE',
  'NOT_APPLICABLE',
  'CONFLICTED',
  'STALE',
] as const

export type ReadinessCheckResult = (typeof READINESS_CHECK_RESULTS)[number]

export const TRUST_DIMENSION_IDS = [
  'IDENTITY',
  'OFFICIAL_RESOURCES',
  'DEPLOYMENTS',
  'ASSETS',
  'CONTRACTS',
  'PROJECT_CONTROL',
  'MELEGA_VERIFICATION',
  'DATA_FRESHNESS',
  'CONFLICTS',
] as const

export type TrustDimensionId = (typeof TRUST_DIMENSION_IDS)[number]

export const TRUST_DIMENSION_STATES = [
  'VERIFIED',
  'PARTIALLY_VERIFIED',
  'ASSERTED',
  'OBSERVED',
  'UNAVAILABLE',
  'NOT_APPLICABLE',
  'STALE',
  'CONFLICTED',
  'UNRESOLVED',
] as const

export type TrustDimensionState = (typeof TRUST_DIMENSION_STATES)[number]

export const WARNING_SEVERITIES = ['INFO', 'NOTICE', 'ATTENTION'] as const
export type WarningSeverity = (typeof WARNING_SEVERITIES)[number]

export const WARNING_CATEGORIES = [
  'IDENTITY_CONFLICT',
  'OFFICIAL_RESOURCE_CONFLICT',
  'CONTRACT_CLASSIFICATION_CONFLICT',
  'STALE_IDENTITY_EVIDENCE',
  'STALE_CONTRACT_EVIDENCE',
  'NO_PUBLIC_CONTROL_EVIDENCE',
  'NO_CONTRACT_VERIFICATION_EVIDENCE',
  'EVIDENCE_UNAVAILABLE',
  'VERIFICATION_UNRESOLVED',
] as const

export type WarningCategory = (typeof WARNING_CATEGORIES)[number]

export const READINESS_LIMITATIONS = [
  'Readiness measures Melega ecosystem integration completeness and registered information coverage.',
  'Readiness is not a security guarantee, audit result, or investment rating.',
  'Evidence coverage is not proof of project quality or team trustworthiness.',
  'Absence of evidence is not proof of misconduct.',
  'On-chain verification does not imply economic safety or permanent liquidity.',
  'This snapshot does not assess legal compliance or smart-contract vulnerability absence.',
] as const

export function readinessStateFromScore(score: number): ReadinessState {
  const clamped = Math.max(0, Math.min(100, Math.round(score)))
  for (const band of READINESS_STATE_THRESHOLDS) {
    if (clamped >= band.minInclusive && clamped <= band.maxInclusive) return band.state
  }
  return 'FOUNDATIONAL'
}
