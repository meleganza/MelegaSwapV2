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
  cardMinH: '158px',
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
  pageSize: 18,
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
  LiquidityHeroModule: '52a15f6e322863598a7a61b9450f13d792184dd02ebd6679d82bb22422ff823d',
  LiquidityActionsModule: '63e7d544cdbc6c45bba9aa561ede46fea31caa8e4bcd530d3dc7650c233cc44b',
  liquidityActionsTokens: '492fc8041d088721054d8b80f5ed39bf2dd9bd28a879fe1275437f6270fc38d2',
} as const
