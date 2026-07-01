import type { MelegaNavIcon } from '../icons'

export interface ShellNavItem {
  id: string
  label: string
  href: string
  icon: MelegaNavIcon
  match: (pathname: string) => boolean
}

export interface ShellNavSection {
  label: string
  items: ShellNavItem[]
  /** Items shown before "More"; remainder expand on click. */
  visibleCount: number
}

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
      { id: 'identities', label: 'Digital Identities', href: '/identity/placeholder', icon: 'wallet', match: (p) => p.startsWith('/identity') },
      { id: 'collectibles', label: 'Collectibles', href: '/collectibles', icon: 'star', match: (p) => p.startsWith('/collectibles') },
    ],
  },
  {
    label: 'EARN',
    visibleCount: 2,
    items: [
      { id: 'farms', label: 'Farms', href: '/farms', icon: 'coins', match: (p) => p.startsWith('/farms') },
      { id: 'pools', label: 'Pools', href: '/pools', icon: 'coins', match: (p) => p.startsWith('/pools') },
      { id: 'staking', label: 'Staking', href: '/pools', icon: 'coins', match: () => false },
    ],
  },
  {
    label: 'FIND',
    visibleCount: 3,
    items: [
      { id: 'trending', label: 'Trending', href: '/projects', icon: 'star', match: (p) => p === '/projects' },
      { id: 'projects', label: 'Projects', href: '/projects', icon: 'folder', match: (p) => p.startsWith('/projects') },
      { id: 'radar', label: 'Radar', href: '/query', icon: 'brain', match: (p) => p.startsWith('/query') },
      { id: 'assets', label: 'Assets', href: '/assets', icon: 'folder', match: (p) => p.startsWith('/assets') },
      {
        id: 'intelligence',
        label: 'Intelligence',
        href: '/query',
        icon: 'brain',
        match: (p) => p.startsWith('/presence'),
      },
    ],
  },
  {
    label: 'BUILD',
    visibleCount: 1,
    items: [
      { id: 'list', label: 'List Project', href: '/launch', icon: 'rocket', match: (p) => p.startsWith('/launch') },
      { id: 'create-token', label: 'Create Token', href: '/launch', icon: 'rocket', match: () => false },
      { id: 'create-farm', label: 'Create Farm', href: '/farms', icon: 'coins', match: () => false },
      { id: 'create-pool', label: 'Create Staking Pool', href: '/pools', icon: 'coins', match: () => false },
      { id: 'lock-liquidity', label: 'Lock Liquidity', href: '/liquidity', icon: 'drop', match: () => false },
      { id: 'reward', label: 'Reward MARCO holders', href: '/pools', icon: 'coins', match: () => false },
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
  { id: 'earn', label: 'Earn', href: '/farms', icon: 'coins' as MelegaNavIcon, match: (p: string) => p.startsWith('/farms') || p.startsWith('/pools') },
  { id: 'find', label: 'Find', href: '/projects', icon: 'star' as MelegaNavIcon, match: (p: string) => p.startsWith('/projects') || p.startsWith('/assets') || p.startsWith('/query') },
  { id: 'build', label: 'Build', href: '/launch', icon: 'rocket' as MelegaNavIcon, match: (p: string) => p.startsWith('/launch') || p.startsWith('/add') },
  { id: 'portfolio', label: 'Portfolio', href: '/workspace', icon: 'wallet' as MelegaNavIcon, match: (p: string) => p.startsWith('/workspace') },
]
