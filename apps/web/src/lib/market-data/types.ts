/**
 * Canonical Melega DEX market-data snapshot types — single certified dataset.
 */

export type MarketFreshness = 'fresh' | 'stale' | 'unavailable'
export type MarketConfidence = 'high' | 'medium' | 'low' | 'none'

export type CanonicalPairObservation = {
  pairAddress: string
  token0: string
  token1: string
  slug: string
  tier?: string
  baseVolume24h: number
  quoteVolume24h: number
  volume24hWbnb: number
  volume24hUsd?: number
  tradeCount24h: number
  priceChange24hPct?: number
  liquidityUsd?: number
  priceUsd?: number
  priced: boolean
  priceSource: 'bnb-usd' | 'unpriced'
  status: string
  confidence: MarketConfidence
  freshness: MarketFreshness
}

export type CanonicalFeaturedObservation = {
  slug: string
  symbol: string
  tokenAddress: string
  pairAddress?: string
  priceUsd?: number
  priceWbnb?: number
  volume24hUsd?: number
  volume24hWbnb?: number
  tradeCount24h?: number
  liquidityUsd?: number
  fdvUsd?: number
  marketCapLabel: 'Fully Diluted Value' | 'Unavailable' | 'Market Cap'
  unavailableReason?: string
  changePct?: number
  status: string
  bnbUsd?: number
  source: string
  confidence: MarketConfidence
  /** Pool APR not owned by featured markets — reserved when attached. */
  apr?: number
}

export type CanonicalAprPool = {
  sousId: number
  contractAddress?: string
  stakeSymbol?: string
  rewardSymbol?: string
  apr?: number
  aprDisplay?: string
  tvlUsd?: number
  eligibleForTopPools: boolean
  eligibilityReason: string
  confidence: MarketConfidence
}

export type CanonicalTrendingSnapshotMeta = {
  schema: string
  atomicPublish: true
  minCompleteAbs: number
  minCompleteRatio: number
  minTenureMs: number
  durableKey: string
}

export type CanonicalMarketSnapshot = {
  schema: 'melega.canonical-market-snapshot.v1'
  snapshotId: string
  generatedAt: string
  chainId: 56
  bnbUsd?: number
  bnbUsdSource?: string
  volume24hWbnb: number
  volume24hUsd?: number
  volumeMethodology: string
  unpricedPairCount: number
  pricedPairCount: number
  swapEventCount24h: number
  tvlUsd?: number
  tvlMethodology: string
  listedProjects: number
  listedProjectsProvenance: string
  markets: number
  marketsMethodology: string
  pairs: CanonicalPairObservation[]
  featured: CanonicalFeaturedObservation[]
  aprPools: CanonicalAprPool[]
  trending: CanonicalTrendingSnapshotMeta
  coverage: {
    trackedTokens: number
    pricedTokens: number
    featuredCoverage: string
    fdvCoverage: string
    volumeCoverage: string
    priceCoverage: string
    aprEnabledPools: number
  }
  sanity: {
    ok: boolean
    degraded: boolean
    issues: Array<{ code: string; detail: string; severity: string }>
  }
  fromLastGood?: boolean
  status: 'LIVE' | 'DEGRADED' | 'LAST_GOOD' | 'UNAVAILABLE'
}
