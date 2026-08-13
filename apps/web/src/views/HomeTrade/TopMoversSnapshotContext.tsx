/**
 * Single Top Movers producer for ticker + Home card.
 * Prevents dual useDexTrendingRankings instances from diverging durable state.
 */
import dynamic from 'next/dynamic'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import type { MelegaTickerItem } from 'design-system/melega'
import type { TierRankedAsset } from 'lib/trending/tierTrendingModel'
import {
  HOME_TOP_MOVERS_LIMIT,
  assertIdenticalPrefix,
  buildTopMoversSharedSnapshot,
  homeTopMoversPrefix,
  type TopMoverEntry,
  type TopMoversSharedSnapshot,
} from 'lib/trending/topMoversSharedSnapshot'
import { readDurableTrendingSnapshot } from 'lib/trending/durableTrendingSnapshot'

type IndexedRibbonAsset = Pick<TierRankedAsset, 'slug' | 'symbol' | 'address' | 'chainId' | 'displayName'>

export type TopMoversSnapshotContextValue = {
  snapshot: TopMoversSharedSnapshot
  tickerItems: MelegaTickerItem[]
  homeEntries: TopMoverEntry[]
  indexedRibbonAssets: IndexedRibbonAsset[]
  rankedAssets: TierRankedAsset[]
  isLoading: boolean
  trendingEmpty: boolean
  useMarquee: boolean
  indexerScopeNote?: string
  prefixResult: 'IDENTICAL_PREFIX' | 'MISMATCH'
}

const TopMoversSnapshotContext = createContext<TopMoversSnapshotContextValue | null>(null)

const EMPTY_SNAPSHOT: TopMoversSharedSnapshot = {
  schema: 'melega.top-movers.shared-snapshot.v1',
  snapshotId: 'tm-pending-runtime',
  generatedAt: '1970-01-01T00:00:00.000Z',
  sourceBlock: null,
  fromDurable: false,
  entries: [],
}

const EMPTY_VALUE: TopMoversSnapshotContextValue = {
  snapshot: EMPTY_SNAPSHOT,
  tickerItems: [],
  homeEntries: [],
  indexedRibbonAssets: [],
  rankedAssets: [],
  isLoading: true,
  trendingEmpty: true,
  useMarquee: false,
  indexerScopeNote: undefined,
  prefixResult: 'IDENTICAL_PREFIX',
}

const TopMoversSnapshotRuntime = dynamic(() => import('./TopMoversSnapshotRuntime'), {
  ssr: false,
  loading: () => null,
})

/**
 * Keep every consumer on one context while moving price/indexer/token inventory
 * out of first paint. The fixed shell and all one-click navigation render with a
 * deterministic empty snapshot; the single data producer joins at browser idle.
 */
export const TopMoversSnapshotProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const router = useRouter()
  const [value, setValue] = useState<TopMoversSnapshotContextValue>(EMPTY_VALUE)
  const [runtimeReady, setRuntimeReady] = useState(false)
  const isHomeRoute = router.pathname === '/'

  useEffect(() => {
    const durable = readDurableTrendingSnapshot()
    if (!durable?.items?.length) return
    setValue((current) => {
      if (current.tickerItems.length) return current
      const snapshot = buildTopMoversSharedSnapshot({
        items: durable.items,
        fromDurable: true,
        generatedAt: new Date(durable.updatedAt).toISOString(),
      })
      const homeEntries = homeTopMoversPrefix(snapshot, HOME_TOP_MOVERS_LIMIT)
      return {
        ...current,
        tickerItems: durable.items,
        homeEntries,
        isLoading: false,
        trendingEmpty: false,
        useMarquee: durable.items.length >= 5,
        snapshot,
        prefixResult: assertIdenticalPrefix(snapshot.entries, homeEntries),
      }
    })
  }, [])

  useEffect(() => {
    // The full ranking producer reads hundreds of pairs/swaps and external
    // quotes. It belongs to Home, not to every route in the application shell.
    // Keeping it mounted globally made Safari's main thread unavailable while
    // navigating between Liquidity, Farms, Pools and List.
    if (!isHomeRoute) {
      setRuntimeReady(false)
      return undefined
    }

    const idleWindow = window as typeof window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number
      cancelIdleCallback?: (handle: number) => void
    }

    if (idleWindow.requestIdleCallback) {
      const idleHandle = idleWindow.requestIdleCallback(() => setRuntimeReady(true), { timeout: 1600 })
      return () => idleWindow.cancelIdleCallback?.(idleHandle)
    }

    const timeoutHandle = window.setTimeout(() => setRuntimeReady(true), 450)
    return () => window.clearTimeout(timeoutHandle)
  }, [isHomeRoute])

  return (
    <TopMoversSnapshotContext.Provider value={value}>
      {runtimeReady ? <TopMoversSnapshotRuntime onSnapshot={setValue} /> : null}
      {children}
    </TopMoversSnapshotContext.Provider>
  )
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
