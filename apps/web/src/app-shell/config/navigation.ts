import type { MelegaNavIcon } from '../icons'

export interface ShellNavItem {
  id: string
  label: string
  href: string
  icon: MelegaNavIcon
  match: (pathname: string) => boolean
  /** Gold accent for featured launch actions (e.g. Reward MARCO holders). */
  highlight?: boolean
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
    label: 'TRADE',
    visibleCount: 2,
    items: [
      { id: 'swap', label: 'Swap', href: '/', icon: 'swap', match: (p) => p === '/' },
      {
        id: 'liquidity',
        label: 'Liquidity',
        href: '/liquidity',
        icon: 'drop',
        match: (p) => p.startsWith('/liquidity') || p.startsWith('/add') || p.startsWith('/remove'),
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
      { id: 'trending', label: 'Trending', href: '/projects', icon: 'star', match: (p) => p === '/projects' },
      { id: 'projects', label: 'Projects', href: '/projects', icon: 'folder', match: (p) => p.startsWith('/projects') },
      { id: 'radar', label: 'Radar', href: '/query', icon: 'brain', match: (p) => p.startsWith('/query') },
      {
        id: 'collectibles',
        label: 'Collectibles',
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
      { id: 'list', label: 'List Project', href: '/launch', icon: 'rocket', match: (p) => p === '/launch' },
      {
        id: 'reward',
        label: 'Reward MARCO holders',
        href: '/launch?intent=reward-marco-holders',
        icon: 'sparkle',
        highlight: true,
        match: (p) => p.includes('intent=reward-marco-holders'),
      },
      {
        id: 'create-token',
        label: 'Create Token',
        href: '/launch?intent=create-token',
        icon: 'rocket',
        match: (p) => p.includes('intent=create-token'),
      },
      {
        id: 'create-farm',
        label: 'Create Farm',
        href: '/launch?intent=create-farm',
        icon: 'coins',
        match: (p) => p.includes('intent=create-farm'),
      },
      {
        id: 'create-pool',
        label: 'Create Staking Pool',
        href: '/launch?intent=create-staking-pool',
        icon: 'coins',
        match: (p) => p.includes('intent=create-staking-pool'),
      },
      {
        id: 'lock-liquidity',
        label: 'Lock Liquidity',
        href: '/launch?intent=lock-liquidity',
        icon: 'drop',
        match: (p) => p.includes('intent=lock-liquidity'),
      },
    ],
  },
  {
    label: 'PORTFOLIO',
    visibleCount: 1,
    items: [
      { id: 'overview', label: 'Overview', href: '/workspace', icon: 'wallet', match: (p) => p === '/workspace' },
      { id: 'positions', label: 'Positions', href: '/liquidity', icon: 'wallet', match: (p) => p === '/liquidity' },
      { id: 'rewards', label: 'Rewards', href: '/farms', icon: 'wallet', match: () => false },
      { id: 'activity', label: 'Activity', href: '/workspace', icon: 'wallet', match: () => false },
    ],
  },
]

export const shellBottomNavItems = [
  { id: 'trade', label: 'Trade', href: '/', icon: 'swap' as MelegaNavIcon, match: (p: string) => p === '/' },
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
    match: (p: string) => p.startsWith('/projects') || p.startsWith('/assets') || p.startsWith('/query') || p.startsWith('/collectibles'),
  },
  { id: 'build', label: 'Build', href: '/launch', icon: 'rocket' as MelegaNavIcon, match: (p: string) => p.startsWith('/launch') || p.startsWith('/add') },
  { id: 'portfolio', label: 'Portfolio', href: '/workspace', icon: 'wallet' as MelegaNavIcon, match: (p: string) => p.startsWith('/workspace') },
]
