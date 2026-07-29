/**
 * LIQUIDITY_MODULE_006 — My Positions geometry + copy.
 * Wallet LP positions only. Reuses liquidityRuntime — no second indexer.
 */

export const liquidityMyPositions = {
  moduleId: '006-your-positions',
  architectureId: 'LIQUIDITY_ARCHITECTURE_000',
  dependsOn: '005-market-snapshot',

  contentMax: '1376px',
  gapAfterSnapshot: '20px',
  /** IA: My Positions follows primary workspace (Actions), not Market Snapshot. */
  gapAfterActions: '20px',
  columnGap: '16px',
  mainW: '1376px',

  cardRadius: '14px',
  cardBorder: '1px solid rgba(255,255,255,0.09)',
  cardBg: 'rgba(15,15,15,0.92)',
  cardPad: '18px',
  cardMinH: '168px',

  gold: '#F4C430',
  goldHover: '#FFD34D',
  text: '#F7F7F7',
  muted: 'rgba(255,255,255,0.66)',
  dim: 'rgba(255,255,255,0.45)',

  ctaH: '40px',
  ctaRadius: '10px',
  chainId: 56,
  explorePoolsHref: '#liquidity-pool-discovery-title',
  addAnchor: '#add-liquidity',

  tabletBreak: '1199px',
  mobileBreak: '767px',
  mobile390: '390px',
  mobile430: '430px',
} as const

export const LIQUIDITY_MY_POSITIONS_COPY = {
  title: 'My Positions',
  description: 'Liquidity positions belonging to your connected wallet.',
  emptyConnected: 'No liquidity positions yet.',
  emptyDisconnected: 'Connect wallet to view positions.',
  explorePools: 'Explore Pools',
  connect: 'Connect Wallet',
  lpBalance: 'LP balance',
  positionValue: 'Position value',
  poolShare: 'Pool share',
  feesEarned: 'Fees earned',
  status: 'Status',
  manage: 'Manage',
  remove: 'Remove Liquidity',
  emptyMetric: '—',
  statusActive: 'ACTIVE',
  statusUnavailable: 'UNAVAILABLE',
  statusPartial: 'PARTIAL',
} as const

export type LiquidityPositionStatus = 'ACTIVE' | 'UNAVAILABLE' | 'PARTIAL'

/** Frozen Modules 001–003 + 005. Module 004 Add is provider-hoist only (new SHA). */
export const LIQUIDITY_MODULE_001_005_FREEZE = {
  LiquidityHeroModule: 'a0f5c17340c453a93d91e1604be3018a2b714b32378733ab2bdfcf0854427ddf',
  LiquidityActionsModule: 'e4026979e1dfe49150b26ef6e8f3a5d36ef4c0745a803e2452721b6871ae5462',
  LiquidityPoolDiscoveryModule: '574a3fc626f9219d5cdfa155b7daec2beffaacd8c1fd52211dac472c9ddaf2d9',
  LiquidityMarketSnapshotModule:
    '664ba26cc5e14b374ace4c35b87b4a0c3a25147880aea771f1c33fb7738bb1fa',
} as const
