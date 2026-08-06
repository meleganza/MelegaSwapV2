/**
 * Single client hook for Global Data Truth — one fetch path, shared cache.
 * Surfaces should prefer this over spinning up duplicate ranking/featured clients.
 */
import { useMemo } from 'react'
import { useCanonicalMarketSnapshot } from 'lib/market-data'
import { useFeaturedProjectMarkets } from 'views/HomeTrade/useFeaturedProjectMarkets'
import { useTopMoversSnapshotOptional } from 'views/HomeTrade/TopMoversSnapshotContext'
import { GLOBAL_DATA_TRUTH_PIPELINE } from './yieldTruthRanking'

export function useGlobalDataTruth() {
  const market = useCanonicalMarketSnapshot()
  const featured = useFeaturedProjectMarkets()
  const movers = useTopMoversSnapshotOptional()

  return useMemo(
    () => ({
      pipeline: GLOBAL_DATA_TRUTH_PIPELINE,
      volume24hUsd: market.volume24hUsd,
      listedProjects: market.listedProjects,
      markets: market.markets,
      featuredRowsBySlug: featured.rowsBySlug,
      featuredLoading: featured.loading,
      rankedAssets: movers?.rankedAssets ?? [],
      trendingSnapshot: movers?.snapshot ?? null,
      marketStatus: market.status,
      isLoading: market.isLoading || featured.loading,
      fromLastGood: market.fromLastGood,
    }),
    [market, featured, movers],
  )
}

export default useGlobalDataTruth
