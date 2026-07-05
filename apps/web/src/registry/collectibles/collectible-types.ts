export type CollectibleStatus =
  | 'live_or_legacy_existing'
  | 'planned_or_external'
  | 'planned'

export type CollectibleCategory =
  | 'mascot_ecosystem'
  | 'identity'
  | 'participation_proof'
  | 'ai_agent_identity'

export type MetadataStorageStatus = 'pinata_ipfs' | 'ipfs' | 'on_chain_token_uri' | 'not_indexed'

export type SupplyMode = 'existing_collection' | 'planned_collection' | 'not_indexed'

export type MintRouteStatus = 'indexed' | 'not_indexed'

export interface CollectibleMetadataStorage {
  status: MetadataStorageStatus
  gateway?: string
  ipfsCid?: string
  metadataCid?: string
  imagePattern?: string
  tokenUriSource?: 'on_chain' | 'not_indexed'
  notes: string
}

export interface CollectibleSupply {
  mode: SupplyMode
  statedMaxSupply?: number
  supplySource?: 'ui_marketing_copy' | 'not_indexed'
  mintedCountIndexed: false
  notes: string
}

export interface CollectibleMintSurface {
  status: MintRouteStatus
  route?: string
  chainLabel?: string
  notes: string
}

export interface CollectibleContractRef {
  indexed: boolean
  chainId?: number
  address?: string
  label?: string
  notes: string
}

export interface CollectibleLinks {
  detail: string
  mint?: string
  wallet?: string
  market?: string
  external?: string
  collectiblesRegistry: string
}

export interface StaticCollectibleRecord {
  slug: string
  collectibleId: string
  displayName: string
  description: string
  status: CollectibleStatus
  category: CollectibleCategory
  role: string
  contract: CollectibleContractRef
  metadata: CollectibleMetadataStorage
  supply: CollectibleSupply
  mint: CollectibleMintSurface
  relatedRoutes: string[]
  warnings: string[]
  links: CollectibleLinks
  disclaimer: string
  dataSource: string
  asOf: string
  mvpStatic: true
}
