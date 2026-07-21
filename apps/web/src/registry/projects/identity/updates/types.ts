import type { ProjectFieldSourceClass } from '../provenance'
import type { EvidenceClaimType, EvidenceFreshnessState } from '../evidence/schema'
import type {
  PROJECT_UPDATES_SCHEMA_VERSION,
  PROJECT_PAGE_UPDATES_SUMMARY_EXTENSION,
  UPDATES_RESOLVER_REVISION,
  UpdateAuthorType,
  UpdateAvailability,
  UpdateCategory,
  UpdateReasonCode,
  UpdateStatus,
  UpdateVerificationState,
  UpdateVisibility,
} from './schema'

/** Pre-normalized registry record (static source of truth). */
export interface RegistryProjectUpdateRecord {
  /** Immutable logical key — never a display label alone. */
  stableKey: string
  projectSlug: string
  version: string
  publishedAt: string
  updatedAt: string | null
  authorType: UpdateAuthorType
  authorIdentity: string
  title: string
  summary: string
  content: string
  category: UpdateCategory
  affectedCapabilities: string[]
  affectedDeployments: string[]
  affectedAssets: string[]
  affectedContracts: string[]
  /** PP002 claim types used to resolve public evidenceIds — never invent verification. */
  evidenceClaimTypes: EvidenceClaimType[]
  provenanceSourceClass: ProjectFieldSourceClass
  visibility: UpdateVisibility
  status: UpdateStatus
  supersedesStableKey: string | null
  machineTags: string[]
}

export interface ProjectUpdateProvenance {
  sourceClass: ProjectFieldSourceClass
  authorType: UpdateAuthorType
  authorIdentity: string
}

export interface ProjectUpdateVerification {
  state: UpdateVerificationState
  evidenceIds: string[]
  freshness: EvidenceFreshnessState
  notes: string[]
}

export interface ProjectUpdate {
  updateId: string
  projectId: string
  version: string
  publishedAt: string
  updatedAt: string | null
  authorType: UpdateAuthorType
  authorIdentity: string
  title: string
  summary: string
  content: string
  category: UpdateCategory
  affectedCapabilities: string[]
  affectedDeployments: string[]
  affectedAssets: string[]
  affectedContracts: string[]
  evidenceIds: string[]
  provenance: ProjectUpdateProvenance
  verification: ProjectUpdateVerification
  visibility: UpdateVisibility
  machineTags: string[]
  revision: string
  supersedesUpdate: string | null
  status: UpdateStatus
  /** Stable key retained for machine chronology / future search — not a mutable display id. */
  stableKey: string
}

export interface ProjectUpdatesSummary {
  totalPublicUpdates: number
  latestPublishedAt: string | null
  categoriesPresent: UpdateCategory[]
  activeCount: number
  supersededCount: number
  retractedCount: number
  archivedCount: number
  updatesEndpoint: string
}

export interface ProjectUpdatesWarning {
  reasonCode: UpdateReasonCode
  message: string
  updateId: string | null
}

export interface ProjectUpdatesDocument {
  schemaVersion: typeof PROJECT_UPDATES_SCHEMA_VERSION
  projectId: string
  slug: string
  canonicalUrl: string
  projectRevision: string
  updatesRevision: string
  resolverRevision: typeof UPDATES_RESOLVER_REVISION
  generatedAt: string
  updates: ProjectUpdate[]
  summary: ProjectUpdatesSummary
  availability: UpdateAvailability
  warnings: ProjectUpdatesWarning[]
  limitations: readonly string[]
}

export interface UpdatesSummaryForProjectApi {
  extension: typeof PROJECT_PAGE_UPDATES_SUMMARY_EXTENSION
  schemaVersion: typeof PROJECT_UPDATES_SCHEMA_VERSION
  totalPublicUpdates: number
  latestPublishedAt: string | null
  categoriesPresent: UpdateCategory[]
  endpoint: string
  revision: string
}
