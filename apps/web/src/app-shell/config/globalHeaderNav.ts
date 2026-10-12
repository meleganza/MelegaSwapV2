/**
 * Public navigation is four destinations: Trade, Earn, Portfolio, Explore.
 * Trade opens Swap. Earn groups Farms, Pools, and Liquidity Yield.
 * Technical and commercial tools live in the Advanced Console, outside this list.
 */
import { COLLECTIBLES_ROUTE, IDENTITY_CONSOLE_ROUTE } from './navigation'

export type HeaderDropdownItem = {
  id: string
  label: string
  href: string
  badge?: 'NEW'
  match?: (pathname: string, query: Record<string, string | string[] | undefined>) => boolean
}

export type HeaderNavItem =
  | {
      id: string
      label: string
      kind: 'link'
      href: string
      badge?: 'NEW'
      match: (pathname: string) => boolean
      compactHide?: boolean
      /** Grouped destinations. The label still navigates to `href`. */
      items?: HeaderDropdownItem[]
      menuWidth?: number
    }
  | {
      id: string
      label: string
      kind: 'menu'
      match: (pathname: string) => boolean
      menuWidth: number
      items: HeaderDropdownItem[]
      compactHide?: boolean
    }

const q = (query: Record<string, string | string[] | undefined>, key: string) => {
  const v = query[key]
  return Array.isArray(v) ? v[0] : v
}

/** Deep-link destinations retained for Liquidity Studio (not primary dropdown). */
export const LIQUIDITY_DROPDOWN_ITEMS: HeaderDropdownItem[] = [
  {
    id: 'liquidity-studio',
    label: 'Liquidity Studio',
    href: '/liquidity-studio',
    match: (p, query) => p.startsWith('/liquidity-studio') && !q(query, 'view'),
  },
  {
    id: 'add-liquidity',
    label: 'Add Liquidity',
    href: '/liquidity-studio?view=add',
    match: (p, query) => p.startsWith('/liquidity-studio') && q(query, 'view') === 'add',
  },
  {
    id: 'liquidity-building',
    label: 'Liquidity Building',
    href: '/liquidity-studio?view=building',
    badge: 'NEW',
    match: (p, query) => p.startsWith('/liquidity-studio') && q(query, 'view') === 'building',
  },
  {
    id: 'my-positions',
    label: 'My Positions',
    href: '/liquidity-studio?view=positions',
    match: (p, query) => p.startsWith('/liquidity-studio') && q(query, 'view') === 'positions',
  },
  {
    id: 'remove-liquidity',
    label: 'Remove Liquidity',
    href: '/liquidity-studio?view=remove',
    match: (p, query) => p.startsWith('/liquidity-studio') && q(query, 'view') === 'remove',
  },
  {
    id: 'simulation',
    label: 'Simulation',
    href: '/liquidity-studio?view=simulation',
    match: (p, query) => p.startsWith('/liquidity-studio') && q(query, 'view') === 'simulation',
  },
]

export const FARMS_DROPDOWN_ITEMS: HeaderDropdownItem[] = [
  {
    id: 'farms-studio',
    label: 'Farms',
    href: '/farms',
    match: (p, query) => p.startsWith('/farms') && !q(query, 'view'),
  },
  {
    id: 'my-farms',
    label: 'My Positions',
    href: '/farms?view=my',
    match: (p, query) => p.startsWith('/farms') && q(query, 'view') === 'my',
  },
  {
    id: 'explore-farms',
    label: 'All Farms',
    href: '/farms?view=explore',
    match: (p, query) => p.startsWith('/farms') && q(query, 'view') === 'explore',
  },
]

export const POOLS_DROPDOWN_ITEMS: HeaderDropdownItem[] = [
  {
    id: 'pools-studio',
    label: 'Pools',
    href: '/pools',
    match: (p, query) => p.startsWith('/pools') && !q(query, 'view'),
  },
  {
    id: 'pools-positions',
    label: 'My Positions',
    href: '/pools?view=positions',
    match: (p, query) => p.startsWith('/pools') && q(query, 'view') === 'positions',
  },
  {
    id: 'explore-pools',
    label: 'All Pools',
    href: '/pools?view=explore',
    match: (p, query) => p.startsWith('/pools') && q(query, 'view') === 'explore',
  },
]

