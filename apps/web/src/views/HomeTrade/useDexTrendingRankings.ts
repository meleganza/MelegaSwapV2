import { useMemo } from 'react'
import useSWR from 'swr'
import { WBNB } from '@pancakeswap/sdk'
import { CAKE, BUSD } from '@pancakeswap/tokens'
import type { MelegaTickerItem } from 'design-system/melega'
import { MARCO_BSC_ADDRESS } from 'design-system/melega/constants/brand'
import { getCanonicalIndexedAssets } from 'lib/canonical-token-registry'
import { computeValid24hPriceChange, format24hChangePct } from 'lib/data-truth/compute24hPriceChange'
import { useIndexerCandles } from 'lib/bsc-indexer/client/useIndexerCandles'
import {
  MELEGA_FACTORY_BSC,
  MELEGA_ROUTER_BSC,
  MARCO_WBNB_PAIR_BSC,
} from 'lib/bsc-indexer/constants'
import type { OhlcvCandle } from 'lib/bsc-indexer/types'
import { useProtocolTransactionsIndexer } from 'lib/runtime-indexing'
import { TransactionType } from 'state/info/types'
import useBUSDPrice from 'hooks/useBUSDPrice'
import { usePriceCakeBusd } from 'state/farms/hooks'
import {
  hasTrendingActivitySignal,
  isQuoteTokenAddress,
  isTrendingTierStatus,
  pickTrendingBaseToken,
  rankTierAssets,
  trendingTickerAccent,
  type TierMetricRow,
  type TierRankedAsset,
} from 'lib/trending/tierTrendingModel'

/** Melega Factory / Router — DEX activity index roots (presentation selection only). */
export const TRENDING_DEX_FACTORY = MELEGA_FACTORY_BSC
export const TRENDING_DEX_ROUTER = MELEGA_ROUTER_BSC

const SECONDS_24H = 86_400
/** Activity window for recent Factory/Router swap ranking (7d). */
const SECONDS_ACTIVITY = 7 * SECONDS_24H
const TRENDING_LIMIT = 10
const MIN_MARQUEE_ITEMS = 2

type ActivityBump = { trades: number; volumeUsd: number; lastTs: number }

type ProtocolActivityRow = {
  eventType?: string
  timestamp?: number
  assetAddresses?: string[]
  amounts?: string[]
}

type IndexerSwapRow = {
  eventType?: string
  blockTimestamp?: number
  token0?: string
  token1?: string
  amount0?: string
  amount1?: string
}

type PairRow = {
  token0?: string
  token1?: string
  reserve0?: string
  reserve1?: string
  classification?: string
}

async function fetchTradeablePairs(): Promise<PairRow[]> {
  try {
    const res = await fetch('/api/indexer/pairs?pageSize=100&classification=tradeable')
    if (!res.ok) return []
    const json = (await res.json()) as { rows?: PairRow[] }
    return json.rows ?? []
  } catch {
    return []
  }
}

async function fetchTierMetrics(): Promise<TierMetricRow[]> {
  try {
    const res = await fetch('/api/indexer/tier-metrics')
    if (!res.ok) return []
    const json = (await res.json()) as { rows?: TierMetricRow[] }
    return json.rows ?? []
  } catch {
    return []
  }
}

async function fetchBnbUsdPrice(): Promise<number | undefined> {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd',
      { headers: { accept: 'application/json' } },
    )
    if (!res.ok) return undefined
    const json = (await res.json()) as { binancecoin?: { usd?: number } }
    const usd = json.binancecoin?.usd
    return usd != null && Number.isFinite(usd) && usd > 0 ? usd : undefined
  } catch {
    return undefined
  }
}

/** Live Melega Factory/Router swap feed (AMM protocol activity). */
async function fetchProtocolActivity(): Promise<ProtocolActivityRow[]> {
  try {
    const res = await fetch('/api/protocol/activity?limit=50')
    if (!res.ok) return []
    const json = (await res.json()) as { events?: ProtocolActivityRow[] }
    return json.events ?? []
  } catch {
    return []
  }
}

/** Durable indexer Swap events for Melega pairs. */
async function fetchIndexerSwapEvents(): Promise<IndexerSwapRow[]> {
  try {
    const res = await fetch('/api/indexer/events?types=Swap&limit=50')
    if (!res.ok) return []
    const json = (await res.json()) as { events?: IndexerSwapRow[] }
    return json.events ?? []
  } catch {
    return []
  }
}

