/**
 * LIQUIDITY_MODULE_007 — Analytics geometry + copy.
 * Read-only. No fake TVL / growth / providers / projections.
 */

export const liquidityAnalytics = {
  moduleId: '007-analytics',
  architectureId: 'LIQUIDITY_ARCHITECTURE_000',
  dependsOn: '006-your-positions',

  contentMax: '1376px',
  gapAfterPositions: '16px',
  moduleH: '240px',
  columnGap: '20px',
  cardW: '329px',
  cardH: '200px',
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

export const LIQUIDITY_ANALYTICS_COPY = {
  title: 'Liquidity Analytics',
  description: 'How Melega DEX liquidity is behaving — factual signals only.',
  unavailable: '—',
  unavailableExplain: 'No verified source for this metric.',
  loading: 'Loading…',
  emptyMetric: '—',
  cards: {
    growth: {
      label: 'Liquidity Growth',
      source: 'Info subgraph · protocol overview',
    },
    distribution: {
      label: 'Pool Distribution',
      source: 'Factory indexer · /api/indexer/pairs',
    },
    activity: {
      label: 'Liquidity Activity',
      source: 'Protocol transactions · mint / burn events',
    },
    providers: {
      label: 'Provider Activity',
      source: 'none',
      unavailableExplain: 'No unique liquidity-provider index is available.',
    },
  },
} as const

export type LiquidityAnalyticsCardId = 'growth' | 'distribution' | 'activity' | 'providers'
export type LiquidityAnalyticsCardState = 'loading' | 'available' | 'unavailable'

/** Frozen Modules 001–006 source SHAs (byte-identical). */
export const LIQUIDITY_MODULE_001_006_FREEZE = {
  LiquidityHeroModule: 'a0f5c17340c453a93d91e1604be3018a2b714b32378733ab2bdfcf0854427ddf',
  LiquidityActionsModule: '98a6bf8243c57841959b6fff3d2110fd03ee9a8065de2c30f95c7d9a65c36b80',
  LiquidityPoolDiscoveryModule: '574a3fc626f9219d5cdfa155b7daec2beffaacd8c1fd52211dac472c9ddaf2d9',
  LiquidityAddModule: '4261384e0d2d9c1ccbd289807fbf53871ca623b3a695d564d8e2b6e80d1c5b63',
  LiquidityMarketSnapshotModule: '664ba26cc5e14b374ace4c35b87b4a0c3a25147880aea771f1c33fb7738bb1fa',
  LiquidityMyPositionsModule: '35a1854f37336030e05aa33b208920b372a71983e70dc56690aabe0be1c45038',
} as const
