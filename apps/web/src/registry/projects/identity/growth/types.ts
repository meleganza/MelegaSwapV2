import type { ProjectFieldSourceClass } from '../provenance'
import type { EvidenceClaimType, EvidenceFreshnessState } from '../evidence/schema'
import type {
  PROJECT_GROWTH_SCHEMA_VERSION,
  PROJECT_PAGE_GROWTH_SUMMARY_EXTENSION,
  GROWTH_RESOLVER_REVISION,
  GrowthAvailability,
  GrowthGroupKey,
  GrowthProgramCategory,
  GrowthProgramStatus,
  GrowthProgramType,
  GrowthReasonCode,
  GrowthRelationType,
} from './schema'

export interface RegistryGrowthProgramRecord {
  stableKey: string
  projectSlug: string
  category: GrowthProgramCategory
  type: GrowthProgramType
  title: string
  summary: string
  status: GrowthProgramStatus
  route: string | null
  externalUrl: string | null
  capabilities: string[]
  supportedChains: number[]
  evidenceClaimTypes: EvidenceClaimType[]
  provenanceSourceClass: ProjectFieldSourceClass
  relatedSectionIds: string[]
  relatedServiceStableKeys: string[]
  relatedUpdateStableKeys: string[]
  relatedDeveloperStableKeys: string[]
  machineTags: string[]
  updatedAt: string
}

export interface RegistryGrowthRelationRecord {
  fromStableKey: string
  toStableKey: string
  relationType: GrowthRelationType
}

export interface GrowthProgramVerification {
  state: string
  evidenceIds: string[]
  freshness: EvidenceFreshnessState
  notes: string[]
}

export interface GrowthDestination {
  route: string | null
  externalUrl: string | null
  openable: boolean
}

export interface GrowthProgram {
  programId: string
  projectId: string
  category: GrowthProgramCategory
  type: GrowthProgramType
  group: GrowthGroupKey
  title: string
  summary: string
  status: GrowthProgramStatus
  availability: GrowthAvailability
  lifecycle: GrowthProgramStatus
  provenance: { sourceClass: ProjectFieldSourceClass }
  verification: GrowthProgramVerification
  evidence: string[]
  capabilities: string[]
  destination: GrowthDestination
  supportedChains: number[]
  relatedSectionIds: string[]
  relatedServiceIds: string[]
  relatedUpdateIds: string[]
  relatedDeveloperResourceIds: string[]
  machineTags: string[]
  updatedAt: string
  revision: string
  stableKey: string
}

export interface GrowthRelation {
  relationId: string
  fromProgramId: string
  toId: string
  relationType: GrowthRelationType
}

export interface GrowthCategoryBucket {
  category: GrowthProgramCategory
  group: GrowthGroupKey
  count: number
  activeCount: number
}

export interface ProjectGrowthSummary {
  programCount: number
  activeProgramCount: number
  categoryCounts: Record<string, number>
  growthEndpoint: string
}

export interface GrowthWarning {
  reasonCode: GrowthReasonCode
  message: string
  programId: string | null
}

export interface ProjectGrowthDocument {
  schemaVersion: typeof PROJECT_GROWTH_SCHEMA_VERSION
  projectId: string
  slug: string
  canonicalUrl: string
  projectRevision: string
  revision: string
  resolverRevision: typeof GROWTH_RESOLVER_REVISION
  generatedAt: string
  programs: GrowthProgram[]
  relationships: GrowthRelation[]
  categories: GrowthCategoryBucket[]
  summary: ProjectGrowthSummary
  availability: GrowthAvailability
  warnings: GrowthWarning[]
  limitations: readonly string[]
}

export interface GrowthSummaryForProjectApi {
  extension: typeof PROJECT_PAGE_GROWTH_SUMMARY_EXTENSION
  schemaVersion: typeof PROJECT_GROWTH_SCHEMA_VERSION
  programCount: number
  activeProgramCount: number
  endpoint: string
  revision: string
}
