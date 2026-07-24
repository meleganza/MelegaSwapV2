import type { DexAssetRecord, DexAssetSource, DexAssetStatus, DexAssetSurfaces } from 'lib/dex-asset-index'

/**
 * Canonical token consumed by Swap, Liquidity, Pools, Passport, Projects, Trending, selectors.
 * Single registry surface — no parallel token registries in product code.
 */
export interface CanonicalTokenRecord {
  id: string
  symbol: string
  name: string
  chainId: number
  address: string
  decimals: number
  logo?: string
  logoFallback: 'initials' | 'generic'
  aliases: string[]
  sources: DexAssetSource[]
  status: DexAssetStatus
  surfaces: DexAssetSurfaces
  registrySlug?: string
  /** Underlying dex-asset-index row (implementation detail). */
  asset: DexAssetRecord
}

export type CanonicalTokenRegistryPayload = {
  schema: 'https://melega.finance/schemas/canonical-token-registry/v1'
  generatedAt: string
  tokenCount: number
  logoCount: number
  tokens: CanonicalTokenRecord[]
}
