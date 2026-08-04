import type { MelegaNavIcon } from '../icons'
import { IDENTITY_HUB_NAV_LABEL } from 'registry/collectibles/identity-hub-collections.config'

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
    visibleCount: 5,
    items: [
      { id: 'trending', label: 'Trending', href: '/trending', icon: 'star', match: (p) => p === '/trending' },
      { id: 'projects', label: 'Projects', href: '/projects', icon: 'folder', match: (p) => p.startsWith('/projects') },
      { id: 'radar', label: 'DEX Intelligence', href: '/radar', icon: 'brain', match: (p) => p === '/radar' },
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
        id: 'list',
        label: 'Import Existing Token',
        href: '/import-existing-token',
        icon: 'rocket',
        hidden: true,
        match: (p) => p === '/import-existing-token' || p === '/launch',
      },
    ],
  },
  {
    label: 'OWN',
    visibleCount: 1,
    items: [
      {
        id: 'command-center',
        label: 'Passport',
        href: '/passport',
        icon: 'command',
        match: (p) =>
          p === '/passport' ||
          p.startsWith('/passport/') ||
          p === '/command-center' ||
          p.startsWith('/command-center/'),
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

/** Mobile bottom rail — Home · Liquidity · Farms · Pools · Passport */
export const shellBottomNavItems = [
  {
    id: 'home',
    label: 'Home',
    href: '/',
    icon: 'swap' as MelegaNavIcon,
    // Align with header: Home owns Discover + Trade; Project Pages under Discover.
    match: (p: string) =>
      p === '/' ||
      p === '/trade' ||
      p.startsWith('/trade/') ||
      p === '/swap' ||
      p.startsWith('/swap/') ||
      p.startsWith('/project-hq') ||
      p.startsWith('/@'),
  },
  {
    id: 'liquidity',
    label: 'Liquidity',
    href: '/liquidity-studio',
    icon: 'drop' as MelegaNavIcon,
    match: (p: string) => p.startsWith('/liquidity-studio') || p === '/liquidity',
  },
  {
    id: 'farms',
    label: 'Farms',
    href: '/farms',
    icon: 'coins' as MelegaNavIcon,
    match: (p: string) => p.startsWith('/farms'),
  },
  {
    id: 'pools',
    label: 'Pools',
    href: '/pools',
    icon: 'coins' as MelegaNavIcon,
    match: (p: string) => p.startsWith('/pools'),
  },
  {
    id: 'passport',
    label: 'Passport',
    href: '/passport',
    icon: 'command' as MelegaNavIcon,
    match: (p: string) =>
      p.startsWith('/passport') ||
      p.startsWith('/command-center') ||
      p.startsWith('/portfolio') ||
      p.startsWith('/workspace'),
  },
]
