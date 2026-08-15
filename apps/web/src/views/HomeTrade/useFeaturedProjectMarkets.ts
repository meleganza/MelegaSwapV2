import { useEffect, useMemo, useRef, useState } from 'react'
import type { FeaturedMarketRow } from 'lib/bsc-indexer/featuredMarkets'
import { formatUsdCompact, formatUsdPrice } from 'lib/bsc-indexer/usdValuation'
import { useCanonicalMarketSnapshot } from 'lib/market-data'
import type { CanonicalFeaturedObservation } from 'lib/market-data/types'

type FeaturedMarketsResponse = {
  generatedAt?: string
  rows?: FeaturedMarketRow[]
  bnbUsd?: number
}

function featuredFromCanonical(row: CanonicalFeaturedObservation): FeaturedMarketRow {
  return {
    slug: row.slug,
    symbol: row.symbol,
    tokenAddress: row.tokenAddress,
    pairAddress: row.pairAddress,
    status: (row.status as FeaturedMarketRow['status']) || 'STALE',
    latestPriceQuote: row.priceWbnb,
    latestPriceUsd: row.priceUsd,
    changePct: row.changePct,
    periodLabel: '24H',
    volume24hQuote: row.volume24hWbnb,
    volume24hUsd: row.volume24hUsd,
    tradeCount24h: row.tradeCount24h,
    liquidityUsd: row.liquidityUsd,
    marketCapUsd: row.fdvUsd,
    marketCapLabel: row.marketCapLabel,
    bnbUsd: row.bnbUsd,
    quoteSymbol: 'WBNB',
    source: (row.source as FeaturedMarketRow['source']) || 'melega-factory-reserves',
  }
}

/**
 * Featured Project market rows — prefer certified canonical snapshot; fall back to
 * featured-markets API. Preserves last-good factual rows across transient failures.
 */
export function useFeaturedProjectMarkets(): {
  rowsBySlug: Record<string, FeaturedMarketRow>
  loading: boolean
} {
  const marketSnapshot = useCanonicalMarketSnapshot()
  const [fallbackRows, setFallbackRows] = useState<Record<string, FeaturedMarketRow>>({})
  const [loading, setLoading] = useState(true)
  const lastGood = useRef<Record<string, FeaturedMarketRow>>({})

  useEffect(() => {
    if (marketSnapshot.featured.length > 0) {
      setLoading(false)
      return
    }
    let cancelled = false
    const load = async () => {
      try {
        const res = await fetch('/api/indexer/featured-markets/')
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const body = (await res.json()) as FeaturedMarketsResponse
        if (cancelled) return
        const next: Record<string, FeaturedMarketRow> = { ...lastGood.current }
        for (const row of body.rows ?? []) {
          if (row.status === 'UNAVAILABLE' && lastGood.current[row.slug]) {
            continue
          }
          next[row.slug] = row
          if (row.status === 'LIVE' || row.status === 'STALE' || row.status === 'NO_RECENT_TRADES') {
            lastGood.current[row.slug] = row
          }
        }
        setFallbackRows(next)
      } catch {
        if (!cancelled && Object.keys(lastGood.current).length) {
          setFallbackRows({ ...lastGood.current })
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    const loadWhenVisible = () => {
      if (!document.hidden) void load()
    }
    const onVisibilityChange = () => {
      if (!document.hidden) void load()
    }
    loadWhenVisible()
    const id = window.setInterval(loadWhenVisible, 60_000)
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      cancelled = true
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [marketSnapshot.featured.length])

  const rowsBySlug = useMemo(() => {
    if (marketSnapshot.featured.length > 0) {
      const next: Record<string, FeaturedMarketRow> = { ...lastGood.current }
      for (const row of marketSnapshot.featured) {
        const mapped = featuredFromCanonical(row)
        next[row.slug] = mapped
        lastGood.current[row.slug] = mapped
      }
      return next
    }
    return fallbackRows
  }, [marketSnapshot.featured, fallbackRows])

  return { rowsBySlug, loading: loading && marketSnapshot.isLoading }
}

/** Human decimal string — never scientific notation. */
export function formatHumanDecimal(value: number, maxDecimals = 12): string {
  if (!Number.isFinite(value) || value <= 0) return ''
  if (value >= 1) return value.toFixed(4).replace(/\.?0+$/, '')
  if (value >= 0.0001) return value.toFixed(6).replace(/\.?0+$/, '')
  // Founder examples: 0.000000427 or <0.000001 — never 4.27e-10.
  if (value < 1e-12) return '<0.000001'
  const fixed = value.toFixed(maxDecimals)
  const trimmed = fixed.replace(/0+$/, '').replace(/\.$/, '')
  if (!trimmed || trimmed === '0') return '<0.000001'
  return trimmed
}

export function formatFeaturedPrice(row?: FeaturedMarketRow): string {
  if (row?.latestPriceUsd != null && row.latestPriceUsd > 0) {
    return formatUsdPrice(row.latestPriceUsd)
  }
  if (row?.latestPriceQuote && row.latestPriceQuote > 0 && Number.isFinite(row.latestPriceQuote)) {
    // Secondary provenance only when USD unavailable
    return 'Price updating'
  }
  return 'Price updating'
}

export function formatFeaturedUsdMetric(value?: number | null, emptyLabel = '—'): string {
  if (value == null || !Number.isFinite(value) || value < 0) return emptyLabel
  return formatUsdCompact(value)
}

/** @deprecated Prefer formatFeaturedUsdMetric — kept for non-USD fixtures. */
export function formatFeaturedMetric(value?: number, unit = 'BNB'): string {
  if (unit === 'USD' || unit === '$') return formatFeaturedUsdMetric(value)
  if (value == null || !Number.isFinite(value) || value <= 0) return '—'
  if (value >= 1000) return `${value.toLocaleString('en-US', { maximumFractionDigits: 1 })} ${unit}`
  if (value >= 1) return `${value.toFixed(2)} ${unit}`
  if (value >= 0.0001) return `${value.toFixed(4)} ${unit}`
  return `${formatHumanDecimal(value)} ${unit}`
}

export function formatFeaturedChange(row?: FeaturedMarketRow): {
  text: string
  positive?: boolean
  empty: boolean
} {
  if (row?.changePct == null || !Number.isFinite(row.changePct)) {
    return { text: '', empty: true }
  }
  const positive = row.changePct >= 0
  const arrow = positive ? '↑' : '↓'
  const base = `${arrow} ${Math.abs(row.changePct).toFixed(2)}%`
  const label = row.periodLabel && row.periodLabel !== '24H' ? ` · ${row.periodLabel}` : ''
  return { text: `${base}${label}`, positive, empty: false }
}

export function formatFeaturedMarketCap(row?: FeaturedMarketRow): string {
  if (row?.marketCapUsd != null && row.marketCapUsd > 0) {
    return formatUsdCompact(row.marketCapUsd)
  }
  return '—'
}

export function formatFeaturedVolume(row?: FeaturedMarketRow): string {
  if (row?.volume24hUsd != null) {
    if (row.volume24hUsd === 0) return '$0.00'
    return formatUsdCompact(row.volume24hUsd)
  }
  if (row?.tradeCount24h === 0 || row?.status === 'NO_RECENT_TRADES') return '$0.00'
  return '—'
}

export function formatFeaturedLiquidity(row?: FeaturedMarketRow): string {
  if (row?.liquidityUsd != null && row.liquidityUsd > 0) return formatUsdCompact(row.liquidityUsd)
  return '—'
}
