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
  LiquidityHeroModule: '52a15f6e322863598a7a61b9450f13d792184dd02ebd6679d82bb22422ff823d',
  LiquidityActionsModule: '63e7d544cdbc6c45bba9aa561ede46fea31caa8e4bcd530d3dc7650c233cc44b',
  LiquidityPoolDiscoveryModule: '222539c3eea7247a9b6044ea6c2595d49b8a641737d372e39f234e835e731110',
  LiquidityMarketSnapshotModule:
    '664ba26cc5e14b374ace4c35b87b4a0c3a25147880aea771f1c33fb7738bb1fa',
} as const
