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
  /** Dense market browse — ~6 cards per desktop row. */
  cardW: '216px',
  cardMinH: '112px',
  cardRadius: '10px',
  cardBorder: '1px solid rgba(255,255,255,0.09)',
  cardBg: 'rgba(15,15,15,0.92)',
  cardPad: '10px',

  gold: '#F4C430',
  goldHover: '#FFD34D',
  text: '#F7F7F7',
  muted: 'rgba(255,255,255,0.66)',
  dim: 'rgba(255,255,255,0.45)',

  ctaH: '28px',
  ctaRadius: '8px',
  focusRing: '2px solid #F4C430',
  focusOffset: '2px',

  addLiquidityHref: '/add',
  chainId: 56,

  /** Visible page size — factory inventory may be larger; no invented rows. */
  pageSize: 18,
  skeletonCount: 12,
  desktopColumns: 6,

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
  cta: 'Add',
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
  LiquidityHeroModule: 'caa864ad63614015622d146437c727609e48e1348d982fa7aaaf9eaa7b42f6db',
  LiquidityActionsModule: '2ff31b501c9bd522145802e6f775c8854c767ae75bed513aef6c9b16f5b357cf',
  liquidityActionsTokens: '5e225af071869ec2b0f55fec980a57462ff1074315abf99a6c94187bddd4a3e4',
} as const
