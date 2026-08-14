/** Heavy Top Movers producer, isolated from the synchronous application shell. */
import React, { useEffect, useMemo } from 'react'
import {
  HOME_TOP_MOVERS_LIMIT,
  assertIdenticalPrefix,
  buildTopMoversSharedSnapshot,
  entriesToTickerItems,
  homeTopMoversPrefix,
} from 'lib/trending/topMoversSharedSnapshot'
import useDexTrendingRankings from './useDexTrendingRankings'
import type { TopMoversSnapshotContextValue } from './TopMoversSnapshotContext'

export interface TopMoversSnapshotRuntimeProps {
  onSnapshot: React.Dispatch<React.SetStateAction<TopMoversSnapshotContextValue>>
}

export const TopMoversSnapshotRuntime: React.FC<TopMoversSnapshotRuntimeProps> = ({ onSnapshot }) => {
  const rankings = useDexTrendingRankings()

  const value = useMemo((): TopMoversSnapshotContextValue => {
    const snapshot = buildTopMoversSharedSnapshot({
      items: rankings.items,
      fromDurable: rankings.fromDurableSnapshot,
      sourceBlock: null,
    })
    // Enrich chainId from ranked assets (same producer — no second ranking).
    const byAddr = new Map(
      (rankings.rankedAssets ?? [])
        .filter((asset) => asset.address)
        .map((asset) => [asset.address.toLowerCase(), asset.chainId] as const),
    )
    const bySym = new Map(
      (rankings.rankedAssets ?? []).map((asset) => [asset.symbol.toUpperCase(), asset.chainId] as const),
    )
    snapshot.entries = snapshot.entries.map((entry) => ({
      ...entry,
      chainId:
        entry.chainId ??
        (entry.address ? byAddr.get(entry.address.toLowerCase()) : undefined) ??
        bySym.get(entry.symbol.toUpperCase()) ??
        56,
    }))
    const homeEntries = homeTopMoversPrefix(snapshot, HOME_TOP_MOVERS_LIMIT)
    const tickerItems = entriesToTickerItems(snapshot.entries)
    return {
      snapshot,
      tickerItems,
      homeEntries,
      indexedRibbonAssets: rankings.indexedRibbonAssets,
      rankedAssets: rankings.rankedAssets,
      isLoading: rankings.isLoading,
      trendingEmpty: rankings.trendingEmpty,
      useMarquee: rankings.useMarquee,
      indexerScopeNote: rankings.indexerScopeNote,
      prefixResult: assertIdenticalPrefix(snapshot.entries, homeEntries),
    }
  }, [
    rankings.fromDurableSnapshot,
    rankings.indexedRibbonAssets,
    rankings.indexerScopeNote,
    rankings.isLoading,
    rankings.items,
    rankings.rankedAssets,
    rankings.trendingEmpty,
    rankings.useMarquee,
  ])

  useEffect(() => {
    onSnapshot(value)
  }, [onSnapshot, value])

  return null
}

export default TopMoversSnapshotRuntime
