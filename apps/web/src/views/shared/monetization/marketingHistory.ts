import type { MarketingHistoryEntry, MarketingHistoryKind, MarketingHistoryStatus } from './commercialCheckoutTypes'

const KEY = (slug: string) => `melega.marketingHistory.v1.${slug}`

export function loadMarketingHistory(slug: string): MarketingHistoryEntry[] {
  if (typeof window === 'undefined' || !slug) return []
  try {
    const raw = window.localStorage.getItem(KEY(slug))
    if (!raw) return []
    const parsed = JSON.parse(raw) as MarketingHistoryEntry[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveMarketingHistory(slug: string, entries: MarketingHistoryEntry[]) {
  if (typeof window === 'undefined' || !slug) return
  try {
    window.localStorage.setItem(KEY(slug), JSON.stringify(entries.slice(0, 40)))
  } catch {
    /* ignore */
  }
}

export function appendMarketingHistory(
  slug: string,
  entry: Omit<MarketingHistoryEntry, 'id' | 'createdAt'> & { id?: string; createdAt?: string },
): MarketingHistoryEntry[] {
  const next: MarketingHistoryEntry = {
    id: entry.id ?? `mh-${Date.now()}`,
    kind: entry.kind,
    label: entry.label,
    status: entry.status,
    packageId: entry.packageId,
    createdAt: entry.createdAt ?? new Date().toISOString(),
    expiresAt: entry.expiresAt ?? null,
  }
  const prev = loadMarketingHistory(slug)
  const merged = [next, ...prev.filter((e) => e.id !== next.id)]
  saveMarketingHistory(slug, merged)
  return merged
}

export function resolveMarketingStatus(
  status: MarketingHistoryStatus,
  expiresAt?: string | null,
): MarketingHistoryStatus {
  if (status === 'Completed') return 'Completed'
  if (expiresAt) {
    const t = Date.parse(expiresAt)
    if (Number.isFinite(t) && t < Date.now()) return 'Expired'
  }
  return status
}

export const MARKETING_KIND_LABEL: Record<MarketingHistoryKind, string> = {
  featured: 'Featured',
  'trend-boost': 'Trend Boost',
  'sponsored-research': 'Sponsored Research',
  claim: 'Claim',
  farm: 'Farm',
  pool: 'Pool',
  liquidity: 'Liquidity',
}
