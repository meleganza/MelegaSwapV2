/**
 * Market-data sanity guards — never publish corrupted values.
 */

import type { CanonicalMarketSnapshot } from './types'

export type SanityIssue = {
  code: string
  detail: string
  severity: 'block' | 'warn'
}

export type SanityResult = {
  ok: boolean
  degraded: boolean
  issues: SanityIssue[]
}

function badNumber(n: unknown): boolean {
  if (n == null) return false
  if (typeof n !== 'number') return true
  return !Number.isFinite(n) || Number.isNaN(n)
}

export function runMarketSanity(snapshot: CanonicalMarketSnapshot): SanityResult {
  const issues: SanityIssue[] = []

  if (badNumber(snapshot.bnbUsd) && snapshot.bnbUsd != null) {
    issues.push({ code: 'BNB_USD_INVALID', detail: String(snapshot.bnbUsd), severity: 'block' })
  }
  if (snapshot.volume24hUsd != null && (badNumber(snapshot.volume24hUsd) || snapshot.volume24hUsd < 0)) {
    issues.push({ code: 'VOLUME_INVALID', detail: String(snapshot.volume24hUsd), severity: 'block' })
  }
  if (snapshot.volume24hUsd != null && snapshot.volume24hUsd > 10_000_000_000) {
    issues.push({
      code: 'VOLUME_EXPLOSION',
      detail: String(snapshot.volume24hUsd),
      severity: 'block',
    })
  }
  if (snapshot.tvlUsd != null && (badNumber(snapshot.tvlUsd) || snapshot.tvlUsd < 0)) {
    issues.push({ code: 'TVL_INVALID', detail: String(snapshot.tvlUsd), severity: 'block' })
  }

  const pairIds = new Set<string>()
  for (const row of snapshot.pairs) {
    const id = row.pairAddress.toLowerCase()
    if (pairIds.has(id)) {
      issues.push({ code: 'DUPLICATE_PAIR', detail: id, severity: 'block' })
    }
    pairIds.add(id)
    if (row.liquidityUsd != null && (badNumber(row.liquidityUsd) || row.liquidityUsd < 0)) {
      issues.push({ code: 'LIQUIDITY_INVALID', detail: `${id}:${row.liquidityUsd}`, severity: 'block' })
    }
    if (row.priceUsd != null && (badNumber(row.priceUsd) || row.priceUsd < 0)) {
      issues.push({ code: 'PRICE_INVALID', detail: `${id}:${row.priceUsd}`, severity: 'block' })
    }
    if (row.volume24hUsd != null && (badNumber(row.volume24hUsd) || row.volume24hUsd < 0)) {
      issues.push({ code: 'PAIR_VOLUME_INVALID', detail: `${id}:${row.volume24hUsd}`, severity: 'block' })
    }
  }

  for (const f of snapshot.featured) {
    if (f.apr != null && (badNumber(f.apr) || f.apr < 0 || f.apr === Number.POSITIVE_INFINITY)) {
      issues.push({ code: 'APR_INVALID', detail: `${f.slug}:${f.apr}`, severity: 'warn' })
    }
    if (f.priceUsd != null && (badNumber(f.priceUsd) || f.priceUsd < 0)) {
      issues.push({ code: 'FEATURED_PRICE_INVALID', detail: `${f.slug}`, severity: 'block' })
    }
  }

  const blocked = issues.some((i) => i.severity === 'block')
  return { ok: !blocked, degraded: issues.length > 0, issues }
}