function bumpActivity(
  map: Map<string, ActivityBump>,
  address: string | undefined,
  ts: number,
  volumeUsd: number,
) {
  if (!address || isQuoteTokenAddress(address)) return
  const key = address.toLowerCase()
  const prev = map.get(key) ?? { trades: 0, volumeUsd: 0, lastTs: 0 }
  prev.trades += 1
  prev.volumeUsd += Math.max(0, volumeUsd)
  prev.lastTs = Math.max(prev.lastTs, ts)
  map.set(key, prev)
}

function liquidityScoreForAddress(pairs: PairRow[], address?: string): number {
  if (!address) return 0
  const key = address.toLowerCase()
  let score = 0n
  pairs.forEach((pair) => {
    if (pair.token0?.toLowerCase() === key) score += BigInt(pair.reserve0 ?? '0')
    if (pair.token1?.toLowerCase() === key) score += BigInt(pair.reserve1 ?? '0')
  })
  return Number(score > BigInt(Number.MAX_SAFE_INTEGER) ? Number.MAX_SAFE_INTEGER : score)
}

function marcoIndexerMetrics(
  candles: OhlcvCandle[],
  transactions: ReturnType<typeof useProtocolTransactionsIndexer>['transactions'],
  bnbUsd?: number,
) {
  const cutoff = Math.floor(Date.now() / 1000) - SECONDS_24H
  const recentCandles = candles.filter((c) => c.bucketTimestamp >= cutoff)
  const quoteVolumeWbnb = recentCandles.reduce((sum, c) => sum + (c.quoteVolume ?? 0), 0)
  const tradeCount = recentCandles.reduce((sum, c) => sum + (c.tradeCount ?? 0), 0)
  const txCount24h =
    transactions?.filter((tx) => {
      const ts = Number(tx.timestamp)
      return tx.type === TransactionType.SWAP && Number.isFinite(ts) && ts >= cutoff
    }).length ?? 0
  const resolvedTradeCount = tradeCount > 0 ? tradeCount : txCount24h
  const volumeUsd =
    quoteVolumeWbnb > 0 && bnbUsd != null && Number.isFinite(bnbUsd) ? quoteVolumeWbnb * bnbUsd : 0
  const marcoChange = computeValid24hPriceChange(candles)
  const marcoUsdFromCandle =
    candles[candles.length - 1]?.close != null && bnbUsd
      ? candles[candles.length - 1].close * bnbUsd
      : undefined
  return { volumeUsd, tradeCount: resolvedTradeCount, marcoChange, marcoUsdFromCandle }
}

function resolveTokenPriceUsd(
  address: string,
  symbol: string,
  marcoUsd?: number,
  marcoUsdFromCandle?: number,
  wbnbUsd?: number,
  cakeUsd?: number,
  busdUsd?: number,
): number | undefined {
  const key = address.toLowerCase()
  const sym = symbol.toUpperCase()
  if (sym === 'MARCO' || key === MARCO_BSC_ADDRESS.toLowerCase()) {
    return marcoUsd && marcoUsd > 0 ? marcoUsd : marcoUsdFromCandle
  }
  if (sym === 'WBNB') return wbnbUsd
  if (sym === 'CAKE') return cakeUsd
  if (sym === 'BUSD') return busdUsd && busdUsd > 0 ? busdUsd : undefined
  return undefined
}

export type { TierRankedAsset }

