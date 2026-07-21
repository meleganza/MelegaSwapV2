import { shellBottomNavItems, shellNavigation } from 'app-shell/config/navigation'
import { enrichProject } from 'registry/projects/discovery'
import { getAllProjects } from 'registry/projects/getAllProjects'
import { getAllCollectibles } from 'registry/collectibles/getAllCollectibles'
import { getAllVenues } from 'registry/venues/getAllVenues'
import { LEGACY_BSC_MASTER_CHEF } from 'registry/venues/constants'
import { SURFACE_MAP_RECORDS } from 'lib/surface-map/surface-map'
import { buildDexTokenIndex } from 'views/RadarStudio/radarRuntime/buildDexTokenIndex'
import type { GlobalSearchCategory, GlobalSearchEntry } from './types'

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
    ...(partial.keywords ?? []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  const { keywords: _keywords, ...rest } = partial
  return { ...rest, searchableText: haystack }
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
      items.push(
        entry({
          id: `project-${project.slug}`,
          label: project.displayName,
          subtitle: project.tagline ?? project.description,
          href: `/@${project.slug}/`,
          category: 'project',
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
      (category === 'farm' ? '/farms' : category === 'pool' ? '/pools' : '/radar')

    items.push(
      entry({
        id: `venue-${venue.slug}`,
        label: venue.displayName,
        subtitle: venue.description,
        href,
        category,
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
          id: `contract-${venue.slug}`,
          label: venue.contractAddress,
          subtitle: venue.displayName,
          href,
          category: 'contract',
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
    const href = `/trade?inputCurrency=${token.address}`
    items.push(
      entry({
        id: `token-${token.chainId}-${token.address}`,
        label: token.symbol,
        subtitle: token.registryProject?.displayName ?? 'DEX token',
        href,
        category: 'token',
        keywords: [token.address, token.sources.join(' '), String(token.chainId)],
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
