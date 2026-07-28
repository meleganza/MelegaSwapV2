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
  unavailable: 'Data unavailable',
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
  LiquidityHeroModule:
    '71a7ee43763f83d8b4f144cf7d6dd6e40777a7f3c4800b09ff070a707bfa55ab',
  LiquidityActionsModule:
    '01d5fa4364085d252eacdd59986b524dfe11da59b49a6978c216f34bfab83cec',
  LiquidityPoolDiscoveryModule:
    '3958e99d67756cac7fdeca4ca63e1593fdad7afd189ec3b6db1c49c54cce641b',
  LiquidityAddModule:
    '7ba813e525795cd713bfde53108d8fb189ca7691da454a9bef3f1a754beb8bbc',
  LiquidityMarketSnapshotModule:
    '664ba26cc5e14b374ace4c35b87b4a0c3a25147880aea771f1c33fb7738bb1fa',
  LiquidityMyPositionsModule:
    '816a5b84a10476ed5847853085eef274d75e586567573b30790550a0d71e1004',
} as const
