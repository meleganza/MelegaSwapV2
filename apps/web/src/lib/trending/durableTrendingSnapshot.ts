/**
 * Durable last-good Top Movers snapshot — stale-while-revalidate for the ticker.
 * Never fabricates movers; only persists factual ranked items already produced.
 */

import type { MelegaTickerItem } from 'design-system/melega'

const STORAGE_KEY = 'melega.trending.durable-snapshot.v1'
const MAX_AGE_MS = 6 * 60 * 60 * 1000 // 6h last-good window

export type DurableTrendingSnapshot = {
  schema: 'melega.trending.durable-snapshot.v1'
  updatedAt: number
  items: MelegaTickerItem[]
  source: 'ranked-assets'
}

export function readDurableTrendingSnapshot(): DurableTrendingSnapshot | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as DurableTrendingSnapshot
    if (!parsed?.items?.length || !parsed.updatedAt) return null
    if (Date.now() - parsed.updatedAt > MAX_AGE_MS) return null
    return parsed
  } catch {
    return null
  }
}

export function writeDurableTrendingSnapshot(items: MelegaTickerItem[]): void {
  if (typeof window === 'undefined') return
  if (!items.length) return
  try {
    const snap: DurableTrendingSnapshot = {
      schema: 'melega.trending.durable-snapshot.v1',
      updatedAt: Date.now(),
      items: items.slice(0, 10),
      source: 'ranked-assets',
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snap))
  } catch {
    // quota / private mode — ignore
  }
}

/** Merge live items with last-good; prefer live when non-empty. */
export function resolveTrendingItemsForDisplay(
  live: MelegaTickerItem[],
  lastGood: MelegaTickerItem[] | null | undefined,
): { items: MelegaTickerItem[]; fromDurable: boolean } {
  if (live.length > 0) return { items: live, fromDurable: false }
  if (lastGood && lastGood.length > 0) return { items: lastGood, fromDurable: true }
  return { items: [], fromDurable: false }
}
