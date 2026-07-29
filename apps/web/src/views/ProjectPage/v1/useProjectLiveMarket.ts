import { useMemo } from 'react'
import type { FeaturedMarketRow } from 'lib/bsc-indexer/featuredMarkets'
import {
  formatFeaturedChange,
  formatFeaturedMetric,
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

/**
 * Factual market observations only — Featured indexer rows when present.
 * Never invents USD, holders, ATH/ATL, or FDV.
 */
export function useProjectLiveMarket(slug: string, registeredMarketCount: number): ProjectLiveMarketView {
  const { rowsBySlug, loading } = useFeaturedProjectMarkets()
  // marco-wbnb featured pair is stored under FEATURED_PAIR_SLUG in some paths;
  // founder featured rows use project slug. Try both.
  const row = useMemo(() => {
    return rowsBySlug[slug] ?? (slug === 'marco' ? rowsBySlug['marco-wbnb'] : undefined) ?? null
  }, [rowsBySlug, slug])

  return useMemo(() => {
    if (!row || row.status === 'UNAVAILABLE') {
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

    const change = formatFeaturedChange(row)
    const priceBnb =
      row.latestPriceQuote && row.latestPriceQuote > 0
        ? `${formatHumanDecimal(row.latestPriceQuote)} BNB`
        : 'Unavailable'

    return {
      loading,
      row,
      priceBnb,
      priceUsd: 'Unavailable',
      marketCap: formatFeaturedMetric(row.marketCapQuote, 'BNB').replace(/^—$/, 'Unavailable'),
      fdv: 'Unavailable',
      liquidity: formatFeaturedMetric(row.liquidityQuote, 'BNB').replace(/^—$/, 'Unavailable'),
      volume24h: formatFeaturedMetric(row.volume24hQuote, 'BNB').replace(/^—$/, 'Unavailable'),
      swaps24h:
        row.tradeCount24h != null && Number.isFinite(row.tradeCount24h)
          ? String(row.tradeCount24h)
          : 'Unavailable',
      holders: 'Unavailable',
      markets: registeredMarketCount > 0 ? String(registeredMarketCount) : 'Unavailable',
      trend: change.empty ? 'Unavailable' : change.text,
      trendPositive: change.empty ? undefined : change.positive,
      ath: 'Unavailable',
      atl: 'Unavailable',
      lastUpdate: relativeFromUnix(row.lastTradeTimestamp),
      source: row.source === 'none' ? 'none' : row.source,
      status: row.status,
    }
  }, [row, loading, registeredMarketCount])
}
