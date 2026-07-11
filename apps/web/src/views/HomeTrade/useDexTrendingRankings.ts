import { useMemo } from 'react'
import useSWR from 'swr'
import { WBNB } from '@pancakeswap/sdk'
import { CAKE, BUSD } from '@pancakeswap/tokens'
import type { MelegaTickerItem } from 'design-system/melega'
import { MARCO_BSC_ADDRESS } from 'design-system/melega/constants/brand'
import { getTradeSurfaceAssets } from 'lib/dex-asset-index'
import { useIndexerCandles } from 'lib/bsc-indexer/client/useIndexerCandles'
import { MARCO_WBNB_PAIR_BSC } from 'lib/bsc-indexer/constants'
import type { OhlcvCandle } from 'lib/bsc-indexer/types'
import { useProtocolTransactionsIndexer } from 'lib/runtime-indexing'
import { TransactionType } from 'state/info/types'
import useBUSDPrice from 'hooks/useBUSDPrice'
import { usePriceCakeBusd } from 'state/farms/hooks'

const SECONDS_24H = 86_400
const TRENDING_LIMIT = 10

type PairRow = {
  token0?: string
  token1?: string
  reserve0?: string
  reserve1?: string
  classification?: string
}

type RankedAsset = {
  symbol: string
  slug: string
  address?: string
  chainId: number
  displayName: string
  priceUsd?: number
  change24h?: { text: string; positive: boolean }
  volume24h: number
  liquidityScore: number
  tradeCount24h: number
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

async function fetchTierMetrics(): Promise<
  Array<{
    token0: string
    token1: string
    volume24hQuote: number
    tradeCount24h: number
    priceChange24h?: number
    status: string
  }>
> {
  try {
    const res = await fetch('/api/indexer/tier-metrics')
    if (!res.ok) return []
    const json = (await res.json()) as { rows?: Array<{ token0: string; token1: string; volume24hQuote: number; tradeCount24h: number; priceChange24h?: number; status: string }> }
    return (json.rows ?? []).filter((r) => r.status === 'READY')
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

const formatTickerPrice = (price?: number): string | undefined => {
  if (!price || price <= 0 || !Number.isFinite(price)) return undefined
  if (price >= 1) return `$${price.toFixed(2)}`
  if (price >= 0.01) return `$${price.toFixed(4)}`
  return `$${price.toFixed(6)}`
}

function computeChange24hFromCandles(candles: OhlcvCandle[]): { text: string; positive: boolean } | undefined {
  if (candles.length < 2) return undefined
  const cutoff = Math.floor(Date.now() / 1000) - SECONDS_24H
  const recent = candles.filter((c) => c.bucketTimestamp >= cutoff)
  const window = recent.length >= 2 ? recent : candles
  const open = window[0]?.open
  const close = window[window.length - 1]?.close
  if (open == null || close == null || !Number.isFinite(open) || !Number.isFinite(close) || open <= 0) {
    return undefined
  }
  const pct = ((close - open) / open) * 100
  const positive = pct >= 0
  return { text: `${positive ? '▲' : '▼'} ${Math.abs(pct).toFixed(2)}%`, positive }
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

  const indexerMetrics24h = useMemo(() => {
    const cutoff = Math.floor(Date.now() / 1000) - SECONDS_24H
    const recentCandles = candles.filter((c) => c.bucketTimestamp >= cutoff)
    const window = recentCandles.length > 0 ? recentCandles : candles
    const quoteVolumeWbnb = window.reduce((sum, c) => sum + (c.quoteVolume ?? 0), 0)
    const tradeCount = window.reduce((sum, c) => sum + (c.tradeCount ?? 0), 0)
    const txCount24h =
      transactions?.filter((tx) => {
        const ts = Number(tx.timestamp)
        return tx.type === TransactionType.SWAP && Number.isFinite(ts) && ts >= cutoff
      }).length ?? 0
    const resolvedTradeCount = tradeCount > 0 ? tradeCount : txCount24h
    const volumeUsd =
      quoteVolumeWbnb > 0 && bnbUsd != null && Number.isFinite(bnbUsd) ? quoteVolumeWbnb * bnbUsd : 0
    const marcoChange = computeChange24hFromCandles(candles)
    const marcoUsdFromCandle =
      candles[candles.length - 1]?.close != null && bnbUsd
        ? candles[candles.length - 1].close * bnbUsd
        : undefined
    return {
      volumeUsd,
      tradeCount: resolvedTradeCount,
      marcoChange,
      marcoUsdFromCandle,
      hasIndexerData: candleStatus === 'ready' && candles.length > 0,
    }
  }, [candles, transactions, bnbUsd, candleStatus])

  const rankedAssets = useMemo((): RankedAsset[] => {
    const tradeAssets = getTradeSurfaceAssets()
    const marcoUsd = marcoPrice?.toNumber()
    const wbnbUsd = wbnbPrice ? Number(wbnbPrice.toSignificant(6)) : undefined
    const cakeUsd = cakePrice ? Number(cakePrice.toSignificant(6)) : undefined
    const busdUsd = busdPrice ? Number(busdPrice.toSignificant(6)) : undefined
    const bySymbol = new Map<string, RankedAsset>()

    tradeAssets.forEach((asset) => {
      const sym = asset.symbol.toUpperCase()
      if (bySymbol.has(sym)) return
      let priceUsd: number | undefined
      let change24h: RankedAsset['change24h']
      let volume24h = 0
      let tradeCount24h = 0
      const liquidityScore = liquidityScoreForAddress(pairRows, asset.address)

      if (sym === 'MARCO') {
        priceUsd = marcoUsd && marcoUsd > 0 ? marcoUsd : indexerMetrics24h.marcoUsdFromCandle
        change24h = indexerMetrics24h.marcoChange
        volume24h = indexerMetrics24h.volumeUsd
        tradeCount24h = indexerMetrics24h.tradeCount
      } else if (sym === 'WBNB') {
        priceUsd = wbnbUsd
      } else if (sym === 'CAKE') {
        priceUsd = cakeUsd
      } else if (sym === 'BUSD') {
        priceUsd = busdUsd && busdUsd > 0 ? busdUsd : undefined
      } else if (asset.address?.toLowerCase() === MARCO_BSC_ADDRESS.toLowerCase()) {
        priceUsd = marcoUsd
        change24h = indexerMetrics24h.marcoChange
        volume24h = indexerMetrics24h.volumeUsd
        tradeCount24h = indexerMetrics24h.tradeCount
      }

      const addrKey = asset.address?.toLowerCase()
      tierMetrics.forEach((row) => {
        if (row.token0 !== addrKey && row.token1 !== addrKey) return
        const volUsd = row.volume24hQuote > 0 && bnbUsd ? row.volume24hQuote * bnbUsd : 0
        if (volUsd > volume24h) volume24h = volUsd
        if (row.tradeCount24h > tradeCount24h) tradeCount24h = row.tradeCount24h
        if (row.priceChange24h != null && !change24h && sym !== 'MARCO') {
          const positive = row.priceChange24h >= 0
          change24h = { text: `${positive ? '▲' : '▼'} ${Math.abs(row.priceChange24h).toFixed(2)}%`, positive }
        }
      })

      if (!priceUsd || priceUsd <= 0) return
      if (!asset.logo && !asset.logoFallback) return

      const hasMarketSignal = volume24h > 0 || tradeCount24h > 0 || Boolean(change24h)
      if (!hasMarketSignal) return

      bySymbol.set(sym, {
        symbol: asset.symbol,
        slug: asset.registrySlug ?? asset.id,
        address: asset.address,
        chainId: asset.chainId,
        displayName: asset.name ?? asset.symbol,
        priceUsd,
        change24h,
        volume24h,
        liquidityScore,
        tradeCount24h,
      })
    })

    return [...bySymbol.values()]
      .sort((a, b) => {
        if (b.volume24h !== a.volume24h) return b.volume24h - a.volume24h
        if (b.tradeCount24h !== a.tradeCount24h) return b.tradeCount24h - a.tradeCount24h
        if (b.liquidityScore !== a.liquidityScore) return b.liquidityScore - a.liquidityScore
        const aCh = Math.abs(parseFloat(a.change24h?.text.replace(/[^0-9.-]/g, '') ?? '0'))
        const bCh = Math.abs(parseFloat(b.change24h?.text.replace(/[^0-9.-]/g, '') ?? '0'))
        return bCh - aCh
      })
      .slice(0, TRENDING_LIMIT)
  }, [pairRows, marcoPrice, wbnbPrice, cakePrice, busdPrice, indexerMetrics24h, tierMetrics, bnbUsd])

  const trendingTickerItems = useMemo((): MelegaTickerItem[] => {
    return rankedAssets.map((asset) => {
      const change = asset.change24h
      const volumeLabel =
        asset.volume24h > 0
          ? asset.volume24h >= 1_000_000
            ? `$${(asset.volume24h / 1_000_000).toFixed(2)}M vol`
            : asset.volume24h >= 1_000
              ? `$${(asset.volume24h / 1_000).toFixed(1)}K vol`
              : `$${asset.volume24h.toFixed(0)} vol`
          : undefined
      const liquidityLabel = asset.liquidityScore > 0 ? 'Liquid' : undefined
      const accent = change?.text ?? volumeLabel ?? liquidityLabel
      return {
        id: `trade-asset-${asset.slug}`,
        primary: asset.symbol,
        secondary: formatTickerPrice(asset.priceUsd),
        accent,
        accentPositive: change ? change.positive : undefined,
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

  const trendingUnavailableReason = useMemo(() => {
    if (trendingTickerItems.length > 0) return undefined
    if (candleStatus === 'loading') return 'Loading indexed market quotes'
    return 'No tradeable assets with price and indexed volume, change, or liquidity'
  }, [trendingTickerItems.length, candleStatus])

  const indexerScopeNote = useMemo(() => {
    if (!indexerMetrics24h.hasIndexerData) return undefined
    return '24H volume and change ranked from Tier-1/Tier-2 durable indexer pairs'
  }, [indexerMetrics24h.hasIndexerData])

  return {
    items: trendingTickerItems,
    indexedRibbonAssets,
    unavailableReason: trendingUnavailableReason,
    indexerScopeNote,
    rankedCount: rankedAssets.length,
    indexerState,
  }
}

export default useDexTrendingRankings
