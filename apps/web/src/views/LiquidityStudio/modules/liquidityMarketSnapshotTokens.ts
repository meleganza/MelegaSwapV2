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
  unavailable: 'Data unavailable',
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
  LiquidityActionsModule: '63e7d544cdbc6c45bba9aa561ede46fea31caa8e4bcd530d3dc7650c233cc44b',
  LiquidityPoolDiscoveryModule: 'a150eff70692ad252c29f608b5c96f0e23791c5452265a6529b5eae45a4874dc',
  LiquidityAddModule: 'e57645b8b56c5e5530e4e7f357357656a70db39821ccade18aaffcc95a61113c',
} as const
