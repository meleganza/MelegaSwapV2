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
  LiquidityHeroModule:
    '71a7ee43763f83d8b4f144cf7d6dd6e40777a7f3c4800b09ff070a707bfa55ab',
  LiquidityActionsModule:
    '01d5fa4364085d252eacdd59986b524dfe11da59b49a6978c216f34bfab83cec',
  LiquidityPoolDiscoveryModule:
    '3958e99d67756cac7fdeca4ca63e1593fdad7afd189ec3b6db1c49c54cce641b',
  LiquidityAddModule:
    '0c63599e74b72592f54547c9a1e45d835c55eedfd770b46d27d7f963c864b5f0',
} as const
