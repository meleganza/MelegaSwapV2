import { useMemo } from 'react'
import useSWR from 'swr'
import { WBNB } from '@pancakeswap/sdk'
import { CAKE, BUSD } from '@pancakeswap/tokens'
import type { MelegaTickerItem } from 'design-system/melega'
import { MARCO_BSC_ADDRESS } from 'design-system/melega/constants/brand'
import { getCanonicalIndexedAssets } from 'lib/canonical-token-registry'
import { computeValid24hPriceChange, format24hChangePct } from 'lib/data-truth/compute24hPriceChange'
import { useIndexerCandles } from 'lib/bsc-indexer/client/useIndexerCandles'
import { MARCO_WBNB_PAIR_BSC } from 'lib/bsc-indexer/constants'
import type { OhlcvCandle } from 'lib/bsc-indexer/types'
import { useProtocolTransactionsIndexer } from 'lib/runtime-indexing'
import { TransactionType } from 'state/info/types'
import useBUSDPrice from 'hooks/useBUSDPrice'
import { usePriceCakeBusd } from 'state/farms/hooks'
import {
  formatTrendingTickerPrice,
  hasTrendingMarketSignal,
  isTrendingTierStatus,
  pickTrendingBaseToken,
  rankTierAssets,
  trendingTickerAccent,
  type TierMetricRow,
  type TierRankedAsset,
} from 'lib/trending/tierTrendingModel'

const SECONDS_24H = 86_400
const TRENDING_LIMIT = 10
const MIN_MARQUEE_ITEMS = 6

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
    const candidates: TierRankedAsset[] = []

    for (const row of tierMetrics) {
      if (!isTrendingTierStatus(row.status)) continue

      const baseAddress = pickTrendingBaseToken(row.token0, row.token1)
      const canonical = canonicalByAddress.get(baseAddress.toLowerCase())
      if (!canonical?.address) continue

      const sym = canonical.symbol
      const addrKey = canonical.address.toLowerCase()
      const isMarcoPair = row.slug === 'marco-wbnb' || addrKey === MARCO_BSC_ADDRESS.toLowerCase()

      let volume24h =
        row.volume24hQuote > 0 && effectiveBnbUsd ? row.volume24hQuote * effectiveBnbUsd : 0
      let tradeCount24h = row.tradeCount24h
      let change24h =
        row.priceChange24h != null &&
        Number.isFinite(row.priceChange24h) &&
        Math.abs(row.priceChange24h) > 0.0001
          ? format24hChangePct(row.priceChange24h)
          : undefined

      if (isMarcoPair) {
        volume24h = Math.max(volume24h, marcoMetrics.volumeUsd)
        tradeCount24h = Math.max(tradeCount24h, marcoMetrics.tradeCount)
        change24h = marcoMetrics.marcoChange ?? change24h
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
      if (volume24h > 0) signals.push('volume24h')
      if (tradeCount24h > 0) signals.push('trades24h')
      if (change24h) signals.push('change24h')
      if (liquidityScore > 0) signals.push('liquidity')

      if (!priceUsd || priceUsd <= 0) continue
      if (
        !hasTrendingMarketSignal({
          tradeCount24h,
          volume24h,
          liquidityScore,
          change24h,
        })
      ) {
        continue
      }

      candidates.push({
        symbol: sym,
        slug: canonical.registrySlug ?? canonical.id,
        pairSlug: row.slug,
        address: canonical.address,
        chainId: canonical.chainId,
        displayName: canonical.name ?? sym,
        tierStatus: row.status,
        priceUsd,
        change24h,
        volume24h,
        liquidityScore,
        tradeCount24h,
        rankingSignals: signals,
      })
    }

    return rankTierAssets(candidates, TRENDING_LIMIT)
  }, [
    tierMetrics,
    pairRows,
    marcoPrice,
    wbnbPrice,
    cakePrice,
    busdPrice,
    marcoMetrics,
    effectiveBnbUsd,
  ])

  const trendingTickerItems = useMemo((): MelegaTickerItem[] => {
    return rankedAssets.map((asset) => {
      const { accent, accentPositive } = trendingTickerAccent(asset)
      const priceLabel = formatTrendingTickerPrice(asset.priceUsd)
      return {
        id: `trade-asset-${asset.slug}`,
        primary: asset.symbol,
        secondary: priceLabel || '—',
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
    return 'Tier metrics · 24H volume → trades → liquidity → price change'
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
