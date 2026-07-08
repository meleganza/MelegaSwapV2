export type DexAssetSource =
  | 'registry'
  | 'asset-registry'
  | 'token-list'
  | 'farm'
  | 'pool'
  | 'venue'
  | 'liquidity'
  | 'canonical'

export type DexAssetStatus = 'canonical' | 'listed' | 'observed' | 'token-list'

export interface DexAssetSurfaces {
  trade: boolean
  pool: boolean
  farm: boolean
  project: boolean
  radar: boolean
  trending: boolean
}

export interface DexAssetRecord {
  id: string
  symbol: string
  name?: string
  chainId: number
  address?: string
  logo?: string
  logoFallback: 'initials' | 'generic'
  sources: DexAssetSource[]
  status: DexAssetStatus
  surfaces: DexAssetSurfaces
  registrySlug?: string
}

export interface DexAssetIndexPayload {
  schema: 'https://melega.finance/schemas/dex-asset-index/v1'
  generatedAt: string
  assetCount: number
  projectSurfaceCount: number
  trendingSurfaceCount: number
  assets: DexAssetRecord[]
}
