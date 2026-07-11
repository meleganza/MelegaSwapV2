import useDexTrendingRankings from './useDexTrendingRankings'

export default function useDexTrendingTicker() {
  const { items, indexedRibbonAssets, unavailableReason, indexerScopeNote } = useDexTrendingRankings()

  return {
    items,
    indexedRibbonAssets,
    unavailableReason,
    indexerScopeNote,
  }
}
