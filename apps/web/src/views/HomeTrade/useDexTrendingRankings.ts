import { useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'
import { WBNB } from '@pancakeswap/sdk'
import { CAKE, BUSD } from '@pancakeswap/tokens'
import type { MelegaTickerItem } from 'design-system/melega'
import { MARCO_BSC_ADDRESS } from 'design-system/melega/constants/brand'
import { getCanonicalIndexedAssets } from 'lib/canonical-token-registry'
import {
  computeFactualPriceChange,
  computeChangeFromObservations,
  format24hChangePct,
} from 'lib/data-truth/compute24hPriceChange'
import { useIndexerCandles } from 'lib/bsc-indexer/client/useIndexerCandles'
import { MELEGA_FACTORY_BSC, MELEGA_ROUTER_BSC, MARCO_WBNB_PAIR_BSC } from 'lib/bsc-indexer/constants'
import type { OhlcvCandle } from 'lib/bsc-indexer/types'
import { useProtocolTransactionsIndexer } from 'lib/runtime-indexing'
import { TransactionType } from 'state/info/types'
import useBUSDPrice from 'hooks/useBUSDPrice'
import { usePriceCakeBusd } from 'state/farms/hooks'
import defaultTokenList from 'config/constants/tokenLists/pancake-default.tokenlist.json'
import {
  hasTrendingSwapActivity,
  isQuoteTokenAddress,
  isTrendingTierStatus,
  pickTrendingBaseToken,
  trendingTickerAccent,
  type TierMetricRow,
  type TierRankedAsset,
} from 'lib/trending/tierTrendingModel'
import {
  readDurableTrendingSnapshot,
  resolveTrendingItemsForDisplay,
  writeDurableTrendingSnapshot,
} from 'lib/trending/durableTrendingSnapshot'
import { mergeTickerWithPaidPlacements } from 'lib/trending/paidTickerPlacements'
import type { PaidTickerPlacement } from 'lib/trending/paidTickerPlacements'
import { getAllProjects } from 'registry/projects/getAllProjects'
import { resolveCanonicalProjectHref } from 'lib/projects/canonicalProjectHref'
import { formatCompactPriceUsd } from 'utils/formatCompactPrice'

type TokenListEntry = { chainId?: number; address?: string; symbol?: string; name?: string }

type ActiveTrendBoostResponse = {
  placements?: Array<{
    orderId: string
    projectId: string
    projectSlug: string | null
    projectContract: string | null
    chainId: number
    startsAt: string | null
    endsAt: string | null
  }>
}

const TOKEN_LIST_BY_ADDRESS: Map<string, TokenListEntry> = (() => {
  const map = new Map<string, TokenListEntry>()
  for (const raw of (defaultTokenList.tokens ?? []) as TokenListEntry[]) {
    if (raw.chainId !== 56 || !raw.address || !raw.symbol) continue
    map.set(raw.address.toLowerCase(), raw)
  }
  return map
})()

async function fetchActiveTrendBoosts(): Promise<PaidTickerPlacement[]> {
  try {
    const res = await fetch('/api/trend-boost/active')
    if (!res.ok) return []
    const body = (await res.json()) as ActiveTrendBoostResponse
    const projects = getAllProjects()
    return (body.placements ?? []).flatMap((placement) => {
      const contract = placement.projectContract?.toLowerCase() ?? null
      const project = projects.find(
        (candidate) =>
          candidate.slug === placement.projectSlug ||
          candidate.aliases?.includes(placement.projectSlug || '') ||
          candidate.resources.tokens.some(
            (token) => token.chainId === placement.chainId && token.address.toLowerCase() === contract,
          ),
      )
      const token =
        project?.resources.tokens.find((candidate) => candidate.chainId === placement.chainId) ??
        (contract ? TOKEN_LIST_BY_ADDRESS.get(contract) : undefined)
      const address = placement.projectContract ?? token?.address ?? null
      const symbol = token?.symbol
      if (!symbol) return []
      return [
        {
          id: placement.orderId,
          kind: 'boosted' as const,
          symbol,
          chainId: placement.chainId,
          address,
          href: resolveCanonicalProjectHref({
            slug: project?.slug ?? placement.projectSlug,
            chainId: placement.chainId,
            address,
          }),
          startsAt: placement.startsAt,
          endsAt: placement.endsAt,
        },
      ]
    })
  } catch {
    return []
  }
}

/** Melega Factory / Router — DEX activity index roots (presentation selection only). */
export const TRENDING_DEX_FACTORY = MELEGA_FACTORY_BSC
export const TRENDING_DEX_ROUTER = MELEGA_ROUTER_BSC

const SECONDS_24H = 86_400
/**
 * Activity window for Factory/Router swap ranking.
 * Featured-pair indexer currently retains sparse historical Swap rows — use 90d
 * so real indexed movers are not dropped while 24h tier metrics remain empty.
 */
const SECONDS_ACTIVITY = 90 * SECONDS_24H
/** Display cap for ticker / shared Top Movers snapshot (ranked from full indexed universe). */
export const TRENDING_LIMIT = 40
const MIN_MARQUEE_ITEMS = 2

type ActivityBump = { trades: number; volumeUsd: number; lastTs: number; traders: Set<string> }

type ProtocolActivityRow = {
  eventType?: string
  timestamp?: number
  assetAddresses?: string[]
  amounts?: string[]
  wallet?: string
}

type IndexerSwapRow = {
  eventType?: string
  blockTimestamp?: number
  token0?: string
  token1?: string
  amount0?: string
  amount1?: string
  wallet?: string
}

type PairRow = {
  token0?: string
  token1?: string
  reserve0?: string
  reserve1?: string
  classification?: string
  active?: boolean
  lastVerified?: string
}

async function fetchTradeablePairs(): Promise<PairRow[]> {
  try {
    const res = await fetch('/api/indexer/pairs?pageSize=500&classification=tradeable')
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
      'https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd&include_24hr_change=true',
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

type ExternalTokenQuote = {
  priceUsd: number
  change24hPct: number
  volume24hUsd?: number
  source: 'coingecko'
}

/**
 * Well-known CoinGecko coin IDs mapped to BSC contract addresses.
 * Free CG tiers reject multi-contract `token_price` batches — use `simple/price` IDs first.
 */
const COINGECKO_ID_BY_ADDRESS: Record<string, string> = {
  [MARCO_BSC_ADDRESS.toLowerCase()]: 'melega',
  '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82': 'pancakeswap-token', // CAKE
  '0xfb5b838b6cfeedc2873ab27866079ac55363d37e': 'floki', // FLOKI BSC
  '0x7083609fce4d1d8dc0c979aab8c869ea2c873402': 'polkadot', // DOT BSC peg
  '0x2170ed0880ac9a755fd29b2688956bd959f933f8': 'ethereum', // ETH BSC
  '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c': 'bitcoin', // BTCB
}

function ingestCgQuote(
  out: Map<string, ExternalTokenQuote>,
  address: string,
  row?: { usd?: number; usd_24h_change?: number; usd_24h_vol?: number },
) {
  const priceUsd = row?.usd
  const change = row?.usd_24h_change
  if (priceUsd == null || !Number.isFinite(priceUsd) || priceUsd <= 0) return
  if (change == null || !Number.isFinite(change)) return
  out.set(address.toLowerCase(), {
    priceUsd,
    change24hPct: change,
    volume24hUsd:
      row.usd_24h_vol != null && Number.isFinite(row.usd_24h_vol) && row.usd_24h_vol > 0 ? row.usd_24h_vol : undefined,
    source: 'coingecko',
  })
}

/**
 * CoinGecko factual external prices / 24h % / volume.
 * Priority: simple/price by coin id → sequential single-contract token_price.
 * Never invents missing contracts.
 */
async function fetchCoinGeckoTokenQuotes(addresses: string[]): Promise<Map<string, ExternalTokenQuote>> {
  const out = new Map<string, ExternalTokenQuote>()
  const unique = Array.from(new Set(addresses.map((a) => a.toLowerCase()).filter((a) => /^0x[a-f0-9]{40}$/.test(a))))

  const idPairs = Object.entries(COINGECKO_ID_BY_ADDRESS).filter(
    ([addr]) => unique.includes(addr) || unique.length === 0,
  )
  // Always request the known ecosystem set even when pair index is sparse.
  const idList = Array.from(new Set([...idPairs.map(([, id]) => id), ...Object.values(COINGECKO_ID_BY_ADDRESS)]))
  if (idList.length) {
    try {
      const url =
        `https://api.coingecko.com/api/v3/simple/price?ids=${idList.join(',')}` +
        `&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`
      const res = await fetch(url, { headers: { accept: 'application/json' } })
      if (res.ok) {
        const json = (await res.json()) as Record<
          string,
          { usd?: number; usd_24h_change?: number; usd_24h_vol?: number }
        >
        for (const [addr, id] of Object.entries(COINGECKO_ID_BY_ADDRESS)) {
          ingestCgQuote(out, addr, json[id])
        }
      }
    } catch {
      // keep going to contract path
    }
  }

  // Free tier: 1 contract per token_price — probe remaining in parallel (bounded).
  const remaining = unique.filter((a) => !out.has(a)).slice(0, 8)
  await Promise.all(
    remaining.map(async (addr) => {
      try {
        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), 2500)
        const url =
          `https://api.coingecko.com/api/v3/simple/token_price/binance-smart-chain` +
          `?contract_addresses=${addr}` +
          `&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`
        const res = await fetch(url, { headers: { accept: 'application/json' }, signal: controller.signal })
        clearTimeout(timer)
        if (!res.ok) return
        const json = (await res.json()) as Record<
          string,
          { usd?: number; usd_24h_change?: number; usd_24h_vol?: number }
        >
        ingestCgQuote(out, addr, json[addr] ?? json[Object.keys(json)[0] ?? ''])
      } catch {
        // keep partial
      }
    }),
  )
  return out
}

/** Live Melega Factory/Router swap feed (AMM protocol activity). */
async function fetchProtocolActivity(): Promise<ProtocolActivityRow[]> {
  try {
    const res = await fetch('/api/protocol/activity?limit=100')
    if (!res.ok) return []
    const json = (await res.json()) as { events?: ProtocolActivityRow[] }
    return json.events ?? []
  } catch {
    return []
  }
}

/** Durable indexer Swap events for Melega pairs (API may fall back to production store). */
async function fetchIndexerSwapEvents(): Promise<IndexerSwapRow[]> {
  try {
    const res = await fetch('/api/indexer/events?types=Swap&limit=500')
    if (!res.ok) return []
    const json = (await res.json()) as { events?: IndexerSwapRow[] }
    return json.events ?? []
  } catch {
    return []
  }
}

/**
 * Top Movers % — prefer rolling 24h candles; otherwise longest explicitly labelled factual span.
 */
function computeIndexedMove(candles: OhlcvCandle[]): ReturnType<typeof computeFactualPriceChange> {
  return computeFactualPriceChange(candles)
}

function priceObservationsFromSwaps(
  events: IndexerSwapRow[],
  baseAddress: string,
  decimalsHint = 18,
): Array<{ ts: number; price: number }> {
  const base = baseAddress.toLowerCase()
  const out: Array<{ ts: number; price: number }> = []
  for (const ev of events) {
    if (ev.eventType && !/swap/i.test(ev.eventType)) continue
    const ts = Number(ev.blockTimestamp) || 0
    if (!Number.isFinite(ts) || ts <= 0) continue
    const t0 = ev.token0?.toLowerCase()
    const t1 = ev.token1?.toLowerCase()
    const a0 = Math.abs(Number(ev.amount0 ?? 0))
    const a1 = Math.abs(Number(ev.amount1 ?? 0))
    if (!Number.isFinite(a0) || !Number.isFinite(a1) || a0 <= 0 || a1 <= 0) continue
    let price: number | undefined
    if (t0 === base && t1 && isQuoteTokenAddress(t1)) {
      price = a1 / a0
    } else if (t1 === base && t0 && isQuoteTokenAddress(t0)) {
      price = a0 / a1
    }
    if (price != null && Number.isFinite(price) && price > 0 && price < 1e12) {
      // Reject absurd decimal-scale spikes.
      if (decimalsHint === 18 && (price > 1e9 || price < 1e-18)) continue
      out.push({ ts, price })
    }
  }
  return out
}

/** Reject extreme %-moves without enough swap / external / liquidity evidence. */
export function isCredibleMoverChange(input: {
  pct: number
  tradeCount24h: number
  volume24h: number
  liquidityScore: number
  externalVolumeUsd?: number
  hasExternalChange?: boolean
}): boolean {
  const abs = Math.abs(input.pct)
  if (!Number.isFinite(abs) || abs <= 0.0001) return false
  const hasInternal = input.tradeCount24h >= 1 || input.volume24h > 0
  const hasExternal =
    Boolean(input.hasExternalChange) &&
    ((input.externalVolumeUsd != null && input.externalVolumeUsd > 0) || input.liquidityScore > 0)
  if (!hasInternal && !hasExternal) return false
  if (hasInternal) {
    if (abs > 25 && input.tradeCount24h < 3) return false
    if (abs > 40 && input.liquidityScore <= 0) return false
    if (abs > 80) return false
  } else if (abs > 60) {
    return false
  }
  return true
}

function formatTickerPriceUsd(priceUsd: number): string {
  if (!Number.isFinite(priceUsd) || priceUsd <= 0) return ''
  return formatCompactPriceUsd(priceUsd)
}

function bumpActivity(
  map: Map<string, ActivityBump>,
  address: string | undefined,
  ts: number,
  volumeUsd: number,
  wallet?: string,
) {
  if (!address || isQuoteTokenAddress(address)) return
  const key = address.toLowerCase()
  const prev = map.get(key) ?? { trades: 0, volumeUsd: 0, lastTs: 0, traders: new Set<string>() }
  prev.trades += 1
  prev.volumeUsd += Math.max(0, volumeUsd)
  prev.lastTs = Math.max(prev.lastTs, ts)
  if (wallet) prev.traders.add(wallet.toLowerCase())
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

function resolveDisplayMeta(
  address: string,
  canonicalByAddress: Map<string, ReturnType<typeof getCanonicalIndexedAssets>[number]>,
): { symbol: string; slug: string; displayName: string; chainId: number } | null {
  const key = address.toLowerCase()
  const canonical = canonicalByAddress.get(key)
  if (canonical?.address && canonical.symbol) {
    return {
      symbol: canonical.symbol,
      slug: canonical.registrySlug ?? canonical.id,
      displayName: canonical.name ?? canonical.symbol,
      chainId: canonical.chainId,
    }
  }
  const listed = TOKEN_LIST_BY_ADDRESS.get(key)
  if (listed?.symbol) {
    return {
      symbol: listed.symbol,
      slug: listed.symbol.toLowerCase(),
      displayName: listed.name ?? listed.symbol,
      chainId: 56,
    }
  }
  // Indexed-universe fallback — short address label so ranking never drops unknown listed tokens.
  return {
    symbol: `${key.slice(0, 6)}…${key.slice(-4)}`,
    slug: key,
    displayName: `${key.slice(0, 6)}…${key.slice(-4)}`,
    chainId: 56,
  }
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
  const volumeUsd = quoteVolumeWbnb > 0 && bnbUsd != null && Number.isFinite(bnbUsd) ? quoteVolumeWbnb * bnbUsd : 0
  const marcoChange = computeIndexedMove(candles)
  const marcoUsdFromCandle =
    candles[candles.length - 1]?.close != null && bnbUsd ? candles[candles.length - 1].close * bnbUsd : undefined
  // Always surface featured-pair swap count from durable indexer candles/txs in activity window.
  const activityCutoff = Math.floor(Date.now() / 1000) - SECONDS_ACTIVITY
  const activityTradeCount =
    transactions?.filter((tx) => {
      const ts = Number(tx.timestamp)
      return tx.type === TransactionType.SWAP && Number.isFinite(ts) && ts >= activityCutoff
    }).length ?? 0
  const candleActivityTrades = candles
    .filter((c) => c.bucketTimestamp >= activityCutoff)
    .reduce((sum, c) => sum + (c.tradeCount ?? 0), 0)
  return {
    volumeUsd,
    tradeCount: Math.max(resolvedTradeCount, activityTradeCount, candleActivityTrades),
    marcoChange,
    marcoUsdFromCandle,
  }
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
  const { data: activeTrendBoosts = [] } = useSWR('active-trend-boosts', fetchActiveTrendBoosts, {
    revalidateOnFocus: true,
    refreshInterval: 30_000,
    dedupingInterval: 15_000,
  })
  const [placementNow, setPlacementNow] = useState(0)
  useEffect(() => {
    if (activeTrendBoosts.length === 0) return undefined
    const tick = () => {
      if (!document.hidden) setPlacementNow(Date.now())
    }
    tick()
    const id = window.setInterval(tick, 30_000)
    document.addEventListener('visibilitychange', tick)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [activeTrendBoosts.length])
  const { data: pairRows = [], isValidating: pairsLoading } = useSWR('dex-trending-pairs', fetchTradeablePairs, {
    revalidateOnFocus: false,
    dedupingInterval: 120_000,
  })
  const { data: tierMetrics = [], isValidating: tierLoading } = useSWR('dex-trending-tier-metrics', fetchTierMetrics, {
    revalidateOnFocus: false,
    dedupingInterval: 120_000,
  })
  const { data: bnbUsd } = useSWR('dex-trending-bnb-usd', fetchBnbUsdPrice, {
    revalidateOnFocus: false,
    dedupingInterval: 120_000,
  })
  const { data: protocolActivity = [], isValidating: activityLoading } = useSWR(
    'dex-trending-protocol-activity',
    fetchProtocolActivity,
    {
      revalidateOnFocus: false,
      refreshInterval: 60_000,
      dedupingInterval: 45_000,
    },
  )
  const { data: indexerSwaps = [], isValidating: swapsLoading } = useSWR(
    'dex-trending-indexer-swaps',
    fetchIndexerSwapEvents,
    {
      revalidateOnFocus: false,
      refreshInterval: 60_000,
      dedupingInterval: 45_000,
    },
  )

  /** Candidate contract addresses from pair index + canonical registry for external quotes. */
  const candidateAddresses = useMemo(() => {
    const set = new Set<string>()
    for (const pair of pairRows) {
      const base = pickTrendingBaseToken(pair.token0 ?? '', pair.token1 ?? '')
      if (base && !isQuoteTokenAddress(base)) set.add(base.toLowerCase())
    }
    for (const asset of getCanonicalIndexedAssets()) {
      if (asset.address) set.add(asset.address.toLowerCase())
    }
    // Always request well-known ecosystem tokens when address is known from token list.
    for (const [addr] of TOKEN_LIST_BY_ADDRESS) {
      const listed = TOKEN_LIST_BY_ADDRESS.get(addr)
      const sym = listed?.symbol?.toUpperCase()
      if (sym && ['CAKE', 'FLOKI', 'DOT', 'ASTER', 'EYED', 'MM72', 'AIOT', 'NAIVE', 'MARCO'].includes(sym)) {
        set.add(addr)
      }
    }
    set.add(MARCO_BSC_ADDRESS.toLowerCase())
    set.add(CAKE[56].address.toLowerCase())
    // Full indexed universe — never truncate candidate set (P0: ~266 listed tokens).
    return Array.from(set)
  }, [pairRows])

  const { data: externalQuotes = new Map<string, ExternalTokenQuote>() } = useSWR(
    candidateAddresses.length ? ['dex-trending-coingecko-quotes', candidateAddresses.join(',')] : null,
    () => fetchCoinGeckoTokenQuotes(candidateAddresses),
    {
      revalidateOnFocus: false,
      refreshInterval: 120_000,
      dedupingInterval: 90_000,
    },
  )

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

    for (const ev of protocolActivity) {
      if (ev.eventType && !/swap/i.test(ev.eventType)) continue
      const ts = Number(ev.timestamp) || 0
      if (!Number.isFinite(ts) || ts < activityCutoff) continue
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
        // All indexed Swap-active bases — no canonical whitelist gate.
        bumpActivity(
          swapActivity,
          addr,
          ts,
          volumeUsd / Math.max(1, addrs.filter((a) => a && !isQuoteTokenAddress(a)).length),
          ev.wallet,
        )
      }
    }

    for (const ev of indexerSwaps) {
      if (ev.eventType && !/swap/i.test(ev.eventType)) continue
      const ts = Number(ev.blockTimestamp) || 0
      if (!Number.isFinite(ts) || ts < activityCutoff) continue
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
      bumpActivity(swapActivity, ev.token0, ts, volumeUsd / 2, ev.wallet)
      bumpActivity(swapActivity, ev.token1, ts, volumeUsd / 2, ev.wallet)
    }

    for (const tx of transactions ?? []) {
      if (tx.type !== TransactionType.SWAP) continue
      const ts = Number(tx.timestamp)
      if (!Number.isFinite(ts) || ts < activityCutoff) continue
      const vol = Number.isFinite(tx.amountUSD) ? Math.max(0, tx.amountUSD) / 2 : 0
      bumpActivity(swapActivity, tx.token0Address, ts, vol, tx.sender)
      bumpActivity(swapActivity, tx.token1Address, ts, vol, tx.sender)
    }

    // Always credit MARCO when candle/indexer swap count exists (featured Melega pair).
    if (marcoMetrics.tradeCount > 0 || marcoMetrics.volumeUsd > 0) {
      const key = MARCO_BSC_ADDRESS.toLowerCase()
      const prev = swapActivity.get(key) ?? { trades: 0, volumeUsd: 0, lastTs: 0, traders: new Set<string>() }
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
        uniqueTraders: Math.max(existing.uniqueTraders ?? 0, asset.uniqueTraders ?? 0),
        lastActivityTs: Math.max(existing.lastActivityTs ?? 0, asset.lastActivityTs ?? 0) || undefined,
        change24h: existing.change24h ?? asset.change24h,
        priceUsd: existing.priceUsd ?? asset.priceUsd,
        liquidityScore: Math.max(existing.liquidityScore, asset.liquidityScore),
        rankingSignals: Array.from(new Set([...existing.rankingSignals, ...asset.rankingSignals])),
      })
    }

    // Priority 2: tier metrics when READY / EMPTY_VERIFIED / SYNCING (enrich %, not membership-only).
    for (const row of tierMetrics) {
      if (!isTrendingTierStatus(row.status)) continue

      const baseAddress = pickTrendingBaseToken(row.token0, row.token1)
      const meta = resolveDisplayMeta(baseAddress, canonicalByAddress)
      if (!meta) continue

      const addrKey = baseAddress.toLowerCase()
      const isMarcoPair = row.slug === 'marco-wbnb' || addrKey === MARCO_BSC_ADDRESS.toLowerCase()
      const fromSwaps = swapActivity.get(addrKey)

      let volume24h = row.volume24hQuote > 0 && effectiveBnbUsd ? row.volume24hQuote * effectiveBnbUsd : 0
      let tradeCount24h = row.tradeCount24h
      let change24h =
        row.priceChange24h != null && Number.isFinite(row.priceChange24h) && Math.abs(row.priceChange24h) > 0.0001
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
      if (!change24h) {
        change24h = computeChangeFromObservations(priceObservationsFromSwaps(indexerSwaps, baseAddress))
      }

      // Tier rows only enrich tokens that already have Swap/volume activity.
      if (!hasTrendingSwapActivity({ tradeCount24h, volume24h })) {
        continue
      }

      const priceUsd = resolveTokenPriceUsd(
        baseAddress,
        meta.symbol,
        marcoUsd,
        marcoMetrics.marcoUsdFromCandle,
        wbnbUsd,
        cakeUsd,
        busdUsd,
      )
      const liquidityScore = liquidityScoreForAddress(pairRows, baseAddress)
      const signals: string[] = []
      if (fromSwaps?.trades) signals.push('recentSwaps')
      if (volume24h > 0) signals.push('volume24h')
      if (tradeCount24h > 0) signals.push('trades24h')
      if (change24h) signals.push('change24h')

      upsert({
        symbol: meta.symbol,
        slug: meta.slug,
        pairSlug: row.slug,
        address: baseAddress,
        chainId: meta.chainId,
        displayName: meta.displayName,
        tierStatus: row.status as TierRankedAsset['tierStatus'],
        priceUsd: priceUsd && priceUsd > 0 ? priceUsd : undefined,
        change24h,
        volume24h,
        liquidityScore,
        tradeCount24h,
        uniqueTraders: fromSwaps?.traders.size ?? 0,
        lastActivityTs,
        rankingSignals: signals,
      })
    }

    // Promote every Swap-active token (tokenlist / canonical for symbols). No discovery fill.
    for (const [addr, act] of swapActivity) {
      if (byAddress.has(addr)) continue
      const meta = resolveDisplayMeta(addr, canonicalByAddress)
      if (!meta) continue
      if (!hasTrendingSwapActivity({ tradeCount24h: act.trades, volume24h: act.volumeUsd })) {
        continue
      }
      const isMarco = addr === MARCO_BSC_ADDRESS.toLowerCase()
      const fromSwaps = computeChangeFromObservations(priceObservationsFromSwaps(indexerSwaps, addr))
      upsert({
        symbol: meta.symbol,
        slug: meta.slug,
        pairSlug: isMarco ? 'marco-wbnb' : meta.slug,
        address: addr,
        chainId: meta.chainId,
        displayName: meta.displayName,
        tierStatus: 'READY',
        priceUsd: resolveTokenPriceUsd(
          addr,
          meta.symbol,
          marcoUsd,
          marcoMetrics.marcoUsdFromCandle,
          wbnbUsd,
          cakeUsd,
          busdUsd,
        ),
        change24h: isMarco ? marcoMetrics.marcoChange ?? fromSwaps : fromSwaps,
        volume24h: Math.max(act.volumeUsd, isMarco ? marcoMetrics.volumeUsd : 0),
        liquidityScore: liquidityScoreForAddress(pairRows, addr),
        tradeCount24h: Math.max(act.trades, isMarco ? marcoMetrics.tradeCount : 0),
        uniqueTraders: act.traders.size,
        lastActivityTs: act.lastTs,
        rankingSignals: ['recentSwaps'],
      })
    }

    // Priority 3: seed ALL tradeable pair bases from the internal pair index (liquidity-backed).
    for (const pair of pairRows) {
      if (pair.classification && pair.classification !== 'tradeable') continue
      if (pair.active === false) continue
      const baseAddress = pickTrendingBaseToken(pair.token0 ?? '', pair.token1 ?? '')
      if (!baseAddress || isQuoteTokenAddress(baseAddress)) continue
      const meta = resolveDisplayMeta(baseAddress, canonicalByAddress)
      if (!meta) continue
      const addrKey = baseAddress.toLowerCase()
      if (byAddress.has(addrKey)) {
        const existing = byAddress.get(addrKey)!
        byAddress.set(addrKey, {
          ...existing,
          liquidityScore: Math.max(existing.liquidityScore, liquidityScoreForAddress(pairRows, baseAddress)),
          rankingSignals: Array.from(new Set([...existing.rankingSignals, 'pairIndex'])),
        })
        continue
      }
      upsert({
        symbol: meta.symbol,
        slug: meta.slug,
        pairSlug: meta.slug,
        address: baseAddress,
        chainId: meta.chainId,
        displayName: meta.displayName,
        tierStatus: 'READY',
        priceUsd: resolveTokenPriceUsd(
          baseAddress,
          meta.symbol,
          marcoUsd,
          marcoMetrics.marcoUsdFromCandle,
          wbnbUsd,
          cakeUsd,
          busdUsd,
        ),
        volume24h: 0,
        liquidityScore: liquidityScoreForAddress(pairRows, baseAddress),
        tradeCount24h: 0,
        rankingSignals: ['pairIndex'],
      })
    }

    // Priority 4: CoinGecko / external tracked quotes — factual % and volume when indexed.
    for (const [addr, quote] of externalQuotes) {
      if (isQuoteTokenAddress(addr)) continue
      const meta = resolveDisplayMeta(addr, canonicalByAddress)
      if (!meta) continue
      const existing = byAddress.get(addr)
      const cgChange = format24hChangePct(quote.change24hPct)
      const volume24h = quote.volume24hUsd ?? 0
      if (existing) {
        const internalAbs = Math.abs(existing.change24h?.pct ?? 0)
        // Prefer Melega-indexed % when meaningful; otherwise use factual external %.
        const preferExternal = !existing.change24h || internalAbs < 0.05
        byAddress.set(addr, {
          ...existing,
          priceUsd: existing.priceUsd ?? quote.priceUsd,
          change24h: preferExternal ? cgChange : existing.change24h,
          volume24h: Math.max(existing.volume24h, volume24h),
          rankingSignals: Array.from(
            new Set([...existing.rankingSignals, 'coingecko', ...(preferExternal ? ['externalTrackedPrice'] : [])]),
          ),
        })
        continue
      }
      upsert({
        symbol: meta.symbol,
        slug: meta.slug,
        pairSlug: meta.slug,
        address: addr,
        chainId: meta.chainId,
        displayName: meta.displayName,
        tierStatus: 'READY',
        priceUsd: quote.priceUsd,
        change24h: cgChange,
        volume24h,
        liquidityScore: liquidityScoreForAddress(pairRows, addr),
        tradeCount24h: 0,
        rankingSignals: ['coingecko', 'externalTrackedPrice'],
      })
    }

    // Enrich missing % from swap execution observations + drop idle shells with no signal.
    for (const [key, asset] of byAddress) {
      const external = externalQuotes.get(key)
      if (asset.liquidityScore <= 0 && asset.tradeCount24h < 1 && asset.volume24h <= 0 && !external) {
        byAddress.delete(key)
        continue
      }
      if (asset.change24h) continue
      const fromSwaps = computeChangeFromObservations(priceObservationsFromSwaps(indexerSwaps, asset.address))
      if (fromSwaps) {
        byAddress.set(key, {
          ...asset,
          change24h: fromSwaps,
          rankingSignals: Array.from(new Set([...asset.rankingSignals, 'swapObservations'])),
        })
        continue
      }
      if (external) {
        byAddress.set(key, {
          ...asset,
          change24h: format24hChangePct(external.change24hPct),
          priceUsd: asset.priceUsd ?? external.priceUsd,
          volume24h: Math.max(asset.volume24h, external.volume24hUsd ?? 0),
          rankingSignals: Array.from(new Set([...asset.rankingSignals, 'coingecko', 'historicalObservation'])),
        })
      }
    }

    // P0: seed complete indexed universe so ranking is never sparse-by-membership.
    for (const asset of canonicalByAddress.values()) {
      const addr = asset.address?.toLowerCase()
      if (!addr || isQuoteTokenAddress(addr)) continue
      if (byAddress.has(addr)) continue
      const meta = resolveDisplayMeta(addr, canonicalByAddress)
      if (!meta) continue
      upsert({
        symbol: meta.symbol,
        slug: meta.slug,
        pairSlug: meta.slug,
        address: addr,
        chainId: meta.chainId,
        displayName: meta.displayName,
        tierStatus: 'READY',
        priceUsd: resolveTokenPriceUsd(
          addr,
          meta.symbol,
          marcoUsd,
          marcoMetrics.marcoUsdFromCandle,
          wbnbUsd,
          cakeUsd,
          busdUsd,
        ),
        volume24h: 0,
        liquidityScore: liquidityScoreForAddress(pairRows, addr),
        tradeCount24h: 0,
        rankingSignals: ['indexedUniverse'],
      })
    }

    // Shared Top Movers + Trending Bar — only tokens with factual measured % change.
    // Never fabricate history. Never pad empty slots with registry tokens lacking a valid percentage.
    const withCredibleMove = [...byAddress.values()]
      .filter((c) => {
        const pct = c.change24h?.pct
        if (pct == null || !Number.isFinite(pct)) return false
        const external = externalQuotes.get(c.address.toLowerCase())
        return isCredibleMoverChange({
          pct,
          tradeCount24h: c.tradeCount24h,
          volume24h: c.volume24h,
          liquidityScore: c.liquidityScore,
          externalVolumeUsd: external?.volume24hUsd,
          hasExternalChange: Boolean(external) || c.rankingSignals.includes('coingecko'),
        })
      })
      .sort((a, b) => {
        const da = Math.abs(a.change24h?.pct ?? 0)
        const db = Math.abs(b.change24h?.pct ?? 0)
        if (db !== da) return db - da
        if (b.tradeCount24h !== a.tradeCount24h) return b.tradeCount24h - a.tradeCount24h
        if (b.volume24h !== a.volume24h) return b.volume24h - a.volume24h
        return (b.lastActivityTs ?? 0) - (a.lastActivityTs ?? 0)
      })

    return withCredibleMove.slice(0, TRENDING_LIMIT)
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
    externalQuotes,
  ])

  const liveTickerItems = useMemo((): MelegaTickerItem[] => {
    return rankedAssets.map((asset) => {
      const { accent, accentPositive } = trendingTickerAccent(asset)
      const priceLabel =
        asset.priceUsd != null && Number.isFinite(asset.priceUsd) && asset.priceUsd > 0
          ? formatTickerPriceUsd(asset.priceUsd)
          : undefined
      return {
        id: `trade-asset-${asset.slug}`,
        primary: asset.symbol,
        secondary: priceLabel || undefined,
        accent,
        accentPositive,
        href: asset.address ? `/swap?outputCurrency=${asset.address}` : `/@${asset.slug}`,
      }
    })
  }, [rankedAssets])

  const [durableItems, setDurableItems] = useState<MelegaTickerItem[]>([])
  const [durableUpdatedAt, setDurableUpdatedAt] = useState<number | undefined>(undefined)
  const [partialRejectCount, setPartialRejectCount] = useState(0)

  useEffect(() => {
    const snap = readDurableTrendingSnapshot()
    if (snap?.items?.length) {
      setDurableItems(snap.items)
      setDurableUpdatedAt(snap.updatedAt)
    }
  }, [])

  useEffect(() => {
    if (liveTickerItems.length === 0) return
    const decision = resolveTrendingItemsForDisplay(liveTickerItems, durableItems, durableUpdatedAt)
    if (decision.rejectedPartial) {
      setPartialRejectCount((n) => n + 1)
      return
    }
    if (!decision.fromDurable) {
      writeDurableTrendingSnapshot(liveTickerItems)
      setDurableItems(liveTickerItems)
      setDurableUpdatedAt(Date.now())
    }
  }, [liveTickerItems, durableItems, durableUpdatedAt])

  const resolvedTicker = useMemo(
    () => resolveTrendingItemsForDisplay(liveTickerItems, durableItems, durableUpdatedAt),
    [liveTickerItems, durableItems, durableUpdatedAt],
  )
  // Paid Boosted/Featured slots are injected only when active placements exist.
  // Empty arrays → organic movers only (never registry padding).
  const trendingTickerItems = useMemo(
    () =>
      mergeTickerWithPaidPlacements({
        organic: resolvedTicker.items,
        boosted: activeTrendBoosts,
        featured: [],
        nowMs: placementNow || Date.now(),
      }),
    [resolvedTicker.items, activeTrendBoosts, placementNow],
  )

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
    if (resolvedTicker.fromDurable) return 'Last-known movers · refreshing…'
    if (rankedAssets.length === 0) return undefined
    return 'Indexed DEX activity · swap count · volume · recent trades'
  }, [rankedAssets.length, resolvedTicker.fromDurable])

  // Do not block the ticker shell for minutes on cold indexer/CoinGecko — show durable last-good.
  const bootstrapping =
    liveTickerItems.length === 0 &&
    durableItems.length === 0 &&
    ((pairsLoading && pairRows.length === 0) ||
      (swapsLoading && indexerSwaps.length === 0 && protocolActivity.length === 0))

  return {
    items: trendingTickerItems,
    indexedRibbonAssets,
    trendingEmpty,
    isLoading: bootstrapping,
    fromDurableSnapshot: resolvedTicker.fromDurable,
    rejectedPartialSnapshot: resolvedTicker.rejectedPartial,
    partialRejectCount,
    indexerScopeNote,
    rankedCount: rankedAssets.length,
    rankedAssets,
    useMarquee: trendingTickerItems.length >= MIN_MARQUEE_ITEMS,
    indexerState,
  }
}

export default useDexTrendingRankings
