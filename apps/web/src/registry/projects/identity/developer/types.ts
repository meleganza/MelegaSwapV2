import type { ProjectFieldSourceClass } from '../provenance'
import type { EvidenceClaimType, EvidenceFreshnessState } from '../evidence/schema'
import type {
  PROJECT_DEVELOPER_SCHEMA_VERSION,
  PROJECT_PAGE_DEVELOPER_SUMMARY_EXTENSION,
  DEVELOPER_RESOLVER_REVISION,
  DeveloperAvailability,
  DeveloperGroupKey,
  DeveloperReasonCode,
  DeveloperRelationType,
  DeveloperResourceCategory,
  DeveloperResourceLifecycle,
  DeveloperResourceType,
} from './schema'

export interface RegistryDeveloperResourceRecord {
  stableKey: string
  projectSlug: string
  category: DeveloperResourceCategory
  type: DeveloperResourceType
  title: string
  summary: string
  version: string
  url: string | null
  route: string | null
  lifecycle: DeveloperResourceLifecycle
  machineReadable: boolean
  supportedChains: number[]
  evidenceClaimTypes: EvidenceClaimType[]
  provenanceSourceClass: ProjectFieldSourceClass
  relatedSectionIds: string[]
  relatedServiceStableKeys: string[]
  relatedUpdateStableKeys: string[]
  machineTags: string[]
  updatedAt: string
  /** Optional contract subject for CONTRACT/ABI resources. */
  contractAddress: string | null
}

export interface RegistryDeveloperRelationRecord {
  fromStableKey: string
  toStableKey: string
  relationType: DeveloperRelationType
}

export interface DeveloperResourceVerification {
  state: string
  evidenceIds: string[]
  freshness: EvidenceFreshnessState
  notes: string[]
}

export interface DeveloperResource {
  resourceId: string
  projectId: string
  category: DeveloperResourceCategory
  type: DeveloperResourceType
  group: DeveloperGroupKey
  title: string
  summary: string
  version: string
  url: string | null
  route: string | null
  lifecycle: DeveloperResourceLifecycle
  availability: DeveloperAvailability
  provenance: { sourceClass: ProjectFieldSourceClass }
  verification: DeveloperResourceVerification
  evidenceIds: string[]
  machineReadable: boolean
  supportedChains: number[]
  relatedSectionIds: string[]
  relatedServiceIds: string[]
  relatedUpdateIds: string[]
  contractAddress: string | null
  machineTags: string[]
  updatedAt: string
  revision: string
  stableKey: string
}

export interface DeveloperRelation {
  relationId: string
  fromResourceId: string
  toResourceId: string
  relationType: DeveloperRelationType
}

export interface DeveloperCategoryBucket {
  category: DeveloperResourceCategory
  group: DeveloperGroupKey
  count: number
  activeCount: number
}

export interface ProjectDeveloperSummary {
  totalResources: number
  activeResourceCount: number
  resourceCounts: Record<string, number>
  categoryCounts: Record<string, number>
  developerEndpoint: string
}

export interface DeveloperWarning {
  reasonCode: DeveloperReasonCode
  message: string
  resourceId: string | null
}

export interface ProjectDeveloperDocument {
  schemaVersion: typeof PROJECT_DEVELOPER_SCHEMA_VERSION
  projectId: string
  slug: string
  canonicalUrl: string
  projectRevision: string
  developerRevision: string
  resolverRevision: typeof DEVELOPER_RESOLVER_REVISION
  generatedAt: string
  resources: DeveloperResource[]
  relationships: DeveloperRelation[]
  categories: DeveloperCategoryBucket[]
  summary: ProjectDeveloperSummary
  availability: DeveloperAvailability
  warnings: DeveloperWarning[]
  limitations: readonly string[]
}

export interface DeveloperSummaryForProjectApi {
  extension: typeof PROJECT_PAGE_DEVELOPER_SUMMARY_EXTENSION
  schemaVersion: typeof PROJECT_DEVELOPER_SCHEMA_VERSION
  resourceCounts: Record<string, number>
  categoryCounts: Record<string, number>
  endpoint: string
  revision: string
}
