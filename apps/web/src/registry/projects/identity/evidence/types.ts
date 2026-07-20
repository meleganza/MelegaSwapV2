import type { ProjectFieldAvailability } from '../provenance'
import type {
  EvidenceAvailability,
  EvidenceClaimType,
  EvidenceFreshnessState,
  EvidenceSourceSubtype,
  EvidenceSourceType,
  EvidenceStatus,
  EvidenceSubjectClass,
  EvidenceVerificationLevel,
  EvidenceVisibility,
} from './schema'

export interface EvidenceSubjectRef {
  subjectType: EvidenceSubjectClass
  projectId: string
  /** Immutable subject identifier (UPI, CAIP-10, resource URL key, etc.) — never a display name. */
  subjectId: string
  /** Optional property path, e.g. identity.shortPurpose */
  fieldPath: string | null
}

export interface EvidenceFreshnessPolicy {
  /** Max age in milliseconds from observedAt/updatedAt before STALE. Null = no age policy. */
  maxAgeMs: number | null
  reasonCode: string
}

export interface ProjectEvidenceRecord {
  schemaVersion: typeof import('./schema').PROJECT_EVIDENCE_SCHEMA_VERSION
  evidenceId: string
  projectId: string
  subject: EvidenceSubjectRef
  claimType: EvidenceClaimType
  claimValue: string | null
  sourceType: EvidenceSourceType
  sourceSubtype: EvidenceSourceSubtype | null
  sourceReference: string
  status: EvidenceStatus
  verificationLevel: EvidenceVerificationLevel
  observedAt: string | null
  updatedAt: string | null
  expiresAt: string | null
  freshnessPolicy: EvidenceFreshnessPolicy | null
  freshnessState: EvidenceFreshnessState
  freshnessReason: string | null
  availability: EvidenceAvailability
  conflictGroupId: string | null
  supersedesEvidenceId: string | null
  derivedFromEvidenceIds: string[]
  derivationMethod: string | null
  notes: string | null
  reasonCode: string | null
  visibility: EvidenceVisibility
}

export interface EvidenceConflictSummary {
  conflictGroupId: string
  claimType: EvidenceClaimType
  subject: EvidenceSubjectRef
  reasonCode: string
  evidenceIds: string[]
  normalizedValues: string[]
}

export interface EvidenceClaimView {
  claimType: EvidenceClaimType
  subject: EvidenceSubjectRef
  claimValue: string | null
  availability: ProjectFieldAvailability
  status: EvidenceStatus
  verificationLevel: EvidenceVerificationLevel
  evidenceIds: string[]
  conflictGroupId: string | null
  freshnessState: EvidenceFreshnessState
}

export interface ProjectEvidenceSummary {
  publicEvidenceCount: number
  activeConflictCount: number
  staleEvidenceCount: number
  expiredEvidenceCount: number
  identityEvidenceAvailable: boolean
  officialResourceEvidenceAvailable: boolean
  contractEvidenceAvailable: boolean
  controlEvidenceAvailable: boolean
  melegaVerificationEvidenceAvailable: boolean
  availability: ProjectFieldAvailability
}

export interface ProjectEvidencePack {
  schemaVersion: typeof import('./schema').PROJECT_EVIDENCE_SCHEMA_VERSION
  projectId: string
  slug: string
  canonicalUrl: string
  projectRevision: string
  generatedAt: string
  asOf: string
  summary: ProjectEvidenceSummary
  claims: EvidenceClaimView[]
  evidence: ProjectEvidenceRecord[]
  conflicts: EvidenceConflictSummary[]
  freshness: {
    staleCount: number
    expiredCount: number
    currentCount: number
    noneCount: number
  }
  availability: ProjectFieldAvailability
  provenance: {
    sourcesPresent: EvidenceSourceType[]
    notes: string[]
  }
}
