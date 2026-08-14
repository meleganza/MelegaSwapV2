/**
 * Single lightweight Top Movers consumer for ticker, Home and Projects.
 * Expensive indexer aggregation runs server-side once per cache window.
 */
import React, { createContext, startTransition, useContext, useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'
import type { MelegaTickerItem } from 'design-system/melega'
import { format24hChangePct } from 'lib/data-truth/compute24hPriceChange'
import {
  readDurableTrendingSnapshot,
  resolveTrendingItemsForDisplay,
  writeDurableTrendingSnapshot,
} from 'lib/trending/durableTrendingSnapshot'
import type { TierRankedAsset } from 'lib/trending/tierTrendingModel'
import {
  HOME_TOP_MOVERS_LIMIT,
  assertIdenticalPrefix,
  buildTopMoversSharedSnapshot,
  entriesToTickerItems,
  homeTopMoversPrefix,
  type TopMoverEntry,
  type TopMoversSharedSnapshot,
} from 'lib/trending/topMoversSharedSnapshot'

type IndexedRibbonAsset = {
  slug: string
  symbol: string
  address: string
  chainId: number
  displayName: string
}

type TopMoversApiPayload = {
  snapshot: TopMoversSharedSnapshot
  rankedAssets: TierRankedAsset[]
  indexedRibbonAssets: IndexedRibbonAsset[]
  indexerScopeNote?: string
  liveMarketAuthority?: boolean
}

type TopMoversSnapshotContextValue = {
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

async function fetchTopMoversSnapshot(url: string): Promise<TopMoversApiPayload> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Top Movers snapshot unavailable (${response.status})`)
  return response.json()
}

function itemsSignature(items: MelegaTickerItem[]): string {
  return items.map((item) => `${item.id}:${item.primary}:${item.accent ?? ''}`).join('|')
}

function durableRankedAssets(entries: TopMoverEntry[]): TierRankedAsset[] {
  return entries.map((entry) => ({
    symbol: entry.symbol,
    slug: entry.address ?? entry.symbol.toLowerCase(),
    pairSlug: entry.address ?? entry.symbol.toLowerCase(),
    address: entry.address ?? '',
    chainId: entry.chainId ?? 56,
    displayName: entry.symbol,
    tierStatus: 'READY',
    change24h: entry.changePct != null ? format24hChangePct(entry.changePct) : undefined,
    volume24h: 0,
    liquidityScore: 0,
    tradeCount24h: 0,
    rankingSignals: ['durableServerSnapshot'],
  }))
}

export const TopMoversSnapshotProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [clientReady, setClientReady] = useState(false)
  const [durableItems, setDurableItems] = useState<MelegaTickerItem[]>([])
  const [durableUpdatedAt, setDurableUpdatedAt] = useState<number>()
  const { data, error } = useSWR<TopMoversApiPayload>(
    clientReady ? '/api/market-data/top-movers' : null,
    fetchTopMoversSnapshot,
    {
      revalidateOnFocus: false,
      refreshWhenHidden: false,
      refreshInterval: 60_000,
      dedupingInterval: 55_000,
      keepPreviousData: true,
    },
  )

  useEffect(() => {
    const durable = readDurableTrendingSnapshot()
    // Hydrate the last-known ticker and enable its revalidation in one
    // transition. This avoids two consecutive shell commits at startup while
    // preserving the exact same visible data and refresh policy.
    startTransition(() => {
      if (durable?.items?.length) {
        setDurableItems(durable.items)
        setDurableUpdatedAt(durable.updatedAt)
      }
      setClientReady(true)
    })
  }, [])

  const liveItems = useMemo(() => (data?.snapshot ? entriesToTickerItems(data.snapshot.entries) : []), [data?.snapshot])
  const resolved = useMemo(
    () =>
      data?.liveMarketAuthority && liveItems.length > 0
        ? { items: liveItems, fromDurable: false, rejectedPartial: false }
        : resolveTrendingItemsForDisplay(liveItems, durableItems, durableUpdatedAt),
    [data?.liveMarketAuthority, liveItems, durableItems, durableUpdatedAt],
  )

  useEffect(() => {
    if (!liveItems.length || resolved.fromDurable || resolved.rejectedPartial) return
    if (itemsSignature(liveItems) === itemsSignature(durableItems)) return
    writeDurableTrendingSnapshot(liveItems)
    startTransition(() => {
      setDurableItems(liveItems)
      setDurableUpdatedAt(Date.now())
    })
  }, [liveItems, durableItems, resolved.fromDurable, resolved.rejectedPartial])

  const value = useMemo((): TopMoversSnapshotContextValue => {
    const snapshot = buildTopMoversSharedSnapshot({
      items: resolved.items,
      fromDurable: resolved.fromDurable,
      // Keep the empty pre-fetch snapshot identical on SSR and first client
      // render. A fresh timestamp here caused a hydration mismatch that could
      // crash query-opened client modals such as Claim Project.
      generatedAt:
        data?.snapshot.generatedAt ??
        (durableUpdatedAt ? new Date(durableUpdatedAt).toISOString() : '1970-01-01T00:00:00.000Z'),
      sourceBlock: data?.snapshot.sourceBlock,
    })
    snapshot.entries = snapshot.entries.map((entry) => ({ ...entry, chainId: entry.chainId ?? 56 }))
    const homeEntries = homeTopMoversPrefix(snapshot, HOME_TOP_MOVERS_LIMIT)
    const rankedAssets =
      !resolved.fromDurable && data?.rankedAssets?.length ? data.rankedAssets : durableRankedAssets(snapshot.entries)
    const indexedRibbonAssets =
      !resolved.fromDurable && data?.indexedRibbonAssets?.length
        ? data.indexedRibbonAssets
        : rankedAssets
            .filter((asset) => Boolean(asset.address))
            .map((asset) => ({
              slug: asset.slug,
              symbol: asset.symbol,
              address: asset.address,
              chainId: asset.chainId,
              displayName: asset.displayName,
            }))

    return {
      snapshot,
      tickerItems: entriesToTickerItems(snapshot.entries),
      homeEntries,
      indexedRibbonAssets,
      rankedAssets,
      isLoading: !data && !error && durableItems.length === 0,
      trendingEmpty: snapshot.entries.length === 0,
      useMarquee: snapshot.entries.length >= 2,
      indexerScopeNote: resolved.fromDurable ? 'Last-known movers · refreshing…' : data?.indexerScopeNote,
      prefixResult: assertIdenticalPrefix(snapshot.entries, homeEntries),
    }
  }, [data, durableItems.length, durableUpdatedAt, error, resolved])

  return <TopMoversSnapshotContext.Provider value={value}>{children}</TopMoversSnapshotContext.Provider>
}

export function useTopMoversSnapshot(): TopMoversSnapshotContextValue {
  const ctx = useContext(TopMoversSnapshotContext)
  if (!ctx) throw new Error('useTopMoversSnapshot requires TopMoversSnapshotProvider')
  return ctx
}

export function useTopMoversSnapshotOptional(): TopMoversSnapshotContextValue | null {
  return useContext(TopMoversSnapshotContext)
}

export default TopMoversSnapshotProvider
