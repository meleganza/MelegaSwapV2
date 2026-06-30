export type LiquidityConfidence = 'canonical' | 'observed' | 'low' | 'planned' | 'not_indexed'

export type PresenceType = 'canonical' | 'economic_presence' | 'planned_surface' | 'bridge'

export type PresenceStatus = 'LIVE' | 'OBSERVED' | 'PLANNED' | 'NOT_INDEXED'

export type CanonicalRelationship =
  | 'canonical'
  | 'economic_presence_only'
  | 'planned_presence'
  | 'not_canonical'

export type ExecutionEligibility = 'eligible' | 'conditional' | 'not_eligible' | 'illustrative_only'

export interface PresenceLinks {
  asset?: string
  venue?: string
  graph: string
  query: string
  execution?: string
}

export interface StaticPresenceRecord {
  slug: string
  presenceId: string
  displayName: string
  description: string
  projectUpi: string
  projectSlug: string
  canonicalAssetUai: string
  assetSlug?: string
  chainId?: number
  chainLabel: string
  venueSource: string
  presenceType: PresenceType
  status: PresenceStatus
  liquidityConfidence: LiquidityConfidence
  executionEligibility: ExecutionEligibility
  canonicalRelationship: CanonicalRelationship
  isCanonical: boolean
  warnings: string[]
  links: PresenceLinks
  disclaimer: string
  dataSource: string
  asOf: string
  mvpStatic: true
}
