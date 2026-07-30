/**
 * Canonical Top Movers shared snapshot — single ordered list for ticker + Home card.
 * Home is always a deterministic prefix of the ticker snapshot. No independent ranking.
 */

import type { MelegaTickerItem } from 'design-system/melega'

export const HOME_TOP_MOVERS_LIMIT = 3

function fnv1aHex(input: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(16).padStart(8, '0')
}

export type TopMoverEntry = {
  id: string
  symbol: string
  address: string | null
  changeLabel: string | null
  changePct: number | null
  accentPositive?: boolean
  href: string
}

export type TopMoversSharedSnapshot = {
  schema: 'melega.top-movers.shared-snapshot.v1'
  snapshotId: string
  generatedAt: string
  sourceBlock: number | null
  fromDurable: boolean
  entries: TopMoverEntry[]
}

export function extractAddressFromHref(href?: string): string | null {
  if (!href) return null
  try {
    const q = href.includes('?') ? href.slice(href.indexOf('?') + 1) : ''
    const params = new URLSearchParams(q)
    const out = params.get('outputCurrency')
    if (out && /^0x[a-fA-F0-9]{40}$/.test(out)) return out.toLowerCase()
  } catch {
    // ignore
  }
  return null
}

export function parseChangePct(accent?: string): number | null {
  if (!accent) return null
  const n = Number(String(accent).replace(/[^0-9.+-]/g, ''))
  return Number.isFinite(n) ? n : null
}

/** Stable snapshot id from ordered identity + percentages. */
export function buildTopMoversSnapshotId(entries: TopMoverEntry[], generatedAt: string): string {
  const payload = entries
    .map((e) => `${e.address || e.symbol}:${e.changePct ?? e.changeLabel ?? ''}`)
    .join('|')
  return `tm${fnv1aHex(payload)}${fnv1aHex(generatedAt).slice(0, 8)}`
}

export function tickerItemsToEntries(items: MelegaTickerItem[]): TopMoverEntry[] {
  return items.map((item) => {
    const address = extractAddressFromHref(item.href)
    return {
      id: item.id,
      symbol: item.primary,
      address,
      changeLabel: item.accent?.trim() || null,
      changePct: parseChangePct(item.accent),
      accentPositive: item.accentPositive,
      href: item.href || (address ? `/swap?outputCurrency=${address}` : '/trade'),
    }
  })
}

export function buildTopMoversSharedSnapshot(input: {
  items: MelegaTickerItem[]
  fromDurable?: boolean
  sourceBlock?: number | null
  generatedAt?: string
}): TopMoversSharedSnapshot {
  const generatedAt = input.generatedAt ?? new Date().toISOString()
  const entries = tickerItemsToEntries(input.items)
  return {
    schema: 'melega.top-movers.shared-snapshot.v1',
    snapshotId: buildTopMoversSnapshotId(entries, generatedAt),
    generatedAt,
    sourceBlock: input.sourceBlock ?? null,
    fromDurable: Boolean(input.fromDurable),
    entries,
  }
}

/** Home card = first N of the exact ordered snapshot. */
export function homeTopMoversPrefix(
  snapshot: TopMoversSharedSnapshot,
  limit = HOME_TOP_MOVERS_LIMIT,
): TopMoverEntry[] {
  return snapshot.entries.slice(0, limit)
}

export function assertIdenticalPrefix(
  ticker: TopMoverEntry[],
  home: TopMoverEntry[],
): 'IDENTICAL_PREFIX' | 'MISMATCH' {
  if (home.length > ticker.length) return 'MISMATCH'
  for (let i = 0; i < home.length; i += 1) {
    const t = ticker[i]
    const h = home[i]
    if (!t || !h) return 'MISMATCH'
    const sameId = t.id === h.id
    const sameAddr =
      (t.address || '').toLowerCase() === (h.address || '').toLowerCase()
    const sameSym = t.symbol === h.symbol
    const sameLabel = (t.changeLabel || '') === (h.changeLabel || '')
    const samePct = t.changePct === h.changePct
    const sameSign = t.accentPositive === h.accentPositive
    // Identity + percentage must both match the ticker slot at the same index.
    if (!sameId || !sameSym || !sameAddr || !sameLabel || !samePct || !sameSign) return 'MISMATCH'
  }
  return 'IDENTICAL_PREFIX'
}

export function entriesToTickerItems(entries: TopMoverEntry[]): MelegaTickerItem[] {
  return entries.map((e) => ({
    id: e.id,
    primary: e.symbol,
    accent: e.changeLabel || undefined,
    accentPositive: e.accentPositive,
    href: e.href,
  }))
}
