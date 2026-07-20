export {
  PROJECT_EVIDENCE_SCHEMA_VERSION,
  PROJECT_PAGE_EVIDENCE_EXTENSION,
  EVIDENCE_CLAIM_TYPES,
  EVIDENCE_STATUSES,
  EVIDENCE_VERIFICATION_LEVELS,
  ACTIVE_EVIDENCE_STATUSES,
} from './schema'
export type {
  EvidenceSubjectClass,
  EvidenceClaimType,
  EvidenceStatus,
  EvidenceVerificationLevel,
  EvidenceVisibility,
  EvidenceFreshnessState,
  EvidenceSourceSubtype,
  EvidenceSourceType,
  EvidenceAvailability,
} from './schema'

export type {
  EvidenceSubjectRef,
  EvidenceFreshnessPolicy,
  ProjectEvidenceRecord,
  EvidenceConflictSummary,
  EvidenceClaimView,
  ProjectEvidenceSummary,
  ProjectEvidencePack,
} from './types'

export { fingerprint, subjectKey, buildEvidenceId, buildConflictGroupId } from './evidenceId'
export { normalizeClaimValue } from './normalizeClaim'
export { evaluateFreshness, applyFreshnessToRecord } from './freshness'
export { detectEvidenceConflicts } from './conflict'
export { validateDerivedEvidence, minVerificationLevel } from './derive'
export {
  createEvidenceRecord,
  isEvidenceClaimType,
  isEvidenceStatus,
  isEvidenceVerificationLevel,
  assertSafeSourceReference,
} from './createEvidence'
export { buildProjectEvidencePack, toEvidenceSummaryForProjectApi } from './buildProjectEvidence'
export { toPublicEvidenceJson, serializePublicEvidenceRecord, stableEvidencePayload } from './serialize'
export { loadProjectEvidencePack } from './loadEvidence'
