import { useTopMoversSnapshot } from './TopMoversSnapshotContext'

/** Ticker consumer — reads the shared Top Movers snapshot (never a second ranking instance). */
export default function useDexTrendingTicker() {
  const {
    tickerItems,
    indexedRibbonAssets,
    indexerScopeNote,
    useMarquee,
    trendingEmpty,
    isLoading,
  } = useTopMoversSnapshot()

  return {
    items: tickerItems,
    indexedRibbonAssets,
    indexerScopeNote,
    useMarquee,
    trendingEmpty,
    isLoading,
  }
}
