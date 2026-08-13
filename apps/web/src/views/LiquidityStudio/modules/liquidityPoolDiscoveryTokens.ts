/**
 * LIQUIDITY_MODULE_003 — Pool Discovery geometry + copy contracts.
 * Discovery only. No mint / approvals / wallet writes / fake metrics.
 */

export const liquidityPoolDiscovery = {
  moduleId: '003-pool-discovery',
  architectureId: 'LIQUIDITY_ARCHITECTURE_000',
  dependsOn: '002-liquidity-actions',

  contentMax: '1376px',
  gapAfterActions: '20px',
  headerH: '48px',
  columnGap: '12px',
  rowGap: '12px',
  /** Dense market browse — readable card footprint. */
  cardW: '100%',
  cardMinH: '188px',
  cardRadius: '10px',
  cardBorder: '1px solid rgba(255,255,255,0.09)',
  cardBg: 'rgba(15,15,15,0.92)',
  cardPad: '14px',

  gold: '#F4C430',
  goldHover: '#FFD34D',
  text: '#F7F7F7',
  muted: 'rgba(255,255,255,0.66)',
  dim: 'rgba(255,255,255,0.45)',

  ctaH: '40px',
  ctaRadius: '8px',
  focusRing: '2px solid #F4C430',
  focusOffset: '2px',

  addLiquidityHref: '/add',
  chainId: 56,

  /** Visible page size — factory inventory may be larger; no invented rows. */
  pageSize: 10,
  skeletonCount: 12,
  /** 5 cols ≥1440 content; 6 at 1920 when readable. */
  desktopColumns: 5,
  wideColumns: 6,

  tabletBreak: '1199px',
  /** ~1024 — 3 columns. */
  threeColMax: '1199px',
  twoColMax: '767px',
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
  metricVolume: '24H Volume',
  metricFees: 'Fees',
  metricUnavailable: '—',
  statusActive: 'Active',
  statusUnavailable: 'Unavailable',
  cta: 'Add Liquidity',
  filters: {
    all: 'All',
  },
  sorts: {
    tvl: 'Sort by liquidity',
  },
} as const

export type LiquidityDiscoveryFilter = 'all' | 'my-tokens' | 'popular' | 'newest'
export type LiquidityDiscoverySort = 'market' | 'tvl' | 'volume' | 'newest'

/** Frozen Module 001 / 002 source SHAs. */
export const LIQUIDITY_MODULE_001_002_FREEZE = {
  LiquidityHeroModule: 'a0f5c17340c453a93d91e1604be3018a2b714b32378733ab2bdfcf0854427ddf',
  LiquidityActionsModule: '98a6bf8243c57841959b6fff3d2110fd03ee9a8065de2c30f95c7d9a65c36b80',
  liquidityActionsTokens: '2913c12cc629f7eda2ca85ac1762ab5a760eedec6c09a7c776833b86b7fd6c54',
} as const