/** Secondary surfaces — available via search / deep links, not primary nav. */
export const MORE_DROPDOWN_ITEMS: HeaderDropdownItem[] = [
  {
    id: 'trending',
    label: 'Trending Projects',
    href: '/projects?sort=trending',
    match: (p) => p === '/projects' || p.startsWith('/projects'),
  },
  { id: 'radar', label: 'DEX Intelligence', href: '/radar', match: (p) => p === '/radar' },
  {
    id: 'collectibles',
    label: 'Identity Hub',
    href: COLLECTIBLES_ROUTE,
    match: (p) => p.startsWith('/collectibles') || p.startsWith('/nft'),
  },
  {
    id: 'identity-console',
    label: 'Identity Console',
    href: IDENTITY_CONSOLE_ROUTE,
    match: (p) => p === '/identity' || p.startsWith('/identity/'),
  },
  {
    id: 'build-studio',
    label: 'Build Studio',
    href: '/build-studio',
    match: (p) => p.startsWith('/build-studio'),
  },
]

export const ANALYTICS_MORE_ITEM: HeaderDropdownItem = {
  id: 'analytics',
  label: 'Analytics',
  href: '/radar',
  match: (p) => p === '/radar',
}

const isTradePath = (p: string) =>
  p === '/swap' || p.startsWith('/swap/') || p === '/trade' || p.startsWith('/trade/') || p === '/bridge' || p.startsWith('/bridge/')

const isEarnPath = (p: string) =>
  p.startsWith('/farms') || p.startsWith('/pools') || p === '/liquidity' || p.startsWith('/liquidity/') || p.startsWith('/liquidity-studio')

const isPortfolioPath = (p: string) =>
  p === '/portfolio' ||
  p.startsWith('/portfolio/') ||
  p === '/passport' ||
  p.startsWith('/passport/') ||
  p === '/command-center' ||
  p.startsWith('/command-center/')

const isExplorePath = (p: string) =>
  p === '/projects' ||
  p.startsWith('/projects/') ||
  p === '/explore' ||
  p.startsWith('/explore/') ||
  p.startsWith('/@') ||
  p.startsWith('/project-hq')

/** Public primary navigation — maximum four. */
export const GLOBAL_HEADER_NAV: HeaderNavItem[] = [
  {
    id: 'trade',
    label: 'Trade',
    kind: 'link',
    href: '/swap',
    menuWidth: 220,
    match: isTradePath,
    items: [
      {
        id: 'swap',
        label: 'Swap',
        href: '/swap',
        match: (p) => p === '/swap' || p.startsWith('/swap/') || p === '/trade' || p.startsWith('/trade/'),
      },
      {
        id: 'bridge-marco',
        label: 'Bridge MARCO',
        href: '/bridge',
        match: (p) => p === '/bridge' || p.startsWith('/bridge/'),
      },
    ],
  },
  {
    id: 'earn',
    label: 'Earn',
    kind: 'link',
    href: '/farms',
    menuWidth: 240,
    match: isEarnPath,
    items: [
      { id: 'farms', label: 'Farms', href: '/farms', match: (p) => p.startsWith('/farms') },
      { id: 'pools', label: 'Pools', href: '/pools', match: (p) => p.startsWith('/pools') },
      {
        id: 'liquidity-yield',
        label: 'Liquidity Yield',
        href: '/liquidity',
        match: (p) => p === '/liquidity' || p.startsWith('/liquidity/') || p.startsWith('/liquidity-studio'),
      },
    ],
  },
  {
    id: 'portfolio',
    label: 'Portfolio',
    kind: 'link',
    href: '/portfolio',
    match: isPortfolioPath,
  },
  {
    id: 'explore',
    label: 'Explore',
    kind: 'link',
    href: '/projects',
    match: isExplorePath,
  },
]
