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
  LiquidityHeroModule: 'caa864ad63614015622d146437c727609e48e1348d982fa7aaaf9eaa7b42f6db',
  LiquidityActionsModule: '2ff31b501c9bd522145802e6f775c8854c767ae75bed513aef6c9b16f5b357cf',
  LiquidityPoolDiscoveryModule: '6c4fe13353826b7a2dffb3f75995bd8b627a7713593e867c7d60a914c881e051',
  LiquidityAddModule: 'd657a81be28640fb36124c2159fa356f88681415ffc6d3c4fd3abd06353bc162',
} as const
