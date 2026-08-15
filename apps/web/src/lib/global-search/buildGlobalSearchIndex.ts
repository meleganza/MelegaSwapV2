import { shellBottomNavItems, shellNavigation } from 'app-shell/config/navigation'
import { enrichProject } from 'registry/projects/discovery'
import { getAllProjects } from 'registry/projects/getAllProjects'
import { getAllCollectibles } from 'registry/collectibles/getAllCollectibles'
import { getAllVenues } from 'registry/venues/getAllVenues'
import { LEGACY_BSC_MASTER_CHEF } from 'registry/venues/constants'
import { SURFACE_MAP_RECORDS } from 'lib/surface-map/surface-map'
import { resolveCanonicalProjectHref } from 'lib/projects/canonicalProjectHref'
import { buildDexTokenIndex } from 'lib/dex-asset-index'
import type { GlobalSearchAction, GlobalSearchCategory, GlobalSearchEntry } from './types'

const CATEGORY_LABELS: Record<GlobalSearchCategory, string> = {
  page: 'Page',
  token: 'Token',
  farm: 'Farm',
  pool: 'Pool',
  project: 'Project',
  contract: 'Contract',
  collectible: 'Collectible',
}

export const globalSearchCategoryLabel = (category: GlobalSearchCategory): string =>
  CATEGORY_LABELS[category]

