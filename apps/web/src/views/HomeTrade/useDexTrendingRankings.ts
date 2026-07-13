import { useMemo } from 'react'
import useSWR from 'swr'
import { WBNB } from '@pancakeswap/sdk'
import { CAKE, BUSD } from '@pancakeswap/tokens'
import type { MelegaTickerItem } from 'design-system/melega'
import { MARCO_BSC_ADDRESS } from 'design-system/melega/constants/brand'
import { getCanonicalIndexedAssets } from 'lib/dex-asset-index'
import { computeValid24hPriceChange, format24hChangePct } from 'lib/data-truth/compute24hPriceChange'
import { useIndexerCandles } from 'lib/bsc-indexer/client/useIndexerCandles'
import { MARCO_WBNB_PAIR_BSC } from 'lib/bsc-indexer/constants'
import type { OhlcvCandle } from 'lib/bsc-indexer/types'
import { useProtocolTransactionsIndexer } from 'lib/runtime-indexing'
import { TransactionType } from 'state/info/types'
import useBUSDPrice from 'hooks/useBUSDPrice'
import { usePriceCakeBusd } from 'state/farms/hooks'

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

type RankedAsset = {
  symbol: string
  slug: string
  address: string
  chainId: number
  displayName: string
  priceUsd?: number
  change24h?: { text: string; positive: boolean }
  volume24h: number
  liquidityScore: number
  tradeCount24h: number
  rankingSignals: string[]
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
    const json = (await res.json()) as {
      rows?: Array<{
        token0: string
        token1: string
        volume24hQuote: number
        tradeCount24h: number
        priceChange24h?: number
        status: string
      }>
    }
    return (json.rows ?? []).filter(
      (r) => r.tradeCount24h > 0 || r.volume24hQuote > 0 || r.status === 'READY',
    )
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

function tokenSymbolFromAddress(address: string): string {
  const key = address.toLowerCase()
  const known: Record<string, string> = {
    '0x963556de0eb8138e97a85f0a86ee0acd159d210b': 'MARCO',
    '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c': 'WBNB',
    '0x55d398326f99059ff775485246999027b3197955': 'USDT',
    '0xe9e7cea3dedca5984780bafc599bd69add087d56': 'BUSD',
    '0x0e09fabb73bd3ade98a3cab8c5aa94c2e0f70d5': 'CAKE',
  }
  return known[key] ?? `${address.slice(0, 6)}…${address.slice(-4)}`
}

function assetDedupKey(chainId: number, address?: string): string | undefined {
  if (!address || chainId !== 56) return undefined
  return `${chainId}:${address.toLowerCase()}`
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

  const rankedAssets = useMemo((): RankedAsset[] => {
    const assets = getCanonicalIndexedAssets()
    const marcoUsd = marcoPrice?.toNumber()
    const wbnbUsd = wbnbPrice ? Number(wbnbPrice.toSignificant(6)) : undefined
    const cakeUsd = cakePrice ? Number(cakePrice.toSignificant(6)) : undefined
    const busdUsd = busdPrice ? Number(busdPrice.toSignificant(6)) : undefined
    const byAddress = new Map<string, RankedAsset>()

    assets.forEach((asset) => {
      const dedupKey = assetDedupKey(asset.chainId, asset.address)
      if (!dedupKey || byAddress.has(dedupKey)) return

      const sym = asset.symbol.toUpperCase()
      const addrKey = asset.address!.toLowerCase()
      let priceUsd: number | undefined
      let change24h: RankedAsset['change24h']
      let volume24h = 0
      let tradeCount24h = 0
      const signals: string[] = []
      const liquidityScore = liquidityScoreForAddress(pairRows, asset.address)

      if (sym === 'MARCO' || addrKey === MARCO_BSC_ADDRESS.toLowerCase()) {
        priceUsd = marcoUsd && marcoUsd > 0 ? marcoUsd : marcoMetrics.marcoUsdFromCandle
        change24h = marcoMetrics.marcoChange
        volume24h = marcoMetrics.volumeUsd
        tradeCount24h = marcoMetrics.tradeCount
        if (volume24h > 0) signals.push('volume24h')
        if (tradeCount24h > 0) signals.push('trades24h')
        if (change24h) signals.push('change24h')
      } else if (sym === 'WBNB') {
        priceUsd = wbnbUsd
      } else if (sym === 'CAKE') {
        priceUsd = cakeUsd
      } else if (sym === 'BUSD') {
        priceUsd = busdUsd && busdUsd > 0 ? busdUsd : undefined
      }

      tierMetrics.forEach((row) => {
        if (row.token0 !== addrKey && row.token1 !== addrKey) return
        const volUsd = row.volume24hQuote > 0 && effectiveBnbUsd ? row.volume24hQuote * effectiveBnbUsd : 0
        if (volUsd > volume24h) {
          volume24h = volUsd
          signals.push('tier-volume24h')
        }
        if (row.tradeCount24h > tradeCount24h) {
          tradeCount24h = row.tradeCount24h
          signals.push('tier-trades24h')
        }
        if (
          row.priceChange24h != null &&
          Number.isFinite(row.priceChange24h) &&
          !change24h &&
          sym !== 'MARCO' &&
          addrKey !== MARCO_BSC_ADDRESS.toLowerCase()
        ) {
          change24h = format24hChangePct(row.priceChange24h)
          signals.push('tier-change24h')
        }
      })

      if (liquidityScore > 0) signals.push('liquidity')

      const hasActivity = tradeCount24h > 0 || volume24h > 0
      const hasLiquidity = liquidityScore > 0
      const hasChange = Boolean(change24h)
      const isReferenceQuote = sym === 'WBNB' || sym === 'CAKE' || sym === 'BUSD'

      if (!priceUsd || priceUsd <= 0) return
      if (!asset.symbol?.trim()) return
      if (!hasActivity && !hasLiquidity && !hasChange && !isReferenceQuote) return

      byAddress.set(dedupKey, {
        symbol: asset.symbol,
        slug: asset.registrySlug ?? asset.id,
        address: asset.address!,
        chainId: asset.chainId,
        displayName: asset.name ?? asset.symbol,
        priceUsd,
        change24h,
        volume24h,
        liquidityScore,
        tradeCount24h,
        rankingSignals: [...new Set(signals)],
      })
    })

    pairRows.forEach((pair) => {
      const tokens = [
        { address: pair.token0, reserve: pair.reserve0 },
        { address: pair.token1, reserve: pair.reserve1 },
      ]
      tokens.forEach(({ address, reserve }) => {
        if (!address) return
        const dedupKey = assetDedupKey(56, address)
        if (!dedupKey || byAddress.has(dedupKey)) return
        const sym = tokenSymbolFromAddress(address)
        if (!sym || sym.includes('…')) return
        const liquidityScore = Number(reserve ?? 0)
        if (liquidityScore <= 0) return
        let priceUsd: number | undefined
        if (sym === 'WBNB') priceUsd = wbnbUsd
        else if (sym === 'CAKE') priceUsd = cakeUsd
        else if (sym === 'BUSD') priceUsd = busdUsd
        else if (sym === 'MARCO') priceUsd = marcoUsd && marcoUsd > 0 ? marcoUsd : marcoMetrics.marcoUsdFromCandle
        if (!priceUsd || priceUsd <= 0) return
        byAddress.set(dedupKey, {
          symbol: sym,
          slug: sym.toLowerCase(),
          address,
          chainId: 56,
          displayName: sym,
          priceUsd,
          volume24h: 0,
          liquidityScore,
          tradeCount24h: 0,
          rankingSignals: ['pair-liquidity'],
        })
      })
    })

    const bySymbol = new Map<string, RankedAsset>()
    byAddress.forEach((asset) => {
      const symbolKey = asset.symbol.toUpperCase()
      const existing = bySymbol.get(symbolKey)
      if (!existing || asset.volume24h > existing.volume24h) {
        bySymbol.set(symbolKey, asset)
      } else if (
        asset.volume24h === existing.volume24h &&
        asset.tradeCount24h > existing.tradeCount24h
      ) {
        bySymbol.set(symbolKey, asset)
      }
    })

    if (bySymbol.size === 0 && marcoMetrics.tradeCount > 0) {
      const marcoUsd =
        marcoPrice?.toNumber() && marcoPrice.toNumber() > 0
          ? marcoPrice.toNumber()
          : marcoMetrics.marcoUsdFromCandle
      if (marcoUsd && marcoUsd > 0) {
        const marcoAsset = assets.find(
          (a) => a.symbol.toUpperCase() === 'MARCO' || a.address?.toLowerCase() === MARCO_BSC_ADDRESS.toLowerCase(),
        )
        if (marcoAsset?.address) {
          bySymbol.set('MARCO', {
            symbol: marcoAsset.symbol,
            slug: marcoAsset.registrySlug ?? marcoAsset.id,
            address: marcoAsset.address,
            chainId: marcoAsset.chainId,
            displayName: marcoAsset.name ?? marcoAsset.symbol,
            priceUsd: marcoUsd,
            change24h: marcoMetrics.marcoChange,
            volume24h: marcoMetrics.volumeUsd,
            tradeCount24h: marcoMetrics.tradeCount,
            liquidityScore: liquidityScoreForAddress(pairRows, marcoAsset.address),
            rankingSignals: ['runtime-swap-24h'],
          })
        }
      }
    }

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
  }, [pairRows, marcoPrice, wbnbPrice, cakePrice, busdPrice, marcoMetrics, tierMetrics, effectiveBnbUsd])

  const trendingTickerItems = useMemo((): MelegaTickerItem[] => {
    return rankedAssets.map((asset) => {
      const change = asset.change24h
      const activityAccent =
        asset.tradeCount24h > 0
          ? `${asset.tradeCount24h} trade${asset.tradeCount24h === 1 ? '' : 's'}`
          : asset.volume24h > 0
            ? '24H vol'
            : undefined
      return {
        id: `trade-asset-${asset.slug}`,
        primary: asset.symbol,
        secondary: formatTickerPrice(asset.priceUsd),
        accent: change?.text ?? activityAccent,
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

  const trendingEmpty = useMemo(() => trendingTickerItems.length === 0, [trendingTickerItems.length])

  const indexerScopeNote = useMemo(() => {
    if (rankedAssets.length === 0) return undefined
    return 'Ranked by 24H volume → trades → liquidity → price change'
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
