import { IDENTITY_HUB_NAV_LABEL } from 'registry/collectibles/identity-hub-collections.config'
import type { MelegaNavIcon } from '../icons'

export interface ShellNavItem {
  id: string
  label: string
  href: string
  icon: MelegaNavIcon
  match: (pathname: string) => boolean
  /** Gold accent for featured launch actions. */
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
export const IDENTITY_CONSOLE_ROUTE = '/identity'

export interface ShellBottomMenuItem {
  id: string
  label: string
  href: string
}

export const shellNavigation: ShellNavSection[] = [
  {
    label: 'TRADE',
    visibleCount: 2,
    items: [
      {
        id: 'swap',
        label: 'Swap',
        href: '/swap',
        icon: 'swap',
        match: (p) => p === '/swap' || p.startsWith('/swap/') || p === '/trade' || p.startsWith('/trade/'),
      },
      {
        id: 'bridge-marco',
        label: 'Bridge MARCO',
        href: '/bridge',
        icon: 'swap',
        match: (p) => p === '/bridge' || p.startsWith('/bridge/'),
      },
    ],
  },
  {
    label: 'EARN',
    visibleCount: 3,
    items: [
      { id: 'farms', label: 'Farms', href: '/farms', icon: 'coins', match: (p) => p.startsWith('/farms') },
      { id: 'pools', label: 'Pools', href: '/pools', icon: 'coins', match: (p) => p.startsWith('/pools') },
      {
        id: 'liquidity-yield',
        label: 'Liquidity Yield',
        href: '/liquidity',
        icon: 'drop',
        match: (p) => p === '/liquidity' || p.startsWith('/liquidity/') || p.startsWith('/liquidity-studio'),
      },
    ],
  },
  {
    label: 'PORTFOLIO',
    visibleCount: 1,
    items: [
      {
        id: 'portfolio',
        label: 'Portfolio',
        href: '/portfolio',
        icon: 'wallet',
        match: (p) =>
          p === '/portfolio' ||
          p.startsWith('/portfolio/') ||
          p === '/passport' ||
          p.startsWith('/passport/') ||
          p === '/command-center' ||
          p.startsWith('/command-center/'),
      },
    ],
  },
  {
    label: 'EXPLORE',
    visibleCount: 1,
    items: [
      {
        id: 'explore',
        label: 'Explore',
        href: '/projects',
        icon: 'folder',
        match: (p) => p === '/projects' || p.startsWith('/projects/') || p.startsWith('/@') || p.startsWith('/project-hq'),
      },
    ],
  },
  {
    label: 'WITHDRAW',
    visibleCount: 3,
    items: [
      {
        id: 'withdraw-lp',
        label: 'Remove liquidity',
        href: '/liquidity-studio?view=remove',
        icon: 'drop',
        match: (p) => p.startsWith('/remove') || p.startsWith('/liquidity-studio'),
      },
      {
        id: 'withdraw-farms',
        label: 'Farm positions',
        href: '/farms?view=my',
        icon: 'coins',
        match: (p) => p.startsWith('/farms'),
      },
      {
        id: 'withdraw-pools',
        label: 'Pool positions',
        href: '/pools?view=positions',
        icon: 'coins',
        match: (p) => p.startsWith('/pools'),
      },
    ],
  },
  {
    label: 'ADVANCED',
    visibleCount: 4,
    items: [
      {
        id: 'create-token',
        label: 'Create Token',
        href: '/list?intent=create-token',
        icon: 'rocket',
        match: (p) => p.startsWith('/list'),
      },
      {
        id: 'create-farm',
        label: 'Create Farm',
        href: '/farms?create=1',
        icon: 'coins',
        hidden: true,
        disabled: true,
        disabledReason: 'Create Farm is not a public action',
        match: () => false,
      },
      {
        id: 'create-pool',
        label: 'Create Pool',
        href: '/pools',
        icon: 'drop',
        hidden: true,
        disabled: true,
        disabledReason: 'Create Pool is unavailable',
        match: () => false,
      },
      {
        id: 'trend-boost',
        label: 'Trend Boost',
        href: '/list#trend-boost',
        icon: 'star',
        match: (p) => p.startsWith('/list'),
      },
      {
        id: 'fees',
        label: 'Fees & Treasury',
        href: '/pricing-fees',
        icon: 'command',
        match: (p) => p.startsWith('/pricing-fees'),
      },
      { id: 'list', label: 'List a project', href: '/list', icon: 'rocket', match: (p) => p.startsWith('/list') },
      { id: 'docs', label: 'Docs', href: '/docs', icon: 'folder', match: (p) => p.startsWith('/docs') },
      { id: 'audit', label: 'Audit', href: '/audit', icon: 'brain', match: (p) => p === '/audit' },
      {
        id: 'collectibles',
        label: IDENTITY_HUB_NAV_LABEL,
        href: COLLECTIBLES_ROUTE,
        icon: 'star',
        match: (p) => p.startsWith('/collectibles') || p.startsWith('/nft'),
      },
      {
        id: 'identity-console',
        label: 'Identity Console',
        href: IDENTITY_CONSOLE_ROUTE,
        icon: 'wallet',
        match: (p) => p === '/identity' || p.startsWith('/identity/'),
      },
    ],
  },
]

/** Routes where the trending bar would crowd the three primary actions. */
export const isQuietPrimaryRoute = (pathname: string) =>
  pathname === '/' ||
  pathname === '/swap' ||
  pathname.startsWith('/swap/') ||
  pathname === '/trade' ||
  pathname.startsWith('/trade/') ||
  pathname === '/bridge' ||
  pathname.startsWith('/bridge/') ||
  pathname === '/earn' ||
  pathname.startsWith('/earn/')

/** Phone actions — one tap each. Portfolio and Tools are not in this rail. */
export const shellBottomNavItems: Array<{
  id: string
  label: string
  href: string
  icon: MelegaNavIcon
  match: (pathname: string) => boolean
  menu?: ShellBottomMenuItem[]
}> = [
  {
    id: 'swap',
    label: 'Swap',
    href: '/',
    icon: 'swap',
    match: (p) => p === '/' || p === '/swap' || p.startsWith('/swap/') || p === '/trade' || p.startsWith('/trade/'),
  },
  {
    id: 'bridge',
    label: 'Bridge',
    href: '/bridge',
    icon: 'swap',
    match: (p) => p === '/bridge' || p.startsWith('/bridge/'),
  },
  {
    id: 'earn',
    label: 'Earn',
    href: '/earn',
    icon: 'coins',
    match: (p) =>
      p === '/earn' ||
      p.startsWith('/earn/') ||
      p.startsWith('/farms') ||
      p.startsWith('/pools') ||
      p === '/liquidity' ||
      p.startsWith('/liquidity-studio'),
  },
]
