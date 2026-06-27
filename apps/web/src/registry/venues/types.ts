import { CapabilityCell, CapabilityStatus } from 'registry/projects/types'

export type VenueType = 'spot_lp' | 'farm' | 'stake_pool' | 'launch' | 'future'

export type VenueLifecycle = 'draft' | 'observed' | 'verified' | 'deprecated' | 'archived'

export type VenueTrustBadge = 'observed' | 'verified' | 'canonical' | 'deprecated'

export type VenueVerificationStatus = 'unverified' | 'observed' | 'verified'

export type VenueMetricsStatus = 'not_indexed' | 'partial' | 'indexed'

export interface VenueCapabilities {
  swap: CapabilityCell
  liquidity: CapabilityCell
  farm: CapabilityCell
  stake: CapabilityCell
  launch: CapabilityCell
  lock: CapabilityCell
  treasury: CapabilityCell
  radar: CapabilityCell
}

export interface VenueProjectBinding {
  projectUpi: string
  projectSlug: string
  bindingSource: 'legacy_import' | 'indexer' | 'governance'
  boundAt: string
}

export interface VenueAssetBinding {
  assetUai: string
  assetSlug: string
  role: 'base' | 'quote' | 'stake' | 'reward' | 'lp'
}

export interface VenueMetrics {
  status: VenueMetricsStatus
  notes?: string
}

export interface VenueTrust {
  badges: VenueTrustBadge[]
  verificationStatus: VenueVerificationStatus
}

export interface StaticVenueRecord {
  uvi: string
  slug: string
  venueType: VenueType
  lifecycle: VenueLifecycle
  displayName: string
  description?: string
  tags: string[]
  chainId: number
  contractAddress?: string
  legacyRef?: string
  pid?: number
  sousId?: number
  projectBinding: VenueProjectBinding
  assetBindings: VenueAssetBinding[]
  trust: VenueTrust
  capabilities: VenueCapabilities
  metrics: VenueMetrics
  deepLinks?: {
    swap?: string
    liquidity?: string
    farms?: string
    pools?: string
    launch?: string
  }
  disclaimer: string
  dataSource: string
  asOf: string
  mvpStatic: true
}

export type { CapabilityStatus }
