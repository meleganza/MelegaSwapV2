import type { ProjectFieldSourceClass } from '../provenance'
import type { EvidenceClaimType, EvidenceFreshnessState } from '../evidence/schema'
import type {
  PROJECT_GOVERNANCE_SCHEMA_VERSION,
  PROJECT_PAGE_GOVERNANCE_SUMMARY_EXTENSION,
  GOVERNANCE_RESOLVER_REVISION,
  DisclosureLevel,
  GovernanceAvailability,
  GovernanceCapabilityKey,
  GovernanceLifecycle,
  GovernanceModel,
  GovernanceReasonCode,
  GovernanceRelationType,
  GovernanceResourceKind,
  OwnerModel,
  ProxyModel,
  TimelockModel,
  TreasuryLifecycle,
  TreasuryType,
  UpgradeabilityModel,
} from './schema'

export interface RegistryGovernanceRecord {
  stableKey: string
  projectSlug: string
  governanceModel: GovernanceModel
  lifecycle: GovernanceLifecycle
  summary: string
  supportedChains: number[]
  governanceCapabilities: GovernanceCapabilityKey[]
  governanceContractRefs: string[]
  evidenceClaimTypes: EvidenceClaimType[]
  provenanceSourceClass: ProjectFieldSourceClass
  relatedSectionIds: string[]
  relatedServiceStableKeys: string[]
  relatedUpdateStableKeys: string[]
  relatedDeveloperStableKeys: string[]
  machineTags: string[]
  updatedAt: string
}

export interface RegistryTreasuryRecord {
  stableKey: string
  projectSlug: string
  treasuryType: TreasuryType
  /** Raw EVM address when registered; null when planned/unavailable. */
  walletAddress: string | null
  chainId: number | null
  disclosureLevel: DisclosureLevel
  lifecycle: TreasuryLifecycle
  summary: string
  evidenceClaimTypes: EvidenceClaimType[]
  provenanceSourceClass: ProjectFieldSourceClass
  relatedSectionIds: string[]
  relatedServiceStableKeys: string[]
  relatedUpdateStableKeys: string[]
  machineTags: string[]
  updatedAt: string
}

export interface RegistryOwnershipRecord {
  stableKey: string
  projectSlug: string
  ownerModel: OwnerModel
  proxyModel: ProxyModel
  timelockModel: TimelockModel
  subjectLabel: string
  summary: string
  contractAddress: string | null
  chainId: number | null
  evidenceClaimTypes: EvidenceClaimType[]
  provenanceSourceClass: ProjectFieldSourceClass
  relatedSectionIds: string[]
  relatedDeveloperStableKeys: string[]
  machineTags: string[]
  updatedAt: string
}

export interface RegistryUpgradeabilityRecord {
  stableKey: string
  projectSlug: string
  upgradeability: UpgradeabilityModel
  subjectLabel: string
  summary: string
  contractAddress: string | null
  chainId: number | null
  evidenceClaimTypes: EvidenceClaimType[]
  provenanceSourceClass: ProjectFieldSourceClass
  relatedSectionIds: string[]
  relatedDeveloperStableKeys: string[]
  machineTags: string[]
  updatedAt: string
}

export interface RegistryGovernanceResourceRecord {
  stableKey: string
  projectSlug: string
  kind: GovernanceResourceKind
  title: string
  summary: string
  url: string | null
  route: string | null
  lifecycle: GovernanceLifecycle
  evidenceClaimTypes: EvidenceClaimType[]
  provenanceSourceClass: ProjectFieldSourceClass
  relatedSectionIds: string[]
  machineTags: string[]
  updatedAt: string
}

export interface RegistryGovernanceRelationRecord {
  fromStableKey: string
  toStableKey: string
  relationType: GovernanceRelationType
}

export interface GovernanceVerification {
  state: string
  evidenceIds: string[]
  freshness: EvidenceFreshnessState
  notes: string[]
}

