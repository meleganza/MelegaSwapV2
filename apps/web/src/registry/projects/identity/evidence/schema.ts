/**
 * PP002 — Project provenance & evidence framework schema and enums.
 * Reuses PP001 ProjectFieldSourceClass / ProjectFieldAvailability — does not redefine them.
 */

import type { ProjectFieldAvailability, ProjectFieldSourceClass } from '../provenance'

export const PROJECT_EVIDENCE_SCHEMA_VERSION = 'melega.project-evidence.v1' as const

/** Additive extension marker on primary project JSON (schema remains melega.project-page.v1). */
export const PROJECT_PAGE_EVIDENCE_EXTENSION = 'evidenceSummary.v1' as const

export type EvidenceSubjectClass =
  | 'PROJECT'
  | 'ASSET'
  | 'DEPLOYMENT'
  | 'CONTRACT'
  | 'RESOURCE'
  | 'CAPABILITY'
  | 'VERIFICATION'
  | 'READINESS'

export type EvidenceClaimType =
  | 'PROJECT_IDENTITY'
  | 'PROJECT_NAME'
  | 'PROJECT_PURPOSE'
  | 'PROJECT_TYPE'
  | 'PROJECT_LIFECYCLE_STATUS'
  | 'PROJECT_CATEGORY'
  | 'PROJECT_TAG'
  | 'PROJECT_LOGO'
  | 'OFFICIAL_WEBSITE'
  | 'OFFICIAL_DOCUMENTATION'
  | 'OFFICIAL_WHITEPAPER'
  | 'OFFICIAL_REPOSITORY'
  | 'OFFICIAL_GOVERNANCE'
  | 'OFFICIAL_SOCIAL'
  | 'SUPPORTED_CHAIN'
  | 'DEPLOYMENT_IDENTITY'
  | 'ASSET_IDENTITY'
  | 'CONTRACT_IDENTITY'
  | 'CONTRACT_CLASSIFICATION'
  | 'CONTRACT_SOURCE_VERIFICATION'
  | 'PROJECT_CONTROL'
  | 'MELEGA_VERIFICATION'
  | 'READINESS_INPUT'

export type EvidenceStatus =
  | 'ASSERTED'
  | 'OBSERVED'
  | 'VERIFIED'
  | 'REJECTED'
  | 'SUPERSEDED'
  | 'EXPIRED'
  | 'CONFLICTED'
  | 'UNRESOLVED'

export type EvidenceVerificationLevel =
  | 'NONE'
  | 'SOURCE_CONFIRMED'
  | 'CONTROL_CONFIRMED'
  | 'INDEPENDENTLY_VERIFIED'
  | 'MELEGA_VERIFIED'

export type EvidenceVisibility = 'PUBLIC' | 'PRIVATE'

export type EvidenceFreshnessState = 'NONE' | 'CURRENT' | 'STALE' | 'EXPIRED'

export type EvidenceSourceSubtype =
  | 'CONTRACT_STATE'
  | 'TRANSACTION'
  | 'EVENT_LOG'
  | 'DEPLOYER'
  | 'OWNERSHIP'
  | 'BYTECODE'
  | 'REGISTRY_DECLARATION'
  | 'SIGNED_ATTESTATION'
  | 'OFFICIAL_WEBSITE'
  | 'OFFICIAL_REPOSITORY'
  | 'OFFICIAL_DOCUMENT'
  | 'MANUAL_REVIEW'
  | 'CONTROL_PROOF'
  | 'REGISTRY_REVIEW'
  | 'CONTINUOUS_MONITOR'
  | 'BLOCK_EXPLORER'
  | 'AUDITOR'
  | 'SECURITY_PROVIDER'
  | 'MARKET_DATA_PROVIDER'
  | 'EXTERNAL_REGISTRY'
  | 'NORMALIZED_IDENTIFIER'
  | 'READINESS_COMPONENT'
  | 'CONFLICT_RESOLUTION'
  | 'AGGREGATED_STATUS'

export type EvidenceSourceType = ProjectFieldSourceClass
export type EvidenceAvailability = ProjectFieldAvailability

export const EVIDENCE_CLAIM_TYPES: readonly EvidenceClaimType[] = [
  'PROJECT_IDENTITY',
  'PROJECT_NAME',
  'PROJECT_PURPOSE',
  'PROJECT_TYPE',
  'PROJECT_LIFECYCLE_STATUS',
  'PROJECT_CATEGORY',
  'PROJECT_TAG',
  'PROJECT_LOGO',
  'OFFICIAL_WEBSITE',
  'OFFICIAL_DOCUMENTATION',
  'OFFICIAL_WHITEPAPER',
  'OFFICIAL_REPOSITORY',
  'OFFICIAL_GOVERNANCE',
  'OFFICIAL_SOCIAL',
  'SUPPORTED_CHAIN',
  'DEPLOYMENT_IDENTITY',
  'ASSET_IDENTITY',
  'CONTRACT_IDENTITY',
  'CONTRACT_CLASSIFICATION',
  'CONTRACT_SOURCE_VERIFICATION',
  'PROJECT_CONTROL',
  'MELEGA_VERIFICATION',
  'READINESS_INPUT',
] as const

export const EVIDENCE_STATUSES: readonly EvidenceStatus[] = [
  'ASSERTED',
  'OBSERVED',
  'VERIFIED',
  'REJECTED',
  'SUPERSEDED',
  'EXPIRED',
  'CONFLICTED',
  'UNRESOLVED',
] as const

export const EVIDENCE_VERIFICATION_LEVELS: readonly EvidenceVerificationLevel[] = [
  'NONE',
  'SOURCE_CONFIRMED',
  'CONTROL_CONFIRMED',
  'INDEPENDENTLY_VERIFIED',
  'MELEGA_VERIFIED',
] as const

export const ACTIVE_EVIDENCE_STATUSES: readonly EvidenceStatus[] = [
  'ASSERTED',
  'OBSERVED',
  'VERIFIED',
  'CONFLICTED',
  'UNRESOLVED',
] as const