const entry = (
  partial: Omit<GlobalSearchEntry, 'searchableText'> & { keywords?: string[] },
): GlobalSearchEntry => {
  const haystack = [
    partial.label,
    partial.subtitle,
    partial.category,
    partial.address,
    partial.chainId != null ? String(partial.chainId) : '',
    ...(partial.keywords ?? []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  const { keywords: _keywords, ...rest } = partial
  return { ...rest, searchableText: haystack }
}

function tokenActions(address: string, projectHref?: string | null): GlobalSearchAction[] {
  const actions: GlobalSearchAction[] = [
    { label: 'Trade', href: `/swap?outputCurrency=${address}` },
  ]
  if (projectHref) actions.push({ label: 'Open Project', href: projectHref })
  actions.push({ label: 'Add Wallet', href: `/portfolio?addToken=${address}` })
  return actions
}

function projectActions(slug: string): GlobalSearchAction[] {
  return [
    { label: 'Open Project', href: `/@${slug}/` },
    { label: 'Buy Token', href: `/swap?project=${slug}` },
    { label: 'Farm', href: `/farms?project=${slug}` },
    { label: 'Pool', href: `/pools?project=${slug}` },
  ]
}

function poolActions(href: string): GlobalSearchAction[] {
  return [
    { label: 'View Pool', href },
    { label: 'Stake', href: href.includes('?') ? `${href}&action=stake` : `${href}?action=stake` },
  ]
}

function farmActions(href: string): GlobalSearchAction[] {
  return [
    { label: 'View Farm', href },
    { label: 'Stake', href: href.includes('?') ? `${href}&action=stake` : `${href}?action=stake` },
  ]
}

/** Static search corpus — nav, registry, venues, tokens, surfaces. */
export function buildGlobalSearchIndex(): GlobalSearchEntry[] {
  const items: GlobalSearchEntry[] = []

  shellNavigation.forEach((section) => {
    section.items.forEach((nav) => {
      if (nav.hidden || nav.disabled) return
      items.push(
        entry({
          id: `nav-${nav.id}`,
          label: nav.label,
          subtitle: section.label,
          href: nav.href,
          category: 'page',
          keywords: [nav.id, section.label, nav.href],
        }),
      )
    })
  })

  shellBottomNavItems.forEach((nav) => {
    items.push(
      entry({
        id: `bottom-nav-${nav.id}`,
        label: nav.label,
        href: nav.href,
        category: 'page',
        keywords: [nav.id, nav.href],
      }),
    )
  })

  SURFACE_MAP_RECORDS.forEach((surface) => {
    if (!surface.route) return
    items.push(
      entry({
        id: `surface-${surface.id}`,
        label: surface.label,
        subtitle: surface.humanPurpose,
        href: surface.route,
        category: 'page',
        keywords: [surface.id, surface.group, surface.agentPurpose, surface.dataSource],
      }),
    )
  })

  getAllProjects()
    .map(enrichProject)
    .forEach((project) => {
      const chainId = project.supportedChains?.[0] ?? null
      items.push(
        entry({
          id: `project-${project.slug}`,
          label: project.displayName,
          subtitle: project.tagline ?? project.description,
          href: `/@${project.slug}/`,
          category: 'project',
          chainId,
          address: null,
          verified: Boolean(
            project.trustBadges?.includes('canonical') || project.trustBadges?.includes('observed'),
          ),
          logoUrl: project.logoUrl ?? null,
          actions: projectActions(project.slug),
          keywords: [
            project.slug,
            project.searchableText,
            ...project.tickers,
            ...Object.values(project.capabilities)
              .map((c) => c.notes)
              .filter(Boolean) as string[],
          ],
        }),
      )
    })

  getAllVenues().forEach((venue) => {
    const category: GlobalSearchCategory =
      venue.venueType === 'farm' ? 'farm' : venue.venueType === 'stake_pool' ? 'pool' : 'contract'

    const href =
      venue.deepLinks?.farms ??
      venue.deepLinks?.pools ??
      venue.deepLinks?.swap ??
      (category === 'farm' ? '/farms' : category === 'pool' ? '/pools' : '/projects')

    const identityId =
      venue.contractAddress != null
        ? `${category}-${venue.chainId}-${venue.contractAddress.toLowerCase()}`
        : `venue-${venue.slug}`

    items.push(
      entry({
        id: identityId,
        label: venue.displayName,
        subtitle: venue.description,
        href,
        category,
        chainId: venue.chainId,
        address: venue.contractAddress ?? null,
        verified: venue.trust?.badges?.includes('verified') || venue.trust?.verificationStatus === 'verified',
        actions:
          category === 'farm' ? farmActions(href) : category === 'pool' ? poolActions(href) : undefined,
        keywords: [
          venue.slug,
          venue.venueType,
          venue.contractAddress ?? '',
          venue.legacyRef ?? '',
          ...venue.tags,
          ...Object.values(venue.capabilities)
            .map((c) => c.notes)
            .filter(Boolean) as string[],
        ],
        scoreBoost: venue.description.toLowerCase().includes('masterchef') ? 2 : 0,
      }),
    )

    if (venue.contractAddress) {
      items.push(
        entry({
          id: `contract-${venue.chainId}-${venue.contractAddress.toLowerCase()}`,
          label: venue.contractAddress,
          subtitle: venue.displayName,
          href,
          category: 'contract',
          chainId: venue.chainId,
          address: venue.contractAddress,
          verified: venue.trust?.badges?.includes('verified') || venue.trust?.verificationStatus === 'verified',
          keywords: [venue.slug, venue.displayName, 'masterchef', 'master chef'],
        }),
      )
    }
  })

  getAllCollectibles().forEach((collectible) => {
    const href = collectible.links?.detail ?? `/collectibles/${collectible.slug}`
    items.push(
      entry({
        id: `collectible-${collectible.slug}`,
        label: collectible.displayName,
        subtitle: collectible.description,
        href,
        category: 'collectible',
        keywords: [
          collectible.slug,
          collectible.role,
          collectible.metadata?.notes ?? '',
          collectible.contract?.label ?? '',
          'masterm',
          'master m',
        ],
        scoreBoost: collectible.slug.includes('masterm') ? 2 : 0,
      }),
    )
  })

  buildDexTokenIndex().forEach((token) => {
    const projectHref = resolveCanonicalProjectHref({
      slug: token.registryProject?.slug,
      chainId: token.chainId,
      address: token.address,
    })
    const href = projectHref
    const chainLabel =
      token.chainId === 56
        ? 'BSC'
        : token.chainId === 1
          ? 'Ethereum'
          : token.chainId === 8453
            ? 'Base'
            : token.chainId === 137
              ? 'Polygon'
              : token.chainId === 42161
                ? 'Arbitrum'
                : token.chainId === 43114
                  ? 'Avalanche'
                  : `Chain ${token.chainId}`
    items.push(
      entry({
        id: `token-${token.chainId}-${token.address.toLowerCase()}`,
        label: `${token.symbol} — ${chainLabel}`,
        subtitle: token.registryProject?.displayName ?? 'DEX token',
        href,
        category: 'token',
        chainId: token.chainId,
        address: token.address,
        logoUrl: token.logo ?? null,
        verified: Boolean(token.registryProject),
        actions: tokenActions(token.address, projectHref),
        keywords: [token.symbol, token.address, token.sources.join(' '), String(token.chainId), chainLabel],
        scoreBoost: token.chainId === 56 ? 4 : 0,
      }),
    )
  })

  items.push(
    entry({
      id: 'alias-masterchef',
      label: 'MasterChef Farms',
      subtitle: 'Legacy farm staking on Melega DEX',
      href: '/farms',
      category: 'farm',
      chainId: 56,
      address: LEGACY_BSC_MASTER_CHEF,
      actions: farmActions('/farms'),
      keywords: ['master', 'masterchef', 'master chef', 'chef', LEGACY_BSC_MASTER_CHEF],
      scoreBoost: 3,
    }),
    entry({
      id: 'alias-masterm',
      label: 'MasterM Identity',
      subtitle: 'Civilization identity collectible',
      href: '/collectibles/masterm-identity',
      category: 'collectible',
      keywords: ['master', 'masterm', 'master m', 'master builder'],
      scoreBoost: 2,
    }),
    entry({
      id: 'alias-build-studio',
      label: 'Build Studio',
      subtitle: 'Launch and build on Melega DEX',
      href: '/build-studio',
      category: 'page',
      keywords: ['master builder', 'builder', 'build', 'launch'],
    }),
  )

  return items
}
