import type { MelegaNavIcon } from '../icons'

export interface ShellNavItem {
  id: string
  label: string
  href: string
  icon: MelegaNavIcon
  match: (pathname: string) => boolean
  /** Gold accent for featured launch actions (e.g. Reward MARCO holders). */
  highlight?: boolean
  /** Hidden from primary nav but route may remain for legacy deep links. */
  hidden?: boolean
  /** Preparation-only — shown disabled, no navigation. */
  disabled?: boolean
  disabledReason?: string
}

export interface ShellNavSection {
  label: string
  items: ShellNavItem[]
  /** Items shown before "…"; remainder expand on click. */
  visibleCount: number
}

/** BabyMarco mint: legacy /nft/ — registry UI at /collectibles. */
export const BABYMARCO_NFT_ROUTE = '/nft/'
export const COLLECTIBLES_ROUTE = '/collectibles'

export const shellNavigation: ShellNavSection[] = [
  {
    label: 'HOME',
    visibleCount: 1,
    items: [{ id: 'overview', label: 'Overview', href: '/', icon: 'swap', match: (p) => p === '/' }],
  },
  {
    label: 'TRADE',
    visibleCount: 2,
    items: [
      {
        id: 'trade',
        label: 'Trade',
        href: '/trade',
        icon: 'swap',
        match: (p) => p === '/trade' || p.startsWith('/trade/'),
      },
      {
        id: 'liquidity-studio',
        label: 'Liquidity Studio',
        href: '/liquidity-studio',
        icon: 'drop',
        match: (p) => p.startsWith('/liquidity-studio'),
      },
    ],
  },
  {
    label: 'EARN',
    visibleCount: 2,
    items: [
      { id: 'farms', label: 'Farms', href: '/farms', icon: 'coins', match: (p) => p.startsWith('/farms') },
      { id: 'pools', label: 'Pools', href: '/pools', icon: 'coins', match: (p) => p.startsWith('/pools') },
    ],
  },
  {
    label: 'FIND',
    visibleCount: 4,
    items: [
      { id: 'trending', label: 'Trending', href: '/trending', icon: 'star', match: (p) => p === '/trending' },
      { id: 'projects', label: 'Projects', href: '/projects', icon: 'folder', match: (p) => p.startsWith('/projects') },
      { id: 'radar', label: 'Radar', href: '/radar', icon: 'brain', match: (p) => p === '/radar' },
      {
        id: 'collectibles',
        label: 'Identity Hub',
        href: COLLECTIBLES_ROUTE,
        icon: 'star',
        match: (p) => p.startsWith('/collectibles'),
      },
    ],
  },
  {
    label: 'BUILD',
    visibleCount: 1,
    items: [
      {
        id: 'build-studio',
        label: 'Build Studio',
        href: '/build-studio',
        icon: 'sparkle',
        match: (p) => p.startsWith('/build-studio'),
      },
      {
        id: 'import-existing-token',
        label: 'Import Existing Token',
        href: '/build-studio#build-import',
        icon: 'rocket',
        match: (p) => p.startsWith('/build-studio'),
      },
      {
        id: 'create-token',
        label: 'Create Token',
        href: '/build-studio',
        icon: 'rocket',
        disabled: true,
        disabledReason: 'Preparation only — page not ready',
        match: () => false,
      },
      {
        id: 'create-farm',
        label: 'Create Farm',
        href: '/build-studio',
        icon: 'coins',
        disabled: true,
        disabledReason: 'Preparation only — page not ready',
        match: () => false,
      },
      {
        id: 'create-pool',
        label: 'Create Staking Pool',
        href: '/build-studio',
        icon: 'coins',
        disabled: true,
        disabledReason: 'Preparation only — page not ready',
        match: () => false,
      },
      {
        id: 'reward',
        label: 'Reward MARCO holders',
        href: '/build-studio',
        icon: 'sparkle',
        highlight: true,
        disabled: true,
        disabledReason: 'Preparation only — module not ready',
        match: () => false,
      },
      {
        id: 'lock-liquidity',
        label: 'Lock Liquidity',
        href: '/build-studio',
        icon: 'drop',
        hidden: true,
        match: () => false,
      },
    ],
  },
  {
    label: 'OWN',
    visibleCount: 1,
    items: [
      {
        id: 'command-center',
        label: 'Command Center',
        href: '/command-center',
        icon: 'command',
        match: (p) => p === '/command-center' || p.startsWith('/command-center/'),
      },
      {
        id: 'portfolio-overview',
        label: 'Overview',
        href: '/command-center',
        icon: 'wallet',
        hidden: true,
        match: () => false,
      },
    ],
  },
]

export const shellBottomNavItems = [
  {
    id: 'home',
    label: 'Home',
    href: '/',
    icon: 'swap' as MelegaNavIcon,
    match: (p: string) => p === '/',
  },
  {
    id: 'trade',
    label: 'Trade',
    href: '/trade',
    icon: 'swap' as MelegaNavIcon,
    match: (p: string) => p === '/trade' || p.startsWith('/trade/'),
  },
  {
    id: 'earn',
    label: 'Earn',
    href: '/farms',
    icon: 'coins' as MelegaNavIcon,
    match: (p: string) => p.startsWith('/farms') || p.startsWith('/pools'),
  },
  {
    id: 'find',
    label: 'Find',
    href: '/projects',
    icon: 'star' as MelegaNavIcon,
    match: (p: string) =>
      p.startsWith('/projects') ||
      p.startsWith('/trending') ||
      p.startsWith('/radar') ||
      p.startsWith('/collectibles'),
  },
  {
    id: 'build',
    label: 'Build',
    href: '/build-studio',
    icon: 'rocket' as MelegaNavIcon,
    match: (p: string) => p.startsWith('/build-studio'),
  },
  {
    id: 'command-center',
    label: 'Command Center',
    href: '/command-center',
    icon: 'command' as MelegaNavIcon,
    match: (p: string) => p.startsWith('/command-center'),
  },
]
