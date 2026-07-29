/**
 * FARMS_MODULE_001 — Hero geometry + copy contracts.
 * No live farm runtime values. No mock KPIs / APR / TVL / rewards.
 */

import { FARMS_FOUNDER_MOCKUP } from '../farmsArchitecture000Contracts'

export const farmsHero = {
  moduleId: '001-hero',
  architectureId: 'FARMS_ARCHITECTURE_000',
  mockupSha256: FARMS_FOUNDER_MOCKUP.sha256,

  contentMax: '1376px',
  topAfterTrending: '24px',
  heroW: '1376px',
  heroH: '260px',

  leftW: '440px',
  artworkW: '480px',
  trustW: '360px',
  columnGap: '24px',

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

  primaryCtaW: '160px',
  primaryCtaH: '44px',
  secondaryCtaW: '168px',
  secondaryCtaH: '44px',
  ctaRadius: '10px',
  ctaGap: '12px',

  gold: '#F4C430',
  goldHover: '#FFD34D',
  pageBg: '#080808',
  focusRing: '2px solid #F4C430',
  focusOffset: '2px',

  /**
   * Explore Farms — reserved Module 004 domain anchor.
   * Temporary legacy destination scrolls to on-page `#explore-farms`
   * (legacy explore band) until Module 004 owns the section.
   */
  exploreFarmsHref: '#explore-farms',
  exploreFarmsLegacyFallback: '/farms#explore-farms',

  /**
   * How Farming Works — no dedicated factual destination exists on-site.
   * CTA is omitted honestly (Architecture permits omit when no destination).
   */
  howFarmingWorksHref: null as string | null,
  howFarmingWorksRendered: false,

  mobileTitleSize: '36px',
  mobileTitleLine: '40px',
  mobileArtworkMaxW: '300px',
  mobileArtworkMaxH: '148px',
  mobileTrustW: '326px',
  mobileContentW: '358px',
  mobile430ContentW: '398px',
  mobileHeroMaxH: '520px',
  mobileDescSize: '14px',
  mobileDescLine: '20px',
  mobileGapAfterTitle: '10px',
  mobileGapBeforeActions: '14px',
  mobileColumnGap: '12px',

  tabletBreak: '1199px',
  mobileBreak: '767px',
} as const

export const FARMS_HERO_COPY = {
  title: 'Farms',
  description: 'Stake LP tokens.\nEarn farming rewards.\nGrow liquidity.',
  primaryCta: 'Explore Farms',
  secondaryCta: 'How Farming Works',
  trustTitle: 'Why Farm on Melega DEX?',
  trustItems: [
    {
      id: 'lp-yield',
      title: 'LP-Powered Yield',
      body: 'Farms stake LP tokens — not single-asset deposits.',
    },
    {
      id: 'rewards',
      title: 'Transparent Rewards',
      body: 'Rewards follow each farm’s published emission model.',
    },
    {
      id: 'management',
      title: 'Flexible Management',
      body: 'Stake, harvest, and withdraw through on-chain actions.',
    },
    {
      id: 'ownership',
      title: 'On-Chain Ownership',
      body: 'LP positions and rewards remain wallet-controlled.',
    },
  ],
} as const

/** Forbidden product claims — never ship these strings in Module 001. */
export const FARMS_HERO_FORBIDDEN_CLAIMS = [
  'Guaranteed rewards',
  'Highest APR',
  'Risk-free farming',
  'guaranteed',
  'risk-free',
] as const
