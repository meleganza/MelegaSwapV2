import { CapabilityCell, CapabilityStatus } from 'registry/projects/types'

export type AssetType = 'fungible' | 'lp' | 'nft' | 'stable' | 'wrapped'

export type AssetLifecycle = 'draft' | 'observed' | 'verified' | 'deprecated' | 'archived'

export type AssetTrustBadge = 'observed' | 'verified' | 'canonical' | 'deprecated'

export type AssetVerificationStatus = 'unverified' | 'observed' | 'verified'

export type AssetRelationshipStatus = 'not_indexed' | 'partial' | 'indexed'

export interface AssetCapabilities {
  tradable: CapabilityCell
  liquidity: CapabilityCell
  farm: CapabilityCell
  pool: CapabilityCell
  lock: CapabilityCell
  governance: CapabilityCell
  smartdrop: CapabilityCell
  radar: CapabilityCell
  space: CapabilityCell
  labs: CapabilityCell
  treasury: CapabilityCell
}

export interface AssetProjectBinding {
  projectUpi: string
  projectSlug: string
  isPrimary: boolean
  bindingSource: 'legacy_import' | 'founder_submit' | 'governance' | 'indexer'
  boundAt: string
}

export interface AssetRelationships {
  liquidityPools: string[]
  markets: string[]
  locks: string[]
  campaigns: string[]
  treasurySkus: string[]
  relationshipStatus: AssetRelationshipStatus
  relationshipNotes?: string
}

export interface AssetTrust {
  badges: AssetTrustBadge[]
  verificationStatus: AssetVerificationStatus
}

export interface StaticAssetRecord {
  uai: string
  slug: string
  legacyRef: string
  assetType: AssetType
  lifecycle: AssetLifecycle
  projectBinding: AssetProjectBinding
  chainId: number
  contractAddress: string
  symbol: string
  decimals: number
  name: string
  description?: string
  tags: string[]
  logoUrl?: string
  trust: AssetTrust
  capabilities: AssetCapabilities
  relationships: AssetRelationships
  disclaimer: string
  dataSource: string
  asOf: string
  mvpStatic: true
}

export type { CapabilityStatus }
