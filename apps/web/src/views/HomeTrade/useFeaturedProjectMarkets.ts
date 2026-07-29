import { useEffect, useRef, useState } from 'react'
import type { FeaturedMarketRow } from 'lib/bsc-indexer/featuredMarkets'
import { getFirstThreeNonZeroDecimals } from 'utils/formatInfoNumbers'

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
            // Keep last-good unless this is a permanent identity miss with no prior data.
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

/** Microscopic reserve ratios are not meaningful Featured product prices. */
const FEATURED_PRICE_MIN_MEANINGFUL = 1e-6

export function formatFeaturedPrice(row?: FeaturedMarketRow): string {
  if (!row?.latestPriceQuote || !(row.latestPriceQuote > 0)) return 'Price unavailable'
  const p = row.latestPriceQuote
  if (!Number.isFinite(p) || p < FEATURED_PRICE_MIN_MEANINGFUL) return 'Price unavailable'
  if (p >= 1) return `${p.toFixed(4)} BNB`
  if (p >= 0.0001) return `${p.toFixed(6)} BNB`
  // Leading-zero compression (approved info formatter) — never scientific notation.
  return `${getFirstThreeNonZeroDecimals(p)} BNB`
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
