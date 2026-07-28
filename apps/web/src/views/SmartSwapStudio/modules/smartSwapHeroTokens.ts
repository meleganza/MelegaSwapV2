/**
 * SMART_SWAP_MODULE_001 — Hero geometry + copy contracts.
 * No wallet / Router / quotes / liquidity / Treasury / KERL runtime.
 * No fake prices, fees, savings, yield rates, or balances.
 */

export const smartSwapHero = {
  moduleId: '001-hero',
  moduleCode: 'SMART_SWAP_MODULE_001_HERO',
  architectureId: 'SMART_SWAP_ARCHITECTURE_000',

  contentMax: '1376px',
  heroW: '1376px',
  heroH: '260px',

  leftW: '440px',
  artworkW: '480px',
  trustW: '360px',
  columnGap: '48px',

  artworkBoxW: '480px',
  artworkBoxH: '230px',
  trustBoxW: '360px',
  trustBoxH: '230px',
  trustRadius: '14px',
  trustBorder: '1px solid rgba(255,255,255,0.09)',
  trustBg: 'rgba(15,15,15,0.92)',
  trustPad: '20px',

  titleSize: '52px',
  titleLine: '58px',
  titleWeight: 800,
  titleTracking: '-0.03em',
  titleColor: '#F7F7F7',

  descSize: '16px',
  descLine: '24px',
  descColor: 'rgba(255,255,255,0.66)',
  descMaxW: '400px',
  gapAfterTitle: '14px',
  gapBeforeActions: '20px',
  gapAfterActions: '14px',

  relationSize: '13px',
  relationLine: '18px',
  relationColor: 'rgba(255,255,255,0.52)',

  primaryCtaW: '176px',
  primaryCtaH: '44px',
  secondaryCtaW: '148px',
  secondaryCtaH: '44px',
  ctaRadius: '10px',
  ctaGap: '12px',

  gold: '#F4C430',
  goldHover: '#FFD34D',
  focusRing: '2px solid #F4C430',
  focusOffset: '2px',

  /** Scroll to on-page Swap cockpit (same engine — Smart mode is selected via Instant|Smart tabs only). */
  startSmartSwapHref: '#smart-swap-execution',
  /** Factual How It Works panel already exists on Trade terminal. */
  howItWorksHref: '#smart-swap-how-it-works',
  howItWorksRendered: true,

  mobileTitleSize: '40px',
  mobileTitleLine: '44px',
  mobileArtworkMaxW: '326px',
  mobileArtworkMaxH: '190px',
  mobileTrustW: '326px',
  mobileContentW: '358px',
  mobile430ContentW: '398px',
  mobileHeroMaxH: '720px',

  tabletBreak: '1199px',
  mobileBreak: '767px',
} as const

export const SMART_SWAP_HERO_COPY = {
  title: 'Smart Swap',
  description:
    'Find better execution routes with transparent pricing, liquidity paths and\nexecution details.',
  primaryCta: 'Go to Swap',
  secondaryCta: 'How It Works',
  relationship:
    'Instant and Smart are modes over the same Melega DEX swap engine — pick a mode in the Swap terminal tabs.',
  trustTitle: 'Why Smart Swap?',
  trustItems: [
    {
      id: 'route-visibility',
      title: 'Better Route Visibility',
      body: 'See the liquidity path behind a quote before you confirm.',
    },
    {
      id: 'transparent-fees',
      title: 'Transparent Fees',
      body: 'Fee principles stay visible — Smart Swap does not invent fee values.',
    },
    {
      id: 'execution-confidence',
      title: 'Execution Confidence',
      body: 'Review impact and route context so confirmation stays informed.',
    },
    {
      id: 'non-custodial',
      title: 'Non-Custodial Trading',
      body: 'Swaps stay wallet-signed through Melega DEX Router contracts.',
    },
  ],
} as const

/** Forbidden product claims — never ship these strings in Module 001 UI/copy. */
export const SMART_SWAP_HERO_FORBIDDEN_CLAIMS = [
  'Best price guaranteed',
  'Zero slippage',
  'Risk free',
  'Guaranteed savings',
  'best price guaranteed',
  'zero slippage',
  'risk-free',
  'guaranteed savings',
] as const
