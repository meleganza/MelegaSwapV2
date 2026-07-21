import type { ProjectFieldSourceClass } from '../provenance'
import type { EvidenceClaimType, EvidenceFreshnessState } from '../evidence/schema'
import type {
  PROJECT_ECOSYSTEM_SCHEMA_VERSION,
  PROJECT_PAGE_ECOSYSTEM_SUMMARY_EXTENSION,
  ECOSYSTEM_RESOLVER_REVISION,
  EcosystemGroupKey,
  EcosystemReasonCode,
  ServiceAvailability,
  ServiceCategory,
  ServiceLifecycle,
  ServiceRelationType,
  ServiceType,
} from './schema'

export interface RegistryEcosystemServiceRecord {
  stableKey: string
  projectSlug: string
  category: ServiceCategory
  type: ServiceType
  title: string
  summary: string
  route: string | null
  externalUrl: string | null
  lifecycle: ServiceLifecycle
  capabilities: string[]
  supportedChains: number[]
  evidenceClaimTypes: EvidenceClaimType[]
  provenanceSourceClass: ProjectFieldSourceClass
  relatedSectionIds: string[]
  relatedUpdateStableKeys: string[]
  relatedDocumentationUrls: string[]
  machineTags: string[]
  iconKey: string
  updatedAt: string
}

export interface RegistryEcosystemRelationRecord {
  fromStableKey: string
  toStableKey: string
  relationType: ServiceRelationType
}

export interface ProjectServiceVerification {
  state: string
  evidenceIds: string[]
  freshness: EvidenceFreshnessState
  notes: string[]
}

export interface ProjectService {
  serviceId: string
  projectId: string
  category: ServiceCategory
  type: ServiceType
  group: EcosystemGroupKey
  title: string
  summary: string
  route: string | null
  externalUrl: string | null
  availability: ServiceAvailability
  lifecycle: ServiceLifecycle
  verification: ProjectServiceVerification
  provenance: {
    sourceClass: ProjectFieldSourceClass
  }
  evidenceIds: string[]
  capabilities: string[]
  supportedChains: number[]
  relatedSectionIds: string[]
  relatedUpdateIds: string[]
  relatedDocumentationUrls: string[]
  machineTags: string[]
  iconKey: string
  updatedAt: string
  revision: string
  stableKey: string
}

export interface EcosystemRelation {
  relationId: string
  fromServiceId: string
  toServiceId: string
  relationType: ServiceRelationType
}

export interface EcosystemCategoryBucket {
  category: ServiceCategory
  group: EcosystemGroupKey
  count: number
  activeCount: number
}

export interface ProjectEcosystemSummary {
  totalServices: number
  activeServiceCount: number
  categoryCounts: Record<string, number>
  groupCounts: Record<string, number>
  ecosystemEndpoint: string
}

export interface EcosystemWarning {
  reasonCode: EcosystemReasonCode
  message: string
  serviceId: string | null
}

export interface ProjectEcosystemDocument {
  schemaVersion: typeof PROJECT_ECOSYSTEM_SCHEMA_VERSION
  projectId: string
  slug: string
  canonicalUrl: string
  projectRevision: string
  ecosystemRevision: string
  resolverRevision: typeof ECOSYSTEM_RESOLVER_REVISION
  generatedAt: string
  services: ProjectService[]
  relationships: EcosystemRelation[]
  categories: EcosystemCategoryBucket[]
  summary: ProjectEcosystemSummary
  availability: ServiceAvailability
  warnings: EcosystemWarning[]
  limitations: readonly string[]
}

export interface EcosystemSummaryForProjectApi {
  extension: typeof PROJECT_PAGE_ECOSYSTEM_SUMMARY_EXTENSION
  schemaVersion: typeof PROJECT_ECOSYSTEM_SCHEMA_VERSION
  categoryCounts: Record<string, number>
  activeServiceCount: number
  endpoint: string
  revision: string
}
