/**
 * Home New Listings — multichain factual rows from registry + updates timestamps.
 * Never invents listing dates; uses Indexed when no publishedAt is known.
 */
import { getAllProjects } from 'registry/projects/getAllProjects'
import { listRegistryUpdatesForSlug } from 'registry/projects/identity/updates'
import { METRIC_STATUS } from 'lib/data-policy/metricStatus'

export type HomeNewListingRow = {
  id: string
  name: string
  symbol: string
  href: string
  chainId: number
  address?: string
  logoUrl?: string
  /** ISO date when a certified updates registry timestamp exists. */
  listedAt?: string
  /** Alias for listedAt — sorting / data-listing-timestamp. */
  listingTimestamp?: string
  /** User metric: date label or Indexed. */
  metric: string
}

function formatListingDate(iso: string): string {
  const d = new Date(iso)
  if (!Number.isFinite(d.getTime())) return METRIC_STATUS.INDEXED
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function latestPublishedAt(slug: string): string | undefined {
  try {
    const updates = listRegistryUpdatesForSlug(slug)
    if (!updates?.length) return undefined
    const sorted = [...updates].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    return sorted[0]?.publishedAt
  } catch {
    return undefined
  }
}

/** Multichain New Listings — one row per project×chain with a factual token or supported chain. */
export function buildHomeNewListings(limit = 5): HomeNewListingRow[] {
  const projects = getAllProjects().filter((p) => p.slug && p.slug !== 'melega-dex')
  const rows: Array<HomeNewListingRow & { sortTs: number; sortLegacy: number }> = []

  for (const p of projects) {
    const tokens = p.resources?.tokens ?? []
    const chainIds =
      tokens.length > 0
        ? [...new Set(tokens.map((t) => t.chainId))]
        : [...new Set(p.supportedChains ?? [56])]

    const publishedAt = latestPublishedAt(p.slug)
    const sortTs = publishedAt ? Date.parse(publishedAt) : 0

    for (const chainId of chainIds) {
      const token = tokens.find((t) => t.chainId === chainId) ?? tokens[0]
      const symbol = token?.symbol ?? p.displayName
      rows.push({
        id: `${p.slug}-${chainId}`,
        name: p.displayName || p.slug,
        symbol,
        href: `/@${p.slug}`,
        chainId,
        address: token?.address,
        logoUrl: p.logoUrl,
        listedAt: publishedAt,
        listingTimestamp: publishedAt,
        metric: publishedAt ? formatListingDate(publishedAt) : METRIC_STATUS.INDEXED,
        sortTs,
        sortLegacy: p.legacyImport ? 1 : 0,
      })
    }
  }

  rows.sort((a, b) => {
    if (b.sortTs !== a.sortTs) return b.sortTs - a.sortTs
    if (a.sortLegacy !== b.sortLegacy) return a.sortLegacy - b.sortLegacy
    return a.name.localeCompare(b.name)
  })

  return rows.slice(0, limit).map(({ sortTs: _s, sortLegacy: _l, ...row }) => row)
}
