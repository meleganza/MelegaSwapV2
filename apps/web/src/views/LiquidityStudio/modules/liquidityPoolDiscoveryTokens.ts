/**
 * LIQUIDITY_MODULE_003 — Pool Discovery geometry + copy contracts.
 * Discovery only. No mint / approvals / wallet writes / fake metrics.
 */

export const liquidityPoolDiscovery = {
  moduleId: '003-pool-discovery',
  architectureId: 'LIQUIDITY_ARCHITECTURE_000',
  dependsOn: '002-liquidity-actions',

  contentMax: '1376px',
  gapAfterActions: '16px',
  headerH: '64px',
  columnGap: '20px',
  rowGap: '20px',
  cardW: '445px',
  cardMinH: '196px',
  cardRadius: '14px',
  cardBorder: '1px solid rgba(255,255,255,0.09)',
  cardBg: 'rgba(15,15,15,0.92)',
  cardPad: '18px',

  gold: '#F4C430',
  goldHover: '#FFD34D',
  text: '#F7F7F7',
  muted: 'rgba(255,255,255,0.66)',
  dim: 'rgba(255,255,255,0.45)',

  ctaH: '40px',
  ctaRadius: '10px',
  focusRing: '2px solid #F4C430',
  focusOffset: '2px',

  addLiquidityHref: '/add',
  chainId: 56,

  /** Visible page size — factory inventory may be larger; no invented rows. */
  pageSize: 24,
  skeletonCount: 6,

  tabletBreak: '1199px',
  /** Below desktop content width — switch to 2 columns (tablet). */
  twoColMax: '1199px',
  mobileBreak: '767px',
  mobile390: '390px',
  mobile430: '430px',
} as const

export const LIQUIDITY_POOL_DISCOVERY_COPY = {
  title: 'Explore Pools',
  description: 'Find liquidity pools available on Melega DEX.',
  searchPlaceholder: 'Search token, pair or address',
  empty: 'No liquidity pools available.',
  unavailable: 'Pool discovery is temporarily unavailable.',
  loadingLabel: 'Loading pools…',
  metricTvl: 'TVL',
  metricVolume: 'Volume',
  metricFees: 'Fees',
  metricUnavailable: '—',
  statusActive: 'Active',
  statusUnavailable: 'Unavailable',
  cta: 'Add Liquidity',
  filters: {
    all: 'All',
    myTokens: 'My Tokens',
    popular: 'Popular',
    newest: 'Newest',
  },
  sorts: {
    market: 'Market quality',
    tvl: 'Highest TVL',
    volume: 'Highest Volume',
    newest: 'Newest',
  },
} as const

export type LiquidityDiscoveryFilter = 'all' | 'my-tokens' | 'popular' | 'newest'
export type LiquidityDiscoverySort = 'market' | 'tvl' | 'volume' | 'newest'

/** Frozen Module 001 / 002 source SHAs. */
export const LIQUIDITY_MODULE_001_002_FREEZE = {
  LiquidityHeroModule:
    '71a7ee43763f83d8b4f144cf7d6dd6e40777a7f3c4800b09ff070a707bfa55ab',
  LiquidityActionsModule:
    '01d5fa4364085d252eacdd59986b524dfe11da59b49a6978c216f34bfab83cec',
  liquidityActionsTokens:
    'f7cc179e4c8bf99d62f3a496458290e913c6d4957677fb82ff89073b9665dbda',
} as const