export interface GovernanceEntity {
  governanceId: string
  projectId: string
  governanceModel: GovernanceModel
  lifecycle: GovernanceLifecycle
  availability: GovernanceAvailability
  provenance: { sourceClass: ProjectFieldSourceClass }
  verification: GovernanceVerification
  evidence: string[]
  governanceResources: string[]
  governanceContracts: string[]
  governanceCapabilities: GovernanceCapabilityKey[]
  supportedChains: number[]
  summary: string
  machineTags: string[]
  updatedAt: string
  revision: string
  stableKey: string
}

export interface TreasuryWalletReference {
  /** Canonical CAIP-10 when chain+address known; else null. */
  caip10: string | null
  address: string | null
  chainId: number | null
}

export interface TreasuryEntity {
  treasuryId: string
  projectId: string
  treasuryType: TreasuryType
  walletReference: TreasuryWalletReference
  disclosureLevel: DisclosureLevel
  provenance: { sourceClass: ProjectFieldSourceClass }
  verification: GovernanceVerification
  evidence: string[]
  lifecycle: TreasuryLifecycle
  supportedChains: number[]
  summary: string
  machineTags: string[]
  updatedAt: string
  revision: string
  stableKey: string
}

export interface OwnershipEntity {
  ownershipId: string
  projectId: string
  ownerModel: OwnerModel
  proxyModel: ProxyModel
  timelockModel: TimelockModel
  subjectLabel: string
  summary: string
  contractAddress: string | null
  chainId: number | null
  provenance: { sourceClass: ProjectFieldSourceClass }
  verification: GovernanceVerification
  evidence: string[]
  relatedSectionIds: string[]
  relatedDeveloperResourceIds: string[]
  machineTags: string[]
  updatedAt: string
  revision: string
  stableKey: string
}

export interface UpgradeabilityEntity {
  upgradeabilityId: string
  projectId: string
  upgradeability: UpgradeabilityModel
  subjectLabel: string
  summary: string
  contractAddress: string | null
  chainId: number | null
  provenance: { sourceClass: ProjectFieldSourceClass }
  verification: GovernanceVerification
  evidence: string[]
  relatedSectionIds: string[]
  relatedDeveloperResourceIds: string[]
  machineTags: string[]
  updatedAt: string
  revision: string
  stableKey: string
}

export interface GovernanceResource {
  resourceId: string
  projectId: string
  kind: GovernanceResourceKind
  title: string
  summary: string
  url: string | null
  route: string | null
  lifecycle: GovernanceLifecycle
  availability: GovernanceAvailability
  provenance: { sourceClass: ProjectFieldSourceClass }
  verification: GovernanceVerification
  evidence: string[]
  relatedSectionIds: string[]
  machineTags: string[]
  updatedAt: string
  revision: string
  stableKey: string
}

export interface GovernanceRelation {
  relationId: string
  fromId: string
  toId: string
  relationType: GovernanceRelationType
}

export interface ProjectGovernanceSummary {
  governanceModel: GovernanceModel
  disclosureState: DisclosureLevel
  treasuryCount: number
  ownershipCount: number
  upgradeabilityCount: number
  resourceCount: number
  governanceEndpoint: string
}

export interface GovernanceWarning {
  reasonCode: GovernanceReasonCode
  message: string
  entityId: string | null
}

export interface ProjectGovernanceDocument {
  schemaVersion: typeof PROJECT_GOVERNANCE_SCHEMA_VERSION
  projectId: string
  slug: string
  canonicalUrl: string
  projectRevision: string
  revision: string
  resolverRevision: typeof GOVERNANCE_RESOLVER_REVISION
  generatedAt: string
  governance: GovernanceEntity[]
  treasury: TreasuryEntity[]
  ownership: OwnershipEntity[]
  upgradeability: UpgradeabilityEntity[]
  resources: GovernanceResource[]
  relationships: GovernanceRelation[]
  summary: ProjectGovernanceSummary
  availability: GovernanceAvailability
  warnings: GovernanceWarning[]
  limitations: readonly string[]
}

export interface GovernanceSummaryForProjectApi {
  extension: typeof PROJECT_PAGE_GOVERNANCE_SUMMARY_EXTENSION
  schemaVersion: typeof PROJECT_GOVERNANCE_SCHEMA_VERSION
  governanceModel: GovernanceModel
  disclosureState: DisclosureLevel
  endpoint: string
  revision: string
}
