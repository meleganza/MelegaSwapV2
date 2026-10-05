export type GlobalLiquidityPoolStatus =
  | 'ACTIVE_WITH_LIQUIDITY'
  | 'ZERO_LIQUIDITY'
  | 'UNPRICED'
  | 'READ_FAILED'
  | 'INVALID_PAIR'

export type GlobalLiquidityPool = {
  chainId: number
  chainName: string
  pairAddress: string
  token0: string
  token1: string
  symbol0: string
  symbol1: string
  name0?: string
  name1?: string
  decimals0: number
  decimals1: number
  reserve0Raw: string
  reserve1Raw: string
  tvlUsd: string | null
  status: GlobalLiquidityPoolStatus
}

export type GlobalLiquidityChainCensus = {
  chainId: number
  chainName: string
  factory: string
  pairCount: number
  pairsRead: number
  pairsWithLiquidity: number
  pricedCount: number
  unpricedCount: number
  zeroLiquidityCount: number
  readFailedCount: number
  subtotalUsd: string
  error?: string
}

export type GlobalLiquiditySnapshot = {
  schema: 'melega.global-liquidity.v1'
  status: 'complete' | 'partial' | 'unavailable'
  sourceTimestamp: string
  cacheTtlSeconds: number
  refreshTrigger: string
  totalPricedTvlUsd: string
  uniquePairCount: number
  pricedPairCount: number
  unpricedPairCount: number
  chains: GlobalLiquidityChainCensus[]
  pools: GlobalLiquidityPool[]
}
