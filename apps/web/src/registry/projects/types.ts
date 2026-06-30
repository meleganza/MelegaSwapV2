export type ProjectRegistryStatus = 'listed' | 'archived'

export type ProjectVerificationStatus = 'unverified' | 'observed'

export type ProjectTrustBadge = 'canonical' | 'observed' | 'unverified' | 'planned'

export type ProjectRiskTier = 'unknown' | 'low' | 'medium' | 'high' | 'critical'

export type CapabilityStatus =
  | 'none'
  | 'partial'
  | 'live'
  | 'finished'
  | 'unverified'
  | 'scheduled'
  | 'clear'
  | 'watch'
  | 'planned'

export interface CapabilityCell {
  status: CapabilityStatus
  notes?: string
}

export interface TokenRef {
  chainId: number
  address: string
  symbol: string
  ref: string
}

export interface ProjectCapabilities {
  tradable: CapabilityCell
  liquidity: CapabilityCell
  farm: CapabilityCell
  pool: CapabilityCell
  lock: CapabilityCell
  vesting: CapabilityCell
  launch: CapabilityCell
  smartdrop: CapabilityCell
  radar: CapabilityCell
  space: CapabilityCell
  labs: CapabilityCell
  aiReport: CapabilityCell
  machineManifest: CapabilityCell
  treasuryCompatible: CapabilityCell
}

export interface StaticProjectRecord {
  upi: string
  slug: string
  displayName: string
  tagline?: string
  description: string
  registryStatus: ProjectRegistryStatus
  phase: 'legacy_import' | 'registered'
  verificationStatus: ProjectVerificationStatus
  trustBadges: ProjectTrustBadge[]
  endorsementStatus: 'none'
  riskTier: ProjectRiskTier
  legacyImport: boolean
  isCanonical: boolean
  mvpStatic: true
  sectorTags: string[]
  supportedChains: number[]
  websiteUrl?: string
  docsUrl?: string
  spaceProfileUrl?: string
  socialLinks?: { type: string; url: string }[]
  resources: {
    tokens: TokenRef[]
    liquidityPools: string[]
    farms: string[]
    stakingPools: string[]
  }
  capabilities: ProjectCapabilities
  primaryTokenRefs: string[]
  deepLinks: {
    swap?: string
    liquidity?: string
    farms?: string
    pools?: string
    buyMarco?: string
  }
  disclaimer: string
  asOf: string
}
