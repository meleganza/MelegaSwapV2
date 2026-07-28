/**
 * POOLS_MODULE_001 — Hero geometry + copy contracts.
 * No live pool runtime values. No mock KPIs.
 */

import { POOLS_FOUNDER_MOCKUP } from '../poolsArchitecture000Contracts'

export const poolsHero = {
  moduleId: '001-hero',
  architectureId: 'POOLS_ARCHITECTURE_000',
  mockupSha256: POOLS_FOUNDER_MOCKUP.sha256,

  contentMax: '1376px',
  topAfterTrending: '24px',
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
  descMaxW: '380px',
  gapAfterTitle: '14px',
  gapBeforeActions: '24px',

  primaryCtaW: '144px',
  primaryCtaH: '44px',
  secondaryCtaW: '136px',
  secondaryCtaH: '44px',
  ctaRadius: '10px',
  ctaGap: '12px',

  gold: '#F4C430',
  goldHover: '#FFD34D',
  pageBg: '#080808',
  focusRing: '2px solid #F4C430',
  focusOffset: '2px',

  /** Factual Create Pool destination (on-page builder). */
  createPoolHref: '#create-pool',
  createPoolFallback: '/build-studio?intent=staking-pool#create-pool',

  /**
   * How it Works — Architecture 000 reserves the Hero CTA.
   * No dedicated explanatory section exists yet; CTA scrolls to the on-page
   * Create Pool builder (`#create-pool`) as the factual guided entry.
   */
  howItWorksHref: '#create-pool',
  howItWorksReserved: true,

  mobileTitleSize: '42px',
  mobileTitleLine: '46px',
  mobileArtworkMaxW: '326px',
  mobileArtworkMaxH: '190px',
  mobileTrustW: '326px',
  mobileContentW: '358px',
  mobile430ContentW: '398px',
  mobileHeroMaxH: '650px',

  tabletBreak: '1199px',
  mobileBreak: '767px',
} as const

export const POOLS_HERO_COPY = {
  title: 'Pools',
  description: 'Stake tokens. Earn rewards. On your terms.',
  primaryCta: 'Create Pool',
  secondaryCta: 'How it Works',
  trustTitle: 'Why Stake on Melega DEX?',
  trustItems: [
    {
      id: 'security',
      title: 'Security-first',
      body: 'Built around transparent on-chain contracts.',
    },
    {
      id: 'rewards',
      title: 'Sustainable Rewards',
      body: 'Rewards follow each pool’s factual emission model.',
    },
    {
      id: 'flexibility',
      title: 'Flexible Options',
      body: 'Pool terms may vary by asset and duration.',
    },
    {
      id: 'fees',
      title: 'Transparent Fees',
      body: 'Review applicable pool terms before staking.',
    },
  ],
} as const

/** Copy deviation vs mockup labels — factual corrections. */
export const POOLS_HERO_COPY_DEVIATIONS = [
  {
    mockup: 'Secure & Audited / Smart contracts audited by Melega Labs',
    shipped: 'Security-first / Built around transparent on-chain contracts.',
    reason: 'Universal audit coverage is not an authoritative product claim.',
  },
  {
    mockup: 'Low Fees / Optimized for maximum returns',
    shipped: 'Transparent Fees / Review applicable pool terms before staking.',
    reason: 'Avoid guaranteed returns and universally-low-fee claims.',
  },
  {
    mockup: 'Sustainable Rewards / Real yield from real utility',
    shipped: 'Sustainable Rewards / Rewards follow each pool’s factual emission model.',
    reason: 'Align reward copy with emission-model truthfulness.',
  },
] as const
