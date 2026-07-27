/**
 * FARMS_MODULE_004 — Explore Farms geometry + freeze guards.
 */

import { FARMS_FOUNDER_MOCKUP } from '../farmsArchitecture000Contracts'
import { farmsHero } from './farmsHeroTokens'
import { farmsOverviewKpis } from './farmsOverviewKpisTokens'
import { farmsMyFarms } from './farmsMyFarmsTokens'

export const farmsExplore = {
  moduleId: '004-explore-farms',
  architectureId: 'FARMS_ARCHITECTURE_000',
  mockupSha256: FARMS_FOUNDER_MOCKUP.sha256,
  module001MockupSha256: farmsHero.mockupSha256,
  module002MockupSha256: farmsOverviewKpis.mockupSha256,
  module003MockupSha256: farmsMyFarms.mockupSha256,

  contentMax: '1376px',
  topGapAfterMyFarms: '16px',

  headerH: '48px',
  toolbarH: '48px',
  headerToolbarH: '96px',

  titleSize: '18px',
  titleLine: '24px',
  titleWeight: 750,
  titleColor: '#F5F5F5',
  countSize: '11px',
  countLine: '15px',
  countColor: 'rgba(255,255,255,0.50)',

  cardW: '446px',
  cardH: '268px',
  cardGapX: '19px',
  cardGapY: '18px',
  cardPad: '18px',
  cardRadius: '14px',
  cardBorder: '1px solid rgba(255,255,255,0.08)',
  cardBg: 'linear-gradient(145deg, rgba(19,19,19,0.98) 0%, rgba(13,13,13,0.98) 100%)',
  cardShadow: '0 14px 32px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.025)',
  cardHoverBorder: '1px solid rgba(255,255,255,0.14)',
  cardHoverShadow: '0 16px 36px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.035)',
  cardHoverLift: '1px',

  cardHeaderH: '58px',
  lpLogo: 34,
  rewardLogo: 22,
  logoOverlap: -9,

  pairTitleSize: '17px',
  pairTitleLine: '22px',
  pairTitleWeight: 750,
  earnSize: '11px',
  earnLine: '15px',
  earnColor: 'rgba(255,255,255,0.54)',

  gold: '#F4C430',
  focusRing: '2px solid #F4C430',
  focusOffset: '2px',
  touchMin: '44px',

  initialLimit: 9,
  pageStep: 9,

  mobileBreak: '767px',
  tabletBreak: '1199px',
  mobile390CardW: '326px',
  mobile430CardW: '366px',
  mobileContent390: '358px',
  mobileContent430: '398px',
  mobileCardMinH: '288px',
  mobileCardGap: '10px',
  tabletMinCardW: '340px',
} as const

export const FARMS_EXPLORE_FILTERS = [
  'All',
  'Stable LP',
  'Volatile LP',
  'Native Pair',
  'High APR',
  'High TVL',
  'Wallet Has LP',
  'Approved',
  'Stakeable Now',
] as const

export const FARMS_EXPLORE_SORTS = [
  'Highest Sustainable APR',
  'Highest TVL',
  'Newest',
  'Alphabetical',
  'Wallet LP Balance',
] as const

/** Frozen Module 001 source SHAs (byte-identical guards). */
export const FARMS_MODULE_001_FREEZE_SHA256 = {
  FarmsHeroModule: 'a1360aff6d765b740e63a3b018b649d3ef17c83067531c7b787f718a3b19de43',
  FarmsHeroArtwork: 'a0e3e58813fa642da6a5d8b9a18722e8b2b4efc40cb260f14cc102a10647bc16',
  FarmsHeroTrustPanel: '93b9ff921b308fffc36a40a94dc48c8f7c85582fcf35f12c895bb9180137bbd2',
  farmsHeroTokens: 'eb192bfabfcf4c87cb08751732aa12e8d7960190f7ebd62f43b016e033eea06c',
} as const

/** Frozen Module 002 source SHAs. */
export const FARMS_MODULE_002_FREEZE_SHA256 = {
  FarmsOverviewKpisModule: '188d495c6a192db43e8e5a8464b333b5c624e5010a2e78a7ebb204677c11c9f2',
  farmsOverviewKpisTokens: '1c0696ef2bb9e5ff9189376bf0152b275e6d61a62de8a3a1e534621cbc4567f7',
  buildFarmsOverviewKpis: '987ddde0b6f5d54c2c62b71d6bcca976cecea020533c8a9d35c896c72da3418f',
  useFarmsOverviewKpis: '8a77b200ad62225d0d0c775a378dfcfe69b7c0a8e99115a1737451dfeadd8ec9',
  farmsOverviewKpisTypes: '95dc90670e30f7780e0c226bf1f92a691e4a31fa580489d34081b9e7d77e0129',
} as const

/** Frozen Module 003 source SHAs at tip 509e7119. */
export const FARMS_MODULE_003_FREEZE_SHA256 = {
  FarmsMyFarmsModule: 'ec17ce83d74f9822a3ee1e4428f2e4fd1a50b03a2984c185e4e70089f204c21f',
  FarmsMyFarmCard: 'b2669f7571a39f86d668e53cd68a4b5989e6f7708a7ec2bfe8ab8e6c1382f0f2',
  farmsMyFarmsTokens: '18f7ef12d54e064bcf199f6c5c8183224e44b79ae7c12b078787ca850ceded10',
  farmsMyFarmsTypes: '0e5dbf639af54928f1ecb5e010558ed8e95e4eb98119df69775643a8c5ebdd7b',
  buildFarmsWalletPositions: '0efbe107355b2c8f1d0e082d56d4cf8b12f7b8904ab4c508946c86ab4007bae8',
  useFarmsWalletPositions: '1f7db07cd4c03fb6b31454ed7d60ef936f4855fad0c806c2c88d3f2786ab4147',
} as const

export const FARMS_ARCHITECTURE_000_TIP = '8edd68d4ea94af3550b8100796592aafd5a09d97' as const
export const FARMS_MODULE_001_TIP = '21c2c0bb' as const
export const FARMS_MODULE_002_TIP = '69207266' as const
export const FARMS_MODULE_003_TIP = '509e7119a3806012eb25beee871f3dbac994c833' as const
