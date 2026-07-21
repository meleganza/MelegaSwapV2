import type {
  PROJECT_CONTROL_CENTER_SCHEMA_VERSION,
  PROJECT_PAGE_CONTROL_CENTER_SUMMARY_EXTENSION,
  CONTROL_CENTER_RESOLVER_REVISION,
  AuditAction,
  ClaimState,
  ControlCenterReasonCode,
  ControlCenterSection,
  OwnerIdentityType,
  OwnerPermission,
  OwnerRole,
  OwnerVerificationState,
} from './schema'

export interface RegistryProjectOwnerRecord {
  stableKey: string
  projectSlug: string
  identityType: OwnerIdentityType
  /** Public-safe label only — never a secret. */
  identityLabel: string
  /** Optional wallet when identityType=WALLET; never invent. */
  walletAddress: string | null
  verificationState: OwnerVerificationState
  roles: OwnerRole[]
  createdAt: string
  updatedAt: string
}

export interface RegistryClaimRecord {
  projectSlug: string
  claimState: ClaimState
  notes: string
  updatedAt: string
}

export interface ProjectOwner {
  ownerId: string
  projectId: string
  identityType: OwnerIdentityType
  identityLabel: string
  walletAddress: string | null
  verificationState: OwnerVerificationState
  roles: OwnerRole[]
  permissions: OwnerPermission[]
  createdAt: string
  updatedAt: string
  revision: string
  stableKey: string
}

export interface StagedProfileDraft {
  displayName: string | null
  summary: string | null
  categories: string[]
  tags: string[]
  websiteUrl: string | null
  docsUrl: string | null
  logoUrl: string | null
  socialLinks: { type: string; url: string }[]
  updatedAt: string
  revision: string
}

export interface StagedResourceDraft {
  resourceKey: string
  kind: string
  title: string
  url: string | null
  summary: string
  updatedAt: string
  revision: string
}

export interface StagedUpdateDraft {
  stableKey: string
  version: string
  publishedAt: string
  title: string
  summary: string
  content: string
  category: string
  authorType: string
  authorIdentity: string
  status: 'STAGED'
  updatedAt: string
  revision: string
}

export interface StagedEcosystemDraft {
  serviceKey: string
  title: string
  summary: string
  route: string | null
  externalUrl: string | null
  updatedAt: string
  revision: string
}

export interface StagedDeveloperDraft {
  resourceKey: string
  title: string
  summary: string
  category: string
  url: string | null
  route: string | null
  updatedAt: string
  revision: string
}

export interface ControlCenterAuditRecord {
  auditId: string
  projectId: string
  projectSlug: string
  actorOwnerId: string
  action: AuditAction
  section: ControlCenterSection
  summary: string
  beforeRevision: string | null
  afterRevision: string
  createdAt: string
  /** Opaque payload fingerprint — never secrets. */
  changeFingerprint: string
}

export interface CompletionGap {
  id: string
  section: ControlCenterSection
  label: string
  requiresVerification: boolean
}

export interface PendingAction {
  id: string
  label: string
  permission: OwnerPermission | null
  requiresVerification: boolean
}

export interface ControlCenterOverview {
  claimState: ClaimState
  ownerVerification: OwnerVerificationState
  completionGaps: CompletionGap[]
  pendingActions: PendingAction[]
  evidenceGaps: string[]
  stagedCounts: {
    profile: number
    resources: number
    updates: number
    ecosystem: number
    developer: number
  }
}

export interface ProjectControlCenterDocument {
  schemaVersion: typeof PROJECT_CONTROL_CENTER_SCHEMA_VERSION
  projectId: string
  slug: string
  canonicalUrl: string
  projectRevision: string
  revision: string
  resolverRevision: typeof CONTROL_CENTER_RESOLVER_REVISION
  generatedAt: string
  claimState: ClaimState
  owners: ProjectOwner[]
  overview: ControlCenterOverview
  stagedProfile: StagedProfileDraft | null
  stagedResources: StagedResourceDraft[]
  stagedUpdates: StagedUpdateDraft[]
  stagedEcosystem: StagedEcosystemDraft[]
  stagedDeveloper: StagedDeveloperDraft[]
  audit: ControlCenterAuditRecord[]
  sections: ControlCenterSection[]
  limitations: readonly string[]
}

export interface ControlCenterSummaryForProjectApi {
  extension: typeof PROJECT_PAGE_CONTROL_CENTER_SUMMARY_EXTENSION
  schemaVersion: typeof PROJECT_CONTROL_CENTER_SCHEMA_VERSION
  claimState: ClaimState
  ownerVerification: OwnerVerificationState
  revision: string
}

export interface ControlCenterAuthContext {
  authorized: true
  verified: boolean
  owner: ProjectOwner
  permissions: OwnerPermission[]
  actorLabel: string
}

export interface ControlCenterAuthFailure {
  authorized: false
  reasonCode: ControlCenterReasonCode
  message: string
}

export type ControlCenterAuthResult = ControlCenterAuthContext | ControlCenterAuthFailure

export interface ControlCenterMutationResult<T> {
  ok: true
  data: T
  auditId: string
  revision: string
}

export interface ControlCenterMutationError {
  ok: false
  reasonCode: ControlCenterReasonCode
  message: string
}
