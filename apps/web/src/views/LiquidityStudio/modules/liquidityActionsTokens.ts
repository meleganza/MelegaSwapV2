/**
 * LIQUIDITY_MODULE_002 — primary workspace geometry (IA redesign).
 * Hosts expanded Add Liquidity + AI Builder surfaces. No new execution logic.
 */

export const liquidityActions = {
  moduleId: '002-liquidity-actions',
  architectureId: 'LIQUIDITY_ARCHITECTURE_000',
  dependsOn: '001-hero',

  contentMax: '1376px',
  gapAfterHero: '16px',
  columnGap: '24px',
  cardW: '100%',
  cardMinH: '520px',
  cardRadius: '14px',
  cardBorder: '1px solid rgba(255,255,255,0.09)',
  cardBg: 'rgba(15,15,15,0.92)',
  cardPad: '16px',


  titleSize: '22px',
  titleLine: '28px',
  titleWeight: 750,
  titleColor: '#F7F7F7',

  descSize: '14px',
  descLine: '20px',
  descColor: 'rgba(255,255,255,0.66)',

  stepSize: '13px',
  stepLine: '18px',
  stepColor: 'rgba(255,255,255,0.72)',
  stepMuted: 'rgba(255,255,255,0.38)',

  gold: '#F4C430',
  goldHover: '#FFD34D',
  ctaH: '44px',
  ctaRadius: '10px',
  ctaPadX: '20px',
  focusRing: '2px solid #F4C430',
  focusOffset: '2px',

  /** Manual journey — existing Add Liquidity route. Module 004 owns the form later. */
  manualHref: '/add',

  /**
   * AI Builder journey entry. Navigation only.
   * When false, UI shows an honest unavailable state (no fabricated readiness).
   */
  aiBuilderAvailable: true,
  aiBuilderHref: '/liquidity-studio',

  tabletBreak: '1199px',
  /** Two columns while width allows ~676+24+676; collapse earlier for comfort. */
  twoColMin: '900px',
  mobileBreak: '767px',
  mobile390: '390px',
  mobile430: '430px',
} as const

export const LIQUIDITY_ACTIONS_COPY = {
  sectionLabel: 'Provide liquidity',
  manual: {
    id: 'manual',
    title: 'Add Liquidity',
    description: 'Provide liquidity immediately — form expanded.',
    steps: ['Select Pool', 'Deposit Pair', 'Receive LP Tokens'] as const,
    cta: 'Add Liquidity',
  },
  aiBuilder: {
    id: 'ai-builder',
    title: 'AI Liquidity Builder',
    description: 'Build liquidity with budget, strategy, and plan — form expanded.',
    steps: ['Choose Token', 'Set Budget', 'Select Strategy', 'Liquidity Growth'] as const,
    cta: 'Create Plan',
    unavailableTitle: 'Currently unavailable',
    unavailableBody:
      'Create Liquidity Plan opens when Melega AI Liquidity Builder is activated. No simulated plans or fake availability.',
  },
} as const

/** Frozen Module 001 source SHAs (byte-identical expected). */
export const LIQUIDITY_MODULE_001_FREEZE = {
  LiquidityHeroModule: 'a0f5c17340c453a93d91e1604be3018a2b714b32378733ab2bdfcf0854427ddf',
  liquidityHeroTokens: '1ea3821c2671f9517679cdb6cd49492bc96aa334c9a492c00cc84377b84de038',
} as const
