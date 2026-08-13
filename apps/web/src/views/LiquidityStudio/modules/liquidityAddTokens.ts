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
  columnGap: '16px',
  mainW: '68%',
  sideW: '32%',

  cardRadius: '14px',
  cardBorder: '1px solid rgba(255,255,255,0.09)',
  cardBg: 'rgba(15,15,15,0.92)',
  cardPad: '16px',

  gold: '#F4C430',
  goldHover: '#FFD34D',
  text: '#F7F7F7',
  muted: 'rgba(255,255,255,0.66)',
  dim: 'rgba(255,255,255,0.45)',
  danger: '#F87171',

  ctaH: '44px',
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
  LiquidityHeroModule: 'a0f5c17340c453a93d91e1604be3018a2b714b32378733ab2bdfcf0854427ddf',
  LiquidityActionsModule: '98a6bf8243c57841959b6fff3d2110fd03ee9a8065de2c30f95c7d9a65c36b80',
  LiquidityPoolDiscoveryModule: '895dd9e14a4ca47a4685014ebe8a5b61a08f0faf633fad081778806054335c5c',
} as const
