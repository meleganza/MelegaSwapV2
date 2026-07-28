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
  LiquidityHeroModule: '52a15f6e322863598a7a61b9450f13d792184dd02ebd6679d82bb22422ff823d',
  LiquidityActionsModule: '63e7d544cdbc6c45bba9aa561ede46fea31caa8e4bcd530d3dc7650c233cc44b',
  LiquidityPoolDiscoveryModule: '222539c3eea7247a9b6044ea6c2595d49b8a641737d372e39f234e835e731110',
  LiquidityAddModule: 'e57645b8b56c5e5530e4e7f357357656a70db39821ccade18aaffcc95a61113c',
  LiquidityMarketSnapshotModule:
    '664ba26cc5e14b374ace4c35b87b4a0c3a25147880aea771f1c33fb7738bb1fa',
  LiquidityMyPositionsModule: 'adf90fe72b8422d81675b916c44aba880df5f340d5c9aec00999fff0e17ad3dc',
} as const