export function useDexTrendingRankings() {
  const marcoPrice = usePriceCakeBusd({ forceMainnet: true })
  const wbnbPrice = useBUSDPrice(WBNB[56])
  const cakePrice = useBUSDPrice(CAKE[56])
  const busdPrice = useBUSDPrice(BUSD[56])
  const { candles, status: candleStatus } = useIndexerCandles(MARCO_WBNB_PAIR_BSC, '1H')
  const { transactions, indexerState } = useProtocolTransactionsIndexer()
  const { data: pairRows = [] } = useSWR('dex-trending-pairs', fetchTradeablePairs, {
    revalidateOnFocus: false,
    dedupingInterval: 120_000,
  })
  const { data: tierMetrics = [] } = useSWR('dex-trending-tier-metrics', fetchTierMetrics, {
    revalidateOnFocus: false,
    dedupingInterval: 120_000,
  })
  const { data: bnbUsd } = useSWR('dex-trending-bnb-usd', fetchBnbUsdPrice, {
    revalidateOnFocus: false,
    dedupingInterval: 120_000,
  })
  const { data: protocolActivity = [] } = useSWR('dex-trending-protocol-activity', fetchProtocolActivity, {
    revalidateOnFocus: false,
    refreshInterval: 30_000,
    dedupingInterval: 15_000,
  })
  const { data: indexerSwaps = [] } = useSWR('dex-trending-indexer-swaps', fetchIndexerSwapEvents, {
    revalidateOnFocus: false,
    refreshInterval: 30_000,
    dedupingInterval: 15_000,
  })

  const effectiveBnbUsd = useMemo(() => {
    if (bnbUsd != null && Number.isFinite(bnbUsd) && bnbUsd > 0) return bnbUsd
    const wbnbUsd = wbnbPrice ? Number(wbnbPrice.toSignificant(6)) : undefined
    return wbnbUsd != null && Number.isFinite(wbnbUsd) && wbnbUsd > 0 ? wbnbUsd : undefined
  }, [bnbUsd, wbnbPrice])

  const marcoMetrics = useMemo(
    () => marcoIndexerMetrics(candles, transactions, effectiveBnbUsd),
    [candles, transactions, effectiveBnbUsd],
  )

  const rankedAssets = useMemo((): TierRankedAsset[] => {
    const canonicalByAddress = new Map(
      getCanonicalIndexedAssets()
        .filter((asset) => asset.address)
        .map((asset) => [asset.address!.toLowerCase(), asset]),
    )
    const marcoUsd = marcoPrice?.toNumber()
    const wbnbUsd = wbnbPrice ? Number(wbnbPrice.toSignificant(6)) : undefined
    const cakeUsd = cakePrice ? Number(cakePrice.toSignificant(6)) : undefined
    const busdUsd = busdPrice ? Number(busdPrice.toSignificant(6)) : undefined
    const activityCutoff = Math.floor(Date.now() / 1000) - SECONDS_ACTIVITY

    // Priority 1: Factory/Router-indexed recent Swap events (protocol activity + durable store).
    const swapActivity = new Map<string, ActivityBump>()

    // Protocol activity + indexer Swap feeds are already recent-capped server-side.
    for (const ev of protocolActivity) {
      if (ev.eventType && !/swap/i.test(ev.eventType)) continue
      const ts = Number(ev.timestamp) || Math.floor(Date.now() / 1000)
      const addrs = ev.assetAddresses ?? []
      let volumeUsd = 0
      if (effectiveBnbUsd && addrs.length >= 2 && ev.amounts?.length) {
        const iWbnb = addrs.findIndex((a) => a && isQuoteTokenAddress(a) && a.toLowerCase().startsWith('0xbb4c'))
        if (iWbnb >= 0) {
          const amt = Math.abs(Number(ev.amounts[iWbnb] ?? 0))
          if (Number.isFinite(amt)) volumeUsd = amt * effectiveBnbUsd
        }
      }
      for (const addr of addrs) {
        const key = addr?.toLowerCase()
        if (!key) continue
        if (!canonicalByAddress.has(key) && key !== MARCO_BSC_ADDRESS.toLowerCase()) continue
        bumpActivity(swapActivity, addr, ts, volumeUsd / Math.max(1, addrs.filter((a) => a && !isQuoteTokenAddress(a)).length))
      }
    }

    for (const ev of indexerSwaps) {
      if (ev.eventType && !/swap/i.test(ev.eventType)) continue
      const ts = Number(ev.blockTimestamp) || Math.floor(Date.now() / 1000)
      let volumeUsd = 0
      if (effectiveBnbUsd) {
        const t0 = ev.token0?.toLowerCase()
        const t1 = ev.token1?.toLowerCase()
        if (t0 && isQuoteTokenAddress(t0) && t0.startsWith('0xbb4c')) {
          const amt = Math.abs(Number(ev.amount0 ?? 0))
          if (Number.isFinite(amt)) volumeUsd = amt * effectiveBnbUsd
        } else if (t1 && isQuoteTokenAddress(t1) && t1.startsWith('0xbb4c')) {
          const amt = Math.abs(Number(ev.amount1 ?? 0))
          if (Number.isFinite(amt)) volumeUsd = amt * effectiveBnbUsd
        }
      }
      bumpActivity(swapActivity, ev.token0, ts, volumeUsd / 2)
      bumpActivity(swapActivity, ev.token1, ts, volumeUsd / 2)
    }

    for (const tx of transactions ?? []) {
      if (tx.type !== TransactionType.SWAP) continue
      const ts = Number(tx.timestamp)
      if (!Number.isFinite(ts) || ts < activityCutoff) continue
      const vol = Number.isFinite(tx.amountUSD) ? Math.max(0, tx.amountUSD) / 2 : 0
      bumpActivity(swapActivity, tx.token0Address, ts, vol)
      bumpActivity(swapActivity, tx.token1Address, ts, vol)
    }

    // Always credit MARCO when candle/indexer swap count exists (featured Melega pair).
    if (marcoMetrics.tradeCount > 0 || marcoMetrics.volumeUsd > 0) {
      const key = MARCO_BSC_ADDRESS.toLowerCase()
      const prev = swapActivity.get(key) ?? { trades: 0, volumeUsd: 0, lastTs: 0 }
      prev.trades = Math.max(prev.trades, marcoMetrics.tradeCount)
      prev.volumeUsd = Math.max(prev.volumeUsd, marcoMetrics.volumeUsd)
      prev.lastTs = Math.max(prev.lastTs, Math.floor(Date.now() / 1000))
      swapActivity.set(key, prev)
    }

    const byAddress = new Map<string, TierRankedAsset>()

    const upsert = (asset: TierRankedAsset) => {
      const key = asset.address.toLowerCase()
      const existing = byAddress.get(key)
      if (!existing) {
        byAddress.set(key, asset)
        return
      }
      byAddress.set(key, {
        ...existing,
        volume24h: Math.max(existing.volume24h, asset.volume24h),
        tradeCount24h: Math.max(existing.tradeCount24h, asset.tradeCount24h),
        lastActivityTs: Math.max(existing.lastActivityTs ?? 0, asset.lastActivityTs ?? 0) || undefined,
        change24h: existing.change24h ?? asset.change24h,
        priceUsd: existing.priceUsd ?? asset.priceUsd,
        liquidityScore: Math.max(existing.liquidityScore, asset.liquidityScore),
        rankingSignals: Array.from(new Set([...existing.rankingSignals, ...asset.rankingSignals])),
      })
    }

    // Priority 2/3: pair / tier metrics activity.
    for (const row of tierMetrics) {
      if (!isTrendingTierStatus(row.status)) continue

      const baseAddress = pickTrendingBaseToken(row.token0, row.token1)
      const canonical = canonicalByAddress.get(baseAddress.toLowerCase())
      if (!canonical?.address) continue

      const sym = canonical.symbol
      const addrKey = canonical.address.toLowerCase()
      const isMarcoPair = row.slug === 'marco-wbnb' || addrKey === MARCO_BSC_ADDRESS.toLowerCase()
      const fromSwaps = swapActivity.get(addrKey)

      let volume24h =
        row.volume24hQuote > 0 && effectiveBnbUsd ? row.volume24hQuote * effectiveBnbUsd : 0
      let tradeCount24h = row.tradeCount24h
      let change24h =
        row.priceChange24h != null &&
        Number.isFinite(row.priceChange24h) &&
        Math.abs(row.priceChange24h) > 0.0001
          ? format24hChangePct(row.priceChange24h)
          : undefined
      let lastActivityTs = fromSwaps?.lastTs

      if (fromSwaps) {
        tradeCount24h = Math.max(tradeCount24h, fromSwaps.trades)
        volume24h = Math.max(volume24h, fromSwaps.volumeUsd)
      }

      if (isMarcoPair) {
        volume24h = Math.max(volume24h, marcoMetrics.volumeUsd)
        tradeCount24h = Math.max(tradeCount24h, marcoMetrics.tradeCount)
        change24h = marcoMetrics.marcoChange ?? change24h
      }

      if (
        !hasTrendingActivitySignal({
          tradeCount24h,
          volume24h,
          lastActivityTs,
        })
      ) {
        continue
      }

      const priceUsd = resolveTokenPriceUsd(
        canonical.address,
        sym,
        marcoUsd,
        marcoMetrics.marcoUsdFromCandle,
        wbnbUsd,
        cakeUsd,
        busdUsd,
      )
      const liquidityScore = liquidityScoreForAddress(pairRows, canonical.address)
      const signals: string[] = []
      if (fromSwaps?.trades) signals.push('recentSwaps')
      if (volume24h > 0) signals.push('volume24h')
      if (tradeCount24h > 0) signals.push('trades24h')
      if (change24h) signals.push('change24h')

      upsert({
        symbol: sym,
        slug: canonical.registrySlug ?? canonical.id,
        pairSlug: row.slug,
        address: canonical.address,
        chainId: canonical.chainId,
        displayName: canonical.name ?? sym,
        tierStatus: row.status as TierRankedAsset['tierStatus'],
        priceUsd: priceUsd && priceUsd > 0 ? priceUsd : undefined,
        change24h,
        volume24h,
        liquidityScore,
        tradeCount24h,
        lastActivityTs,
        rankingSignals: signals,
      })
    }

    // Promote swap-active canonical tokens even when tier row missing.
    for (const [addr, act] of swapActivity) {
      if (byAddress.has(addr)) continue
      const canonical = canonicalByAddress.get(addr)
      if (!canonical?.address) continue
      if (!hasTrendingActivitySignal({ tradeCount24h: act.trades, volume24h: act.volumeUsd, lastActivityTs: act.lastTs })) {
        continue
      }
      const isMarco = addr === MARCO_BSC_ADDRESS.toLowerCase()
      upsert({
        symbol: canonical.symbol,
        slug: canonical.registrySlug ?? canonical.id,
        pairSlug: isMarco ? 'marco-wbnb' : canonical.registrySlug ?? canonical.id,
        address: canonical.address,
        chainId: canonical.chainId,
        displayName: canonical.name ?? canonical.symbol,
        tierStatus: 'READY',
        priceUsd: resolveTokenPriceUsd(
          canonical.address,
          canonical.symbol,
          marcoUsd,
          marcoMetrics.marcoUsdFromCandle,
          wbnbUsd,
          cakeUsd,
          busdUsd,
        ),
        change24h: isMarco ? marcoMetrics.marcoChange : undefined,
        volume24h: Math.max(act.volumeUsd, isMarco ? marcoMetrics.volumeUsd : 0),
        liquidityScore: liquidityScoreForAddress(pairRows, canonical.address),
        tradeCount24h: Math.max(act.trades, isMarco ? marcoMetrics.tradeCount : 0),
        lastActivityTs: act.lastTs,
        rankingSignals: ['recentSwaps'],
      })
    }

    const active = [...byAddress.values()].filter((c) =>
      hasTrendingActivitySignal({
        tradeCount24h: c.tradeCount24h,
        volume24h: c.volume24h,
        lastActivityTs: c.lastActivityTs,
      }),
    )

    // Display requires factual ↑/↓ % — never invent; never "Price unavailable".
    const withMove = active.filter(
      (c) => c.change24h != null && Number.isFinite(c.change24h.pct) && Math.abs(c.change24h.pct) > 0.0001,
    )

    // If activity exists but no % yet, still surface top active tokens (symbol only).
    const pool = withMove.length > 0 ? withMove : active
    return rankTierAssets(pool, TRENDING_LIMIT)
  }, [
    tierMetrics,
    pairRows,
    marcoPrice,
    wbnbPrice,
    cakePrice,
    busdPrice,
    marcoMetrics,
    effectiveBnbUsd,
    transactions,
    protocolActivity,
    indexerSwaps,
  ])

  const trendingTickerItems = useMemo((): MelegaTickerItem[] => {
    return rankedAssets.map((asset) => {
      const { accent, accentPositive } = trendingTickerAccent(asset)
      return {
        id: `trade-asset-${asset.slug}`,
        primary: asset.symbol,
        // TOKEN + direction % only — no price secondary line.
        accent,
        accentPositive,
        href: asset.address ? `/swap?outputCurrency=${asset.address}` : `/@${asset.slug}`,
      }
    })
  }, [rankedAssets])

  const indexedRibbonAssets = useMemo(
    () =>
      rankedAssets.map((asset) => ({
        slug: asset.slug,
        symbol: asset.symbol,
        address: asset.address,
        chainId: asset.chainId,
        displayName: asset.displayName,
      })),
    [rankedAssets],
  )

  const trendingEmpty = useMemo(() => trendingTickerItems.length === 0, [trendingTickerItems.length])

  const indexerScopeNote = useMemo(() => {
    if (rankedAssets.length === 0) return undefined
    return 'Indexed DEX activity · swap count · volume · recent trades'
  }, [rankedAssets.length])

  return {
    items: trendingTickerItems,
    indexedRibbonAssets,
    trendingEmpty,
    isLoading: candleStatus === 'loading',
    indexerScopeNote,
    rankedCount: rankedAssets.length,
    rankedAssets,
    useMarquee: rankedAssets.length >= MIN_MARQUEE_ITEMS,
    indexerState,
  }
}

export default useDexTrendingRankings
