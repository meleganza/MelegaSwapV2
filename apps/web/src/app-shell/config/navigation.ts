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
      { id: 'radar', label: 'DEX Intelligence', href: '/radar', icon: 'brain', match: (p) => p === '/radar' },
      {
        id: 'collectibles',
        label: 'Identity Hub',
        href: COLLECTIBLES_ROUTE,
        icon: 'star',
        match: (p) => p.startsWith('/collectibles') || p.startsWith('/nft'),
      },
    ],
  },
  {
    label: 'BUILD',
    visibleCount: 2,
    items: [
      {
        id: 'build-studio',
        label: 'Build Studio',
        href: '/build-studio',
        icon: 'sparkle',
        match: (p) => p.startsWith('/build-studio'),
      },
      {
        id: 'list',
        label: 'Import Existing Token',
        href: '/import-existing-token',
        icon: 'rocket',
        hidden: true,
        match: (p) => p === '/import-existing-token' || p === '/launch',
      },
      {
        id: 'reward',
        label: 'Reward MARCO holders',
        href: '/launch?intent=reward-marco-holders',
        icon: 'sparkle',
        highlight: true,
        disabled: true,
        disabledReason: 'Preparation only — module not ready',
        match: (p) => p.includes('intent=reward-marco-holders'),
      },
      {
        id: 'create-token',
        label: 'Create Token',
        href: '/launch?intent=create-token',
        icon: 'rocket',
        disabled: true,
        disabledReason: 'Preparation only — page not ready',
        match: (p) => p.includes('intent=create-token'),
      },
      {
        id: 'create-farm',
        label: 'Create Farm',
        href: '/launch?intent=create-farm',
        icon: 'coins',
        disabled: true,
        disabledReason: 'Preparation only — page not ready',
        match: (p) => p.includes('intent=create-farm'),
      },
      {
        id: 'create-pool',
        label: 'Create Staking Pool',
        href: '/launch?intent=create-staking-pool',
        icon: 'coins',
        disabled: true,
        disabledReason: 'Preparation only — page not ready',
        match: (p) => p.includes('intent=create-staking-pool'),
      },
      {
        id: 'lock-liquidity',
        label: 'Lock Liquidity',
        href: '/launch?intent=lock-liquidity',
        icon: 'drop',
        disabled: true,
        disabledReason: 'Not available — functionality pending',
        match: (p) => p.includes('intent=lock-liquidity'),
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
        href: '/portfolio',
        icon: 'wallet',
        hidden: true,
        match: (p) => p === '/portfolio' || p.startsWith('/portfolio/'),
      },
    ],
  },
]

export const shellBottomNavItems = [
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
      p.startsWith('/assets') ||
      p.startsWith('/radar') ||
      p.startsWith('/query') ||
      p.startsWith('/collectibles'),
  },
  {
    id: 'build',
    label: 'Build',
    href: '/build-studio',
    icon: 'rocket' as MelegaNavIcon,
    match: (p: string) =>
      p.startsWith('/build-studio') ||
      p.startsWith('/launch') ||
      p.startsWith('/import-existing-token') ||
      p.startsWith('/add'),
  },
  {
    id: 'command-center',
    label: 'Command Center',
    href: '/command-center',
    icon: 'command' as MelegaNavIcon,
    match: (p: string) =>
      p.startsWith('/command-center') || p.startsWith('/portfolio') || p.startsWith('/workspace'),
  },
]
