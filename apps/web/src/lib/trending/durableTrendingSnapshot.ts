/**
 * Durable last-good Top Movers snapshot — atomic stale-while-revalidate.
 * Never fabricates movers; never lets a sparse live set clobber a richer complete snapshot.
 */

import type { MelegaTickerItem } from 'design-system/melega'

const STORAGE_KEY = 'melega.trending.durable-snapshot.v1'
const MAX_AGE_MS = 6 * 60 * 60 * 1000 // 6h last-good window
/** Minimum display tenure before a non-material identity churn can replace the snapshot. */
export const MIN_TRENDING_TENURE_MS = 12_000
/** A live candidate must be at least this fraction of the last-good size to replace it. */
export const MIN_COMPLETE_RATIO = 0.6
export const MIN_COMPLETE_ABS = 4

export type DurableTrendingSnapshot = {
  schema: 'melega.trending.durable-snapshot.v1'
  updatedAt: number
  items: MelegaTickerItem[]
  source: 'ranked-assets'
  generation?: number
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

export function writeDurableTrendingSnapshot(items: MelegaTickerItem[], generation = Date.now()): void {
  if (typeof window === 'undefined') return
  if (!items.length) return
  try {
    const snap: DurableTrendingSnapshot = {
      schema: 'melega.trending.durable-snapshot.v1',
      updatedAt: Date.now(),
      items: items.slice(0, 40),
      source: 'ranked-assets',
      generation,
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snap))
  } catch {
    // quota / private mode — ignore
  }
}

export type TrendingCandidateDecision =
  | { accept: true; reason: 'EMPTY_LAST_GOOD' | 'COMPLETE_REPLACEMENT' | 'MATERIAL_UPDATE' }
  | { accept: false; reason: 'PARTIAL_SPARSE' | 'TENURE_HOLD' | 'EMPTY_CANDIDATE' }

/**
 * Validate whether a candidate live snapshot may atomically replace last-good.
 * Rejects two-token (or sparse) collapses after a larger complete snapshot.
 */
export function evaluateTrendingCandidateReplacement(
  candidate: MelegaTickerItem[],
  lastGood: MelegaTickerItem[] | null | undefined,
  lastGoodUpdatedAt?: number,
  now = Date.now(),
): TrendingCandidateDecision {
  if (!candidate.length) return { accept: false, reason: 'EMPTY_CANDIDATE' }
  if (!lastGood?.length) return { accept: true, reason: 'EMPTY_LAST_GOOD' }

  const minRequired = Math.max(MIN_COMPLETE_ABS, Math.ceil(lastGood.length * MIN_COMPLETE_RATIO))
  if (candidate.length < minRequired && candidate.length < lastGood.length) {
    return { accept: false, reason: 'PARTIAL_SPARSE' }
  }

  const tenureOk =
    lastGoodUpdatedAt == null || now - lastGoodUpdatedAt >= MIN_TRENDING_TENURE_MS
  if (!tenureOk) {
    const sameIds =
      candidate.length === lastGood.length &&
      candidate.every((item, i) => item.id === lastGood[i]?.id || item.primary === lastGood[i]?.primary)
    if (sameIds) return { accept: true, reason: 'COMPLETE_REPLACEMENT' }
    // Allow material rank changes only when the candidate is complete.
    const overlap = candidate.filter((c) =>
      lastGood.some((g) => g.id === c.id || g.primary === c.primary),
    ).length
    const material = overlap / Math.max(lastGood.length, 1) < 0.5
    if (material && candidate.length >= minRequired) {
      return { accept: true, reason: 'MATERIAL_UPDATE' }
    }
    return { accept: false, reason: 'TENURE_HOLD' }
  }

  return { accept: true, reason: 'COMPLETE_REPLACEMENT' }
}

/** Merge live items with last-good; accept live only after completeness validation. */
export function resolveTrendingItemsForDisplay(
  live: MelegaTickerItem[],
  lastGood: MelegaTickerItem[] | null | undefined,
  lastGoodUpdatedAt?: number,
): { items: MelegaTickerItem[]; fromDurable: boolean; rejectedPartial: boolean } {
  if (live.length > 0) {
    const decision = evaluateTrendingCandidateReplacement(live, lastGood, lastGoodUpdatedAt)
    if (decision.accept) {
      return { items: live, fromDurable: false, rejectedPartial: false }
    }
    if (lastGood && lastGood.length > 0) {
      return { items: lastGood, fromDurable: true, rejectedPartial: true }
    }
  }
  if (lastGood && lastGood.length > 0) {
    return { items: lastGood, fromDurable: true, rejectedPartial: false }
  }
  return { items: [], fromDurable: false, rejectedPartial: false }
}
