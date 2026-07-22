/**
 * UX003 / DS001.2 — Global header navigation.
 * Primary labels follow the approved Project Website mockup.
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
      match: (pathname: string) => boolean
      compactHide?: boolean
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
    label: 'Farms Studio',
    href: '/farms',
    match: (p, query) => p.startsWith('/farms') && !q(query, 'view'),
  },
  {
    id: 'my-farms',
    label: 'My Farms',
    href: '/farms?view=my',
    match: (p, query) => p.startsWith('/farms') && q(query, 'view') === 'my',
  },
  {
    id: 'explore-farms',
    label: 'Explore Farms',
    href: '/farms?view=explore',
    match: (p, query) => p.startsWith('/farms') && q(query, 'view') === 'explore',
  },
]

export const POOLS_DROPDOWN_ITEMS: HeaderDropdownItem[] = [
  {
    id: 'pools-studio',
    label: 'Pools Studio',
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
    label: 'Explore Pools',
    href: '/pools?view=explore',
    match: (p, query) => p.startsWith('/pools') && q(query, 'view') === 'explore',
  },
]

/** Mockup primary “Build” menu — secondary surfaces. */
export const BUILD_DROPDOWN_ITEMS: HeaderDropdownItem[] = [
  {
    id: 'build-studio',
    label: 'Build Studio',
    href: '/build-studio',
    match: (p) => p.startsWith('/build-studio'),
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
  { id: 'trending', label: 'Trending', href: '/trending', match: (p) => p === '/trending' },
  {
    id: 'command-center',
    label: 'Command Center',
    href: '/command-center',
    match: (p) => p.startsWith('/command-center') || p.startsWith('/portfolio'),
  },
]

/** @deprecated UX003 mockup uses Build — kept for tests that reference More. */
export const MORE_DROPDOWN_ITEMS = BUILD_DROPDOWN_ITEMS

export const ANALYTICS_MORE_ITEM: HeaderDropdownItem = {
  id: 'analytics',
  label: 'Analytics',
  href: '/radar',
  match: (p) => p === '/radar',
}

export const GLOBAL_HEADER_NAV: HeaderNavItem[] = [
  {
    id: 'trade',
    label: 'Trade',
    kind: 'link',
    href: '/trade',
    match: (p) => p === '/' || p === '/trade' || p.startsWith('/trade/'),
  },
  {
    id: 'liquidity',
    label: 'Liquidity',
    kind: 'menu',
    menuWidth: 220,
    match: (p) => p.startsWith('/liquidity-studio'),
    items: LIQUIDITY_DROPDOWN_ITEMS,
  },
  {
    id: 'farms',
    label: 'Farms',
    kind: 'menu',
    menuWidth: 190,
    match: (p) => p.startsWith('/farms'),
    items: FARMS_DROPDOWN_ITEMS,
  },
  {
    id: 'pools',
    label: 'Pools',
    kind: 'menu',
    menuWidth: 190,
    match: (p) => p.startsWith('/pools'),
    items: POOLS_DROPDOWN_ITEMS,
  },
  {
    id: 'projects',
    label: 'Projects',
    kind: 'link',
    href: '/projects',
    match: (p) => p.startsWith('/projects') || p.startsWith('/project-hq') || p.startsWith('/@'),
  },
  {
    id: 'build',
    label: 'Build',
    kind: 'menu',
    menuWidth: 228,
    compactHide: true,
    match: (p) =>
      p === '/trending' ||
      p === '/radar' ||
      p.startsWith('/collectibles') ||
      p.startsWith('/nft') ||
      p === '/identity' ||
      p.startsWith('/identity/') ||
      p.startsWith('/build-studio') ||
      p.startsWith('/command-center') ||
      p.startsWith('/portfolio'),
    items: BUILD_DROPDOWN_ITEMS,
  },
]
