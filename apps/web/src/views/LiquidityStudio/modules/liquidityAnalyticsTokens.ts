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
  LiquidityHeroModule: 'caa864ad63614015622d146437c727609e48e1348d982fa7aaaf9eaa7b42f6db',
  LiquidityActionsModule: '2ff31b501c9bd522145802e6f775c8854c767ae75bed513aef6c9b16f5b357cf',
  LiquidityPoolDiscoveryModule: '6c4fe13353826b7a2dffb3f75995bd8b627a7713593e867c7d60a914c881e051',
  LiquidityAddModule: 'd657a81be28640fb36124c2159fa356f88681415ffc6d3c4fd3abd06353bc162',
  LiquidityMarketSnapshotModule:
    '664ba26cc5e14b374ace4c35b87b4a0c3a25147880aea771f1c33fb7738bb1fa',
  LiquidityMyPositionsModule: 'dd84879a02980bf0bf8da0f7ab7e1443ec695e5d2f39db33963196456926c80f',
} as const
