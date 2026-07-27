/**
 * LIQUIDITY_MODULE_001 — Hero geometry + copy contracts.
 * No live liquidity runtime values. No mock KPIs / TVL / volume.
 */

import { LIQUIDITY_FOUNDER_MOCKUP } from '../liquidityArchitecture000Contracts'

export const liquidityHero = {
  moduleId: '001-hero',
  architectureId: 'LIQUIDITY_ARCHITECTURE_000',
  mockupSha256: LIQUIDITY_FOUNDER_MOCKUP.sha256,

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
  journeySize: '13px',
  journeyLine: '18px',
  journeyColor: 'rgba(255,255,255,0.52)',
  gapAfterJourney: '16px',

  primaryCtaW: '160px',
  primaryCtaH: '44px',
  ctaRadius: '10px',

  gold: '#F4C430',
  goldHover: '#FFD34D',
  pageBg: '#080808',
  focusRing: '2px solid #F4C430',
  focusOffset: '2px',

  /** Existing Add Liquidity route — Module 004 owns the form later. */
  addLiquidityHref: '/add',

  mobileTitleSize: '42px',
  mobileTitleLine: '46px',
  mobileArtworkMaxW: '326px',
  mobileArtworkMaxH: '190px',
  mobileTrustW: '326px',
  mobileContentW: '358px',
  mobile430ContentW: '398px',
  mobileHeroMaxH: '720px',

  tabletBreak: '1199px',
  mobileBreak: '767px',
  mobile390: '390px',
  mobile430: '430px',
} as const

export const LIQUIDITY_HERO_COPY = {
  title: 'Liquidity',
  description: 'Provide liquidity.\nEarn fees.\nGrow markets.',
  journeys:
    'Two ways to start: provide liquidity manually, or use Melega AI Liquidity Builder.',
  primaryCta: 'Add Liquidity',
  trustTitle: 'Why provide liquidity?',
  trustItems: [
    {
      id: 'ownership',
      title: 'Non-custodial Ownership',
      body: 'Your LP positions remain yours.',
    },
    {
      id: 'pools',
      title: 'Transparent Pools',
      body: 'Participate in on-chain liquidity pools.',
    },
    {
      id: 'fees',
      title: 'Earn Fees',
      body: 'Liquidity providers receive applicable fees.',
    },
    {
      id: 'ecosystem',
      title: 'Open Ecosystem',
      body: 'Support markets across Melega DEX.',
    },
  ],
} as const
