/**
 * Founder-acceptance Featured Projects — deterministic identity resolution.
 * Addresses/logos from canonical token list + project registry. No fabricated market metrics.
 */
import { getAllProjects } from 'registry/projects/getAllProjects'
import defaultTokenList from 'config/constants/tokenLists/pancake-default.tokenlist.json'

export const FOUNDER_FEATURED_SLUGS = ['mm72', 'eyed', 'young-degens', 'blion'] as const

export type FeaturedProjectResolved = {
  slug: string
  displayName: string
  symbol: string
  address?: string
  chainId: number
  logoUrl?: string
  description?: string
  category?: string
  href: string
  resolved: boolean
  resolutionFailure?: string
  /** True only when the entry has a genuine canonical project (slug + href resolve to a real project page). */
  eligibleForRotation: boolean
}

type TokenListEntry = {
  chainId?: number
  address?: string
  symbol?: string
  name?: string
  logoURI?: string
  decimals?: number
}

const TOKEN_BY_SYMBOL = (() => {
  const map = new Map<string, TokenListEntry>()
  for (const raw of (defaultTokenList.tokens ?? []) as TokenListEntry[]) {
    if (raw.chainId !== 56 || !raw.symbol || !raw.address) continue
    map.set(raw.symbol.toUpperCase(), raw)
  }
  return map
})()

const SLUG_TO_SYMBOL: Record<(typeof FOUNDER_FEATURED_SLUGS)[number], string> = {
  mm72: 'MM72',
  eyed: 'EYED',
  'young-degens': 'YD',
  blion: 'BLION',
}

export function resolveFeaturedProject(slug: (typeof FOUNDER_FEATURED_SLUGS)[number]): FeaturedProjectResolved {
  const projects = getAllProjects()
  const project = projects.find((p) => p.slug === slug || p.aliases?.includes(slug))
  const symbolHint = SLUG_TO_SYMBOL[slug]
  const tokenFromProject = project?.resources?.tokens?.find((t) => t.chainId === 56)
  const tokenFromList = TOKEN_BY_SYMBOL.get(symbolHint)
  const address = tokenFromProject?.address ?? tokenFromList?.address
  const symbol = tokenFromProject?.symbol ?? tokenFromList?.symbol ?? symbolHint
  const displayName = project?.displayName ?? tokenFromList?.name ?? symbolHint
  const logoUrl = project?.logoUrl ?? tokenFromList?.logoURI
  const description = project?.tagline ?? project?.description?.slice(0, 120)
  const category = project?.sectorTags?.[0] ?? project?.projectType

  // No canonical registry project matched — the `/@slug` href would 404, so this
  // entry can never be a real navigation target and must be excluded from rotation.
  if (!project && !tokenFromList) {
    return {
      slug,
      displayName: symbolHint,
      symbol: symbolHint,
      chainId: 56,
      href: `/@${slug}`,
      resolved: false,
      resolutionFailure: `No registry or token-list identity for ${slug}`,
      eligibleForRotation: false,
    }
  }

  if (!address) {
    return {
      slug,
      displayName,
      symbol,
      chainId: 56,
      logoUrl,
      description,
      category,
      href: project ? `/@${project.slug}` : `/@${slug}`,
      resolved: false,
      resolutionFailure: `Missing BSC token address for ${slug}`,
      eligibleForRotation: Boolean(project),
    }
  }

  return {
    slug: project?.slug ?? slug,
    displayName,
    symbol,
    address,
    chainId: 56,
    logoUrl,
    description,
    category,
    href: `/@${project?.slug ?? slug}`,
    resolved: true,
    eligibleForRotation: Boolean(project),
  }
}

/** All founder slugs, resolved — including entries ineligible for rotation (diagnostic use only). */
export function resolveFounderFeaturedProjectsUnfiltered(): FeaturedProjectResolved[] {
  return FOUNDER_FEATURED_SLUGS.map(resolveFeaturedProject)
}

/**
 * Founder amendment P0-2 — Featured entries without a valid canonical project
 * identity (no real registry slug/href) are never eligible for the Home rotation.
 */
export function resolveFounderFeaturedProjects(): FeaturedProjectResolved[] {
  return resolveFounderFeaturedProjectsUnfiltered().filter((p) => p.eligibleForRotation)
}

/** Deterministic rotation offset for future eligibility catalogs (no hydration mismatch). */
export function featuredRotationOffset(catalogLength: number, nowMs = Date.now(), slotMs = 8 * 60_000): number {
  if (catalogLength <= 4) return 0
  const slot = Math.floor(nowMs / slotMs)
  return (slot * 4) % catalogLength
}
