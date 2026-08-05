import { useMemo } from 'react'
import type { FeaturedMarketRow } from 'lib/bsc-indexer/featuredMarkets'
import { useHolderCount } from 'lib/holder-count'
import {
  formatFeaturedChange,
  formatFeaturedLiquidity,
  formatFeaturedMarketCap,
  formatFeaturedPrice,
  formatFeaturedVolume,
  formatHumanDecimal,
  useFeaturedProjectMarkets,
} from 'views/HomeTrade/useFeaturedProjectMarkets'

export type ProjectLiveMarketView = {
  loading: boolean
  row: FeaturedMarketRow | null
  priceBnb: string
  priceUsd: string
  marketCap: string
  fdv: string
  liquidity: string
  volume24h: string
  swaps24h: string
  holders: string
  markets: string
  trend: string
  trendPositive?: boolean
  ath: string
  atl: string
  lastUpdate: string | null
  source: string
  status: string
  pairAddress?: string
}

function relativeFromUnix(ts?: number): string | null {
  if (!ts || !Number.isFinite(ts)) return null
  const ms = ts > 1e12 ? ts : ts * 1000
  const delta = Math.round((Date.now() - ms) / 1000)
  if (delta < 60) return 'just now'
  if (delta < 3600) return `${Math.floor(delta / 60)}m ago`
  if (delta < 86400) return `${Math.floor(delta / 3600)}h ago`
  return `${Math.floor(delta / 86400)}d ago`
}

function emptyMarket(loading: boolean, registeredMarketCount: number): ProjectLiveMarketView {
  return {
    loading,
    row: null,
    priceBnb: 'Unavailable',
    priceUsd: 'Unavailable',
    marketCap: 'Unavailable',
    fdv: 'Unavailable',
    liquidity: 'Unavailable',
    volume24h: 'Unavailable',
    swaps24h: 'Unavailable',
    holders: 'Unavailable',
    markets: registeredMarketCount > 0 ? String(registeredMarketCount) : 'Unavailable',
    trend: 'Unavailable',
    ath: 'Unavailable',
    atl: 'Unavailable',
    lastUpdate: null,
    source: 'none',
    status: 'UNAVAILABLE',
  }
}

/**
 * Factual market observations only — Featured indexer rows when present.
 * Never invents USD, holders, ATH/ATL, or FDV.
 */
export function useProjectLiveMarket(
  slug: string,
  registeredMarketCount: number,
  tokenAddress?: string | null,
  chainId = 56,
): ProjectLiveMarketView {
  const { rowsBySlug, loading } = useFeaturedProjectMarkets()
  const row = useMemo(() => {
    return rowsBySlug[slug] ?? (slug === 'marco' ? rowsBySlug['marco-wbnb'] : undefined) ?? null
  }, [rowsBySlug, slug])

  const holderToken = tokenAddress ?? row?.tokenAddress
  const { data: holderResult } = useHolderCount(chainId, holderToken ?? undefined)

  return useMemo(() => {
    if (!row || row.status === 'UNAVAILABLE') {
      const base = emptyMarket(loading, registeredMarketCount)
      if (holderResult?.status === 'ready' && holderResult.count != null && holderResult.count > 0) {
        return { ...base, holders: holderResult.count.toLocaleString() }
      }
      return base
    }

    const change = formatFeaturedChange(row)
    const priceBnb =
      row.latestPriceQuote && row.latestPriceQuote > 0
        ? `${formatHumanDecimal(row.latestPriceQuote)} BNB`
        : 'Unavailable'
    const priceUsdRaw = formatFeaturedPrice(row)
    const priceUsd = priceUsdRaw === 'Price updating' ? 'Unavailable' : priceUsdRaw
    const liquidityRaw = formatFeaturedLiquidity(row)
    const volumeRaw = formatFeaturedVolume(row)
    const marketCapRaw = formatFeaturedMarketCap(row)

    const holders =
      holderResult?.status === 'ready' && holderResult.count != null && holderResult.count > 0
        ? holderResult.count.toLocaleString()
        : 'Unavailable'

    return {
      loading,
      row,
      priceBnb,
      priceUsd,
      marketCap: marketCapRaw === '—' ? 'Unavailable' : marketCapRaw,
      fdv: marketCapRaw === '—' ? 'Unavailable' : marketCapRaw,
      liquidity: liquidityRaw === '—' ? 'Unavailable' : liquidityRaw,
      volume24h:
        volumeRaw === '—' || volumeRaw === 'No recent swaps' ? 'Unavailable' : volumeRaw,
      swaps24h:
        row.tradeCount24h != null && Number.isFinite(row.tradeCount24h)
          ? String(row.tradeCount24h)
          : 'Unavailable',
      holders,
      markets: registeredMarketCount > 0 ? String(registeredMarketCount) : 'Unavailable',
      trend: change.empty ? 'Unavailable' : change.text,
      trendPositive: change.empty ? undefined : change.positive,
      ath: 'Unavailable',
      atl: 'Unavailable',
      lastUpdate: relativeFromUnix(row.lastTradeTimestamp),
      source: row.source === 'none' ? 'none' : row.source,
      status: row.status,
      pairAddress: row.pairAddress,
    }
  }, [row, loading, registeredMarketCount, holderResult])
}
