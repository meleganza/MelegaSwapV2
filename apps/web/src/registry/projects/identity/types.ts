import type { DeclaredCapabilityState, ProjectField } from './provenance'

export type ProjectAssetRole = 'primary' | 'secondary' | 'unknown'
export type ProjectAssetType = 'fungible_token' | 'unknown'

export interface CanonicalProjectAsset {
  assetId: string
  assetType: ProjectAssetType
  name: ProjectField<string>
  symbol: ProjectField<string>
  decimals: ProjectField<number>
  chainId: number
  caip2: string
  caip19: string | null
  contractAddress: string | null
  projectRole: ProjectAssetRole
  relationship: 'canonical' | 'secondary'
}

export interface CanonicalProjectContract {
  contractId: string
  chainId: number
  caip2: string
  caip10: string
  address: string
  classification: string
  explorerUrl: ProjectField<string>
  verificationStatus: ProjectField<string>
}

export interface CanonicalProjectDeployment {
  deploymentId: string
  chainId: number
  caip2: string
  status: ProjectField<string>
  associatedContractIds: string[]
  availableCapabilityKeys: string[]
  observedAt: string | null
  updatedAt: string | null
}

export type ProjectResourceType =
  | 'website'
  | 'documentation'
  | 'whitepaper'
  | 'github'
  | 'governance'
  | 'explorer'
  | 'social'
  | 'support'
  | 'status'
  | 'space'
  | 'other'

export interface CanonicalProjectResource {
  resourceType: ProjectResourceType
  label: string
  url: string
  provenance: ProjectField<string>['meta']
}

export interface CanonicalProjectEvidence {
  evidenceType: string
  sourceType: ProjectField<string>['meta']['source']
  reference: string
  status: string
  observedAt: string | null
  updatedAt: string | null
  freshness: 'current' | 'stale' | 'unknown'
}

export interface CanonicalDeclaredCapability {
  key: string
  label: string
  state: DeclaredCapabilityState
  notes: string | null
}

export interface CanonicalProjectIdentity {
  projectId: string
  slug: string
  aliases: string[]
  displayName: string
  shortPurpose: ProjectField<string>
  description: ProjectField<string>
  projectType: ProjectField<string>
  lifecycleStatus: ProjectField<string>
  categories: string[]
  tags: string[]
  logoUrl: ProjectField<string>
  verificationState: ProjectField<string>
  readiness: ProjectField<{
    label: string
    score: number | null
    disclaimer: string
  }>
  updatedAt: string | null
}

export interface CanonicalProjectDocument {
  schemaVersion: typeof import('./provenance').PROJECT_PAGE_SCHEMA_VERSION
  projectId: string
  slug: string
  aliases: string[]
  canonicalUrl: string
  revision: string
  generatedAt: string
  updatedAt: string | null
  identity: CanonicalProjectIdentity
  chains: Array<{
    chainId: number
    caip2: string
    label: string
    availability: import('./provenance').ProjectFieldAvailability
  }>
  assets: CanonicalProjectAsset[]
  deployments: CanonicalProjectDeployment[]
  contracts: CanonicalProjectContract[]
  resources: CanonicalProjectResource[]
  evidence: CanonicalProjectEvidence[]
  declaredCapabilities: CanonicalDeclaredCapability[]
  navSections: Array<{ id: string; label: string }>
  provenanceSummary: {
    sourcesPresent: Array<import('./provenance').ProjectFieldSourceClass>
    availabilityNotes: string[]
  }
}
