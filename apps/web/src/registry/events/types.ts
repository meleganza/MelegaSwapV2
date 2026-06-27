export type EventType =
  | 'swap'
  | 'liquidity_added'
  | 'liquidity_removed'
  | 'farm_created'
  | 'stake_pool_created'
  | 'launch_created'
  | 'asset_registered'
  | 'venue_registered'
  | 'fee_observed'
  | 'future'

export type EventStatus = 'observed' | 'registry_derived'

export type TreasuryAttributionStatus = 'not_indexed' | 'planned' | 'partial'

export interface EventTreasuryStatus {
  status: TreasuryAttributionStatus
  notes?: string
}

export interface EventRelationships {
  projectUpi?: string
  projectSlug?: string
  assetUai?: string
  assetSlug?: string
  venueUvi?: string
  venueSlug?: string
  treasury: EventTreasuryStatus
}

export type EventProvenanceSource = 'asset-registry' | 'venue-registry' | 'project-registry'

export interface EventProvenance {
  derivedFrom: EventProvenanceSource
  registryRef?: string
  notes?: string
}

export interface StaticEventRecord {
  uei: string
  slug: string
  eventType: EventType
  status: EventStatus
  displayName: string
  description?: string
  tags: string[]
  chainId?: number
  recordedAt: string
  relationships: EventRelationships
  provenance: EventProvenance
  disclaimer: string
  dataSource: string
  asOf: string
  mvpStatic: true
}
