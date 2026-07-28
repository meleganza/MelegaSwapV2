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

export function formatFeaturedPrice(row?: FeaturedMarketRow): string {
  if (!row?.latestPriceQuote || !(row.latestPriceQuote > 0)) return '—'
  const p = row.latestPriceQuote
  if (p >= 1) return `${p.toFixed(4)} BNB`
  if (p >= 0.0001) return `${p.toFixed(6)} BNB`
  return `${p.toExponential(2)} BNB`
}

export function formatFeaturedChange(row?: FeaturedMarketRow): {
  text: string
  positive?: boolean
  empty: boolean
} {
  if (row?.changePct == null || !Number.isFinite(row.changePct)) {
    return { text: '—', empty: true }
  }
  const positive = row.changePct >= 0
  const arrow = positive ? '↑' : '↓'
  const base = `${arrow} ${Math.abs(row.changePct).toFixed(2)}%`
  const label = row.periodLabel && row.periodLabel !== '24H' ? ` · ${row.periodLabel}` : ''
  return { text: `${base}${label}`, positive, empty: false }
}
