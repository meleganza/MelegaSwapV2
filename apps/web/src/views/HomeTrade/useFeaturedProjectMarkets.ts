import { useEffect, useRef, useState } from 'react'
import type { FeaturedMarketRow } from 'lib/bsc-indexer/featuredMarkets'

type FeaturedMarketsResponse = {
  generatedAt?: string
  rows?: FeaturedMarketRow[]
}

/**
 * Fetches Featured Project market rows. Preserves last-good factual rows across
 * transient empty/error responses so cards stay visually stable.
 */
export function useFeaturedProjectMarkets(): {
  rowsBySlug: Record<string, FeaturedMarketRow>
  loading: boolean
} {
  const [rowsBySlug, setRowsBySlug] = useState<Record<string, FeaturedMarketRow>>({})
  const [loading, setLoading] = useState(true)
  const lastGood = useRef<Record<string, FeaturedMarketRow>>({})

  useEffect(() => {
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
        setRowsBySlug(next)
      } catch {
        if (!cancelled && Object.keys(lastGood.current).length) {
          setRowsBySlug({ ...lastGood.current })
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    const id = window.setInterval(load, 60_000)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [])

  return { rowsBySlug, loading }
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
  if (!row?.latestPriceQuote || !(row.latestPriceQuote > 0) || !Number.isFinite(row.latestPriceQuote)) {
    return 'Price unavailable'
  }
  return `${formatHumanDecimal(row.latestPriceQuote)} BNB`
}

export function formatFeaturedMetric(value?: number, unit = 'BNB'): string {
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
    return { text: 'Insufficient observations', empty: true }
  }
  const positive = row.changePct >= 0
  const arrow = positive ? '↑' : '↓'
  const base = `${arrow} ${Math.abs(row.changePct).toFixed(2)}%`
  const label = row.periodLabel && row.periodLabel !== '24H' ? ` · ${row.periodLabel}` : ''
  return { text: `${base}${label}`, positive, empty: false }
}
