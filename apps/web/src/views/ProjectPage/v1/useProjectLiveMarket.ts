import { useMemo } from 'react'
import type { FeaturedMarketRow } from 'lib/bsc-indexer/featuredMarkets'
import { useHolderCount } from 'lib/holder-count'
import { truthDash, buildProjectTruthMarketFromFeatured, GLOBAL_DATA_TRUTH_PIPELINE } from 'lib/data-truth'
import {
  formatFeaturedPrice,
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
  /** Global Data Truth pipeline id — identical across Home / Projects / Project Page. */
  pipeline: typeof GLOBAL_DATA_TRUTH_PIPELINE
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
    priceBnb: '—',
    priceUsd: '—',
    marketCap: '—',
    fdv: '—',
    liquidity: '—',
    volume24h: '—',
    swaps24h: '—',
    holders: '—',
    markets: registeredMarketCount > 0 ? String(registeredMarketCount) : '—',
    trend: '—',
    ath: '—',
    atl: '—',
    lastUpdate: null,
    source: 'none',
    status: 'UNAVAILABLE',
    pipeline: GLOBAL_DATA_TRUTH_PIPELINE,
  }
}

/**
 * Factual market observations — Featured / canonical snapshot SSOT (Global Data Truth).
 * Never invents USD, holders, ATH/ATL, or FDV. Missing → "—".
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
    const holdersReady =
      holderResult?.status === 'ready' && holderResult.count != null && holderResult.count > 0
        ? holderResult.count.toLocaleString()
        : undefined

    if (!row || row.status === 'UNAVAILABLE') {
      const base = emptyMarket(loading, registeredMarketCount)
      if (holdersReady) return { ...base, holders: holdersReady }
      return base
    }

    const truth = buildProjectTruthMarketFromFeatured(row, {
      holders: holdersReady,
      lastUpdate: relativeFromUnix(row.lastTradeTimestamp),
    })
    const priceBnb =
      row.latestPriceQuote && row.latestPriceQuote > 0
        ? `${formatHumanDecimal(row.latestPriceQuote)} BNB`
        : '—'
    const priceUsdRaw = formatFeaturedPrice(row)
    const priceUsd = priceUsdRaw === 'Price updating' ? '—' : truthDash(priceUsdRaw)

    return {
      loading,
      row,
      priceBnb,
      priceUsd,
      marketCap: truth.marketCap,
      fdv: truth.fdv,
      liquidity: truth.liquidity,
      volume24h: truth.volume,
      swaps24h: truth.transactions,
      holders: truth.holders,
      markets: registeredMarketCount > 0 ? String(registeredMarketCount) : '—',
      trend: truth.change24h,
      trendPositive: truth.changePositive,
      ath: '—',
      atl: '—',
      lastUpdate: truth.lastUpdate === '—' ? null : truth.lastUpdate,
      source: row.source === 'none' ? 'none' : row.source,
      status: row.status,
      pairAddress: row.pairAddress,
      pipeline: GLOBAL_DATA_TRUTH_PIPELINE,
    }
  }, [row, loading, registeredMarketCount, holderResult])
}
