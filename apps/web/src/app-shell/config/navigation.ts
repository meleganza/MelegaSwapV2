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
    visibleCount: 3,
    items: [
      {
        id: 'trade',
        label: 'Trade',
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
      {
        id: 'liquidity-studio',
        label: 'Liquidity Studio',
        href: '/liquidity',
        icon: 'drop',
        match: (p) => p === '/liquidity' || p.startsWith('/liquidity-studio'),
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
      {
        id: 'trending',
        label: 'Trending',
        href: '/projects?sort=trending',
        icon: 'star',
        match: (p) => p === '/projects' || p.startsWith('/projects'),
      },
      { id: 'projects', label: 'Projects', href: '/projects', icon: 'folder', match: (p) => p.startsWith('/projects') },
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
        label: 'Portfolio',
        href: '/portfolio',
        icon: 'command',
        match: (p) =>
          p === '/portfolio' ||
          p.startsWith('/portfolio/') ||
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

/** Mobile bottom rail — core DEX funnels, each reachable in one tap. */
export const shellBottomNavItems = [
  {
    id: 'home',
    label: 'Home',
    href: '/',
    icon: 'swap' as MelegaNavIcon,
    // Home owns Discover only — Swap / Project Pages must not highlight Home.
    match: (p: string) => p === '/',
  },
  {
    id: 'swap',
    label: 'Swap',
    href: '/swap',
    icon: 'swap' as MelegaNavIcon,
    match: (p: string) => p === '/swap' || p.startsWith('/swap/') || p === '/trade' || p.startsWith('/trade/'),
  },
  {
    id: 'liquidity',
    label: 'Liquidity',
    href: '/liquidity',
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
]
