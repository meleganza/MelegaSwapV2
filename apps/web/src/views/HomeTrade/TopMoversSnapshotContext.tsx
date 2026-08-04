/**
 * Single Top Movers producer for ticker + Home card.
 * Prevents dual useDexTrendingRankings instances from diverging durable state.
 */
import React, { createContext, useContext, useMemo } from 'react'
import type { MelegaTickerItem } from 'design-system/melega'
import {
  HOME_TOP_MOVERS_LIMIT,
  assertIdenticalPrefix,
  buildTopMoversSharedSnapshot,
  entriesToTickerItems,
  homeTopMoversPrefix,
  type TopMoverEntry,
  type TopMoversSharedSnapshot,
} from 'lib/trending/topMoversSharedSnapshot'
import useDexTrendingRankings from './useDexTrendingRankings'

type TopMoversSnapshotContextValue = {
  snapshot: TopMoversSharedSnapshot
  tickerItems: MelegaTickerItem[]
  homeEntries: TopMoverEntry[]
  indexedRibbonAssets: ReturnType<typeof useDexTrendingRankings>['indexedRibbonAssets']
  rankedAssets: ReturnType<typeof useDexTrendingRankings>['rankedAssets']
  isLoading: boolean
  trendingEmpty: boolean
  useMarquee: boolean
  indexerScopeNote?: string
  prefixResult: 'IDENTICAL_PREFIX' | 'MISMATCH'
}

const TopMoversSnapshotContext = createContext<TopMoversSnapshotContextValue | null>(null)

export const TopMoversSnapshotProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
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
        .filter((a) => a.address)
        .map((a) => [a.address!.toLowerCase(), a.chainId] as const),
    )
    const bySym = new Map((rankings.rankedAssets ?? []).map((a) => [a.symbol.toUpperCase(), a.chainId] as const))
    snapshot.entries = snapshot.entries.map((e) => ({
      ...e,
      chainId:
        e.chainId ??
        (e.address ? byAddr.get(e.address.toLowerCase()) : undefined) ??
        bySym.get(e.symbol.toUpperCase()) ??
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
  }, [rankings])

  return <TopMoversSnapshotContext.Provider value={value}>{children}</TopMoversSnapshotContext.Provider>
}

export function useTopMoversSnapshot(): TopMoversSnapshotContextValue {
  const ctx = useContext(TopMoversSnapshotContext)
  if (!ctx) {
    throw new Error('useTopMoversSnapshot requires TopMoversSnapshotProvider')
  }
  return ctx
}

/** Safe hook for surfaces that may render outside the provider during tests. */
export function useTopMoversSnapshotOptional(): TopMoversSnapshotContextValue | null {
  return useContext(TopMoversSnapshotContext)
}

export default TopMoversSnapshotProvider
