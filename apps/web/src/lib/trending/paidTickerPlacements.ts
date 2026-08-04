/**
 * Paid ticker placements — Trend Boost / Featured disclosure slots.
 * Client-safe: never pads organic movers; only injects explicitly labelled paid rows.
 */
import type { MelegaTickerItem } from 'design-system/melega'

export type PaidTickerPlacement = {
  id: string
  kind: 'boosted' | 'featured'
  symbol: string
  chainId: number
  address: string | null
  href?: string
  startsAt?: string | null
  endsAt?: string | null
}

export function isPaidPlacementActive(
  placement: PaidTickerPlacement,
  nowMs = Date.now(),
): boolean {
  if (placement.startsAt) {
    const s = Date.parse(placement.startsAt)
    if (Number.isFinite(s) && nowMs < s) return false
  }
  if (placement.endsAt) {
    const e = Date.parse(placement.endsAt)
    if (Number.isFinite(e) && nowMs > e) return false
  }
  return Boolean(placement.symbol)
}

export function paidPlacementToTickerItem(placement: PaidTickerPlacement): MelegaTickerItem {
  const label = placement.kind === 'boosted' ? 'Boosted' : 'Featured'
  return {
    id: `paid-${placement.kind}-${placement.chainId}-${placement.id}`,
    primary: `${placement.symbol} · ${label}`,
    secondary: label,
    href:
      placement.href ||
      (placement.address ? `/swap?outputCurrency=${placement.address}&chain=${placement.chainId}` : undefined),
    accentUnavailable: true,
  }
}

/**
 * Ordering: paid Boosted → organic movers → paid Featured.
 * Never invent organic rows. Never pad.
 */
export function mergeTickerWithPaidPlacements(input: {
  organic: MelegaTickerItem[]
  boosted?: PaidTickerPlacement[]
  featured?: PaidTickerPlacement[]
  nowMs?: number
}): MelegaTickerItem[] {
  const now = input.nowMs ?? Date.now()
  const boosted = (input.boosted ?? [])
    .filter((p) => isPaidPlacementActive(p, now))
    .map(paidPlacementToTickerItem)
  const featured = (input.featured ?? [])
    .filter((p) => isPaidPlacementActive(p, now))
    .map(paidPlacementToTickerItem)
  return [...boosted, ...input.organic, ...featured]
}

/** Eligibility gate: every ticker row must have measured move OR disclosed paid label. */
export function tickerItemIsEligible(item: MelegaTickerItem): boolean {
  const primary = item.primary || ''
  const paid = /·\s*(Boosted|Featured)\b/i.test(primary) || /^(Boosted|Featured)$/i.test(item.secondary || '')
  if (paid) return true
  if (item.accentUnavailable) return false
  const accent = item.accent || ''
  return /%/.test(accent) || /[↑↓]/.test(accent)
}
