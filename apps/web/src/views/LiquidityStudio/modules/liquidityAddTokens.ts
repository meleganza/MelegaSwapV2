/**
 * LIQUIDITY_MODULE_004 — Add Liquidity geometry + copy contracts.
 * UI shell only. Execution stays in liquidityRuntime mint host.
 */

export const liquidityAdd = {
  moduleId: '004-add-liquidity',
  architectureId: 'LIQUIDITY_ARCHITECTURE_000',
  dependsOn: '003-pool-discovery',

  contentMax: '1376px',
  gapAfterDiscovery: '16px',
  columnGap: '24px',
  mainW: '900px',
  sideW: '424px',

  cardRadius: '14px',
  cardBorder: '1px solid rgba(255,255,255,0.09)',
  cardBg: 'rgba(15,15,15,0.92)',
  cardPad: '24px',

  gold: '#F4C430',
  goldHover: '#FFD34D',
  text: '#F7F7F7',
  muted: 'rgba(255,255,255,0.66)',
  dim: 'rgba(255,255,255,0.45)',
  danger: '#F87171',

  ctaH: '48px',
  ctaRadius: '10px',
  focusRing: '2px solid #F4C430',
  focusOffset: '2px',
  chainId: 56,

  /** Anchor id for in-page navigation. */
  anchorId: 'add-liquidity',

  tabletBreak: '1199px',
  mobileBreak: '767px',
  mobile390: '390px',
  mobile430: '430px',
} as const

export const LIQUIDITY_ADD_COPY = {
  title: 'Add Liquidity',
  description: 'Select a pair, enter amounts, approve tokens, and add liquidity. You confirm every wallet transaction.',
  tokenA: 'Token A',
  tokenB: 'Token B',
  amount: 'Amount',
  balance: 'Balance',
  poolRatio: 'Pool ratio',
  estimatedLp: 'Estimated LP received',
  poolShare: 'Pool share',
  slippage: 'Slippage',
  previewTitle: 'Position Preview',
  previewPair: 'Pair',
  previewDeposited: 'Deposited assets',
  previewLp: 'LP tokens received',
  previewShare: 'Share after deposit',
  previewFee: 'Fee tier',
  emptyMetric: '—',
  skeletonLabel: 'Loading add liquidity…',
  securityNote: 'Non-custodial. You confirm every transaction in your wallet.',
} as const

export type LiquidityAddCtaState =
  | 'connect'
  | 'approve-a'
  | 'approve-b'
  | 'confirming'
  | 'add'
  | 'completed'
  | 'insufficient'
  | 'unavailable'
  | 'wrong-chain'
  | 'failed'

/** Frozen Modules 001–003 source SHAs. */
export const LIQUIDITY_MODULE_001_003_FREEZE = {
  LiquidityHeroModule: '52a15f6e322863598a7a61b9450f13d792184dd02ebd6679d82bb22422ff823d',
  LiquidityActionsModule: '63e7d544cdbc6c45bba9aa561ede46fea31caa8e4bcd530d3dc7650c233cc44b',
  LiquidityPoolDiscoveryModule: '222539c3eea7247a9b6044ea6c2595d49b8a641737d372e39f234e835e731110',
} as const
