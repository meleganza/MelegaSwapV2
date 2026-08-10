/**
 * LIQUIDITY_MODULE_005 — Market Snapshot geometry + copy.
 * Read-only presentation. No fake TVL / volume / users / APR.
 */

export const liquidityMarketSnapshot = {
  moduleId: '005-market-snapshot',
  architectureId: 'LIQUIDITY_ARCHITECTURE_000',
  dependsOn: '004-add-liquidity',

  contentMax: '1376px',
  gapAfterAdd: '16px',
  moduleH: '220px',
  columnGap: '20px',
  cardW: '329px',
  cardH: '180px',
  cardRadius: '14px',
  cardBorder: '1px solid rgba(255,255,255,0.09)',
  cardBg: 'rgba(15,15,15,0.92)',
  cardPad: '18px',

  gold: '#F4C430',
  text: '#F7F7F7',
  muted: 'rgba(255,255,255,0.66)',
  dim: 'rgba(255,255,255,0.45)',

  tabletBreak: '1199px',
  mobileBreak: '767px',
  mobile390: '390px',
  mobile430: '430px',
} as const

export const LIQUIDITY_MARKET_SNAPSHOT_COPY = {
  title: 'Market Snapshot',
  description: 'Current state of Melega liquidity — factual ecosystem visibility only.',
  unavailable: '—',
  unavailableExplain: 'No verified source for this metric.',
  loading: 'Loading…',
  emptyMetric: '—',
  cards: {
    tvl: { label: 'Total Liquidity', source: 'Info subgraph · protocol overview' },
    activePools: { label: 'Active Pools', source: 'Factory indexer · /api/indexer/pairs' },
    volume24h: { label: '24H Volume', source: 'Info subgraph · protocol overview' },
    lpProviders: {
      label: 'Liquidity Providers',
      source: 'none',
      unavailableExplain: 'No unique liquidity-provider index is available.',
    },
  },
} as const

export type LiquiditySnapshotCardId = 'tvl' | 'activePools' | 'volume24h' | 'lpProviders'
export type LiquiditySnapshotCardState = 'loading' | 'available' | 'unavailable'

/** Frozen Modules 001–004 source SHAs. */
export const LIQUIDITY_MODULE_001_004_FREEZE = {
  LiquidityHeroModule: 'a0f5c17340c453a93d91e1604be3018a2b714b32378733ab2bdfcf0854427ddf',
  LiquidityActionsModule: '98a6bf8243c57841959b6fff3d2110fd03ee9a8065de2c30f95c7d9a65c36b80',
  LiquidityPoolDiscoveryModule: '574a3fc626f9219d5cdfa155b7daec2beffaacd8c1fd52211dac472c9ddaf2d9',
  LiquidityAddModule: '4261384e0d2d9c1ccbd289807fbf53871ca623b3a695d564d8e2b6e80d1c5b63',
} as const
