import useDexTrendingRankings from './useDexTrendingRankings'

export default function useDexTrendingTicker() {
  const { items, indexedRibbonAssets, indexerScopeNote, useMarquee, trendingEmpty, isLoading } =
    useDexTrendingRankings()

  return {
    items,
    indexedRibbonAssets,
    indexerScopeNote,
    useMarquee,
    trendingEmpty,
    isLoading,
  }
}
