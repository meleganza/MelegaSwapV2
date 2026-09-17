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

export function isPaidPlacementActive(placement: PaidTickerPlacement, nowMs = Date.now()): boolean {
  if (placement.startsAt) {
    const s = Date.parse(placement.startsAt)
    if (Number.isFinite(s) && nowMs < s) return false
  }
  if (placement.endsAt) {
    const e = Date.parse(placement.endsAt)
    if (Number.isFinite(e) && nowMs >= e) return false
  }
  return Boolean(placement.symbol)
}

export function formatPaidPlacementRemaining(endsAt?: string | null, nowMs = Date.now()): string | null {
  if (!endsAt) return null
  const end = Date.parse(endsAt)
  if (!Number.isFinite(end) || end <= nowMs) return null
  const minutes = Math.max(1, Math.ceil((end - nowMs) / 60_000))
  if (minutes < 60) return `${minutes}m`
  const hours = Math.ceil(minutes / 60)
  if (hours < 24) return `${hours}h`
  return `${Math.ceil(hours / 24)}d`
}

export function paidPlacementToTickerItem(placement: PaidTickerPlacement, nowMs = Date.now()): MelegaTickerItem {
  const label = placement.kind === 'boosted' ? 'Boosted' : 'Featured'
  const remaining = formatPaidPlacementRemaining(placement.endsAt, nowMs)
  return {
    id: `paid-${placement.kind}-${placement.chainId}-${placement.id}`,
    primary: placement.kind === 'boosted' ? `🚀 ${placement.symbol}` : `${placement.symbol} · ${label}`,
    secondary: label,
    href:
      placement.href ||
      (placement.address ? `/swap?outputCurrency=${placement.address}&chain=${placement.chainId}` : undefined),
    accent: remaining ?? undefined,
    accentPositive: placement.kind === 'boosted' ? true : undefined,
    accentUnavailable: !remaining,
  }
}

const EVM_ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/

function normalizePaidAddress(address: string | null | undefined): string | null {
  if (!address || !EVM_ADDRESS_RE.test(address)) return null
  return address.toLowerCase()
}

function tickerItemAddress(item: MelegaTickerItem): string | null {
  if (!item.href) return null
  try {
    const query = item.href.includes('?') ? item.href.slice(item.href.indexOf('?') + 1) : ''
    const output = new URLSearchParams(query).get('outputCurrency')
    if (output && EVM_ADDRESS_RE.test(output)) return output.toLowerCase()
    const tokenPath = /\/token\/[^/]+\/(0x[a-fA-F0-9]{40})/i.exec(item.href)
    if (tokenPath?.[1]) return tokenPath[1].toLowerCase()
  } catch {
    // ignore malformed hrefs
  }
  return null
}

function tickerSymbolKey(primary: string): string {
  return primary.replace(/^🚀\s+/, '').replace(/\s+·\s+(Boosted|Featured)$/i, '').trim().toUpperCase()
}

function paidIdentityKeys(placement: PaidTickerPlacement): string[] {
  const keys = [`sym:${placement.symbol.trim().toUpperCase()}`]
  const address = normalizePaidAddress(placement.address)
  if (address) keys.push(`addr:${address}`)
  return keys
}

function organicMatchesPaid(item: MelegaTickerItem, paidKeys: Set<string>): boolean {
  const address = tickerItemAddress(item)
  if (address && paidKeys.has(`addr:${address}`)) return true
  const symbol = tickerSymbolKey(item.primary || '')
  return Boolean(symbol) && paidKeys.has(`sym:${symbol}`)
}

/**
 * Ordering: paid Boosted → organic movers → paid Featured.
 * Never invent organic rows. Never pad. Same-token organic+paid is one disclosed row.
 */
export function mergeTickerWithPaidPlacements(input: {
  organic: MelegaTickerItem[]
  boosted?: PaidTickerPlacement[]
  featured?: PaidTickerPlacement[]
  nowMs?: number
}): MelegaTickerItem[] {
  const now = input.nowMs ?? Date.now()
  const boostedPlacements = (input.boosted ?? []).filter((placement) => isPaidPlacementActive(placement, now))
  const featuredPlacements = (input.featured ?? []).filter((placement) => isPaidPlacementActive(placement, now))
  const boosted = boostedPlacements.map((placement) => paidPlacementToTickerItem(placement, now))
  const featured = featuredPlacements.map((placement) => paidPlacementToTickerItem(placement, now))
  const paidKeys = new Set<string>()
  for (const placement of [...boostedPlacements, ...featuredPlacements]) {
    for (const key of paidIdentityKeys(placement)) paidKeys.add(key)
  }
  const organic =
    paidKeys.size === 0 ? input.organic : input.organic.filter((item) => !organicMatchesPaid(item, paidKeys))
  return [...boosted, ...organic, ...featured]
}

/** Eligibility gate: every ticker row must have measured move OR disclosed paid label. */
export function tickerItemIsEligible(item: MelegaTickerItem): boolean {
  const primary = item.primary || ''
  const paid =
    /·\s*(Boosted|Featured)\b/i.test(primary) ||
    /^🚀\s+/.test(primary) ||
    /^(Boosted|Featured)$/i.test(item.secondary || '')
  if (paid) return true
  if (item.accentUnavailable) return false
  const accent = item.accent || ''
  return /%/.test(accent) || /[↑↓]/.test(accent)
}
