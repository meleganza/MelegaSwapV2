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
  FarmsHeroModule: 'b22879b18e899567942bc7db24339c2baf70c8997c579fcadef1ac90aa57de7b',
  FarmsHeroArtwork: 'a0e3e58813fa642da6a5d8b9a18722e8b2b4efc40cb260f14cc102a10647bc16',
  FarmsHeroTrustPanel: '7e047bc5fd4b162a411dbbc41c2fe5168b8817447672ad362ca1122830756fa2',
  farmsHeroTokens: 'f4672464d452b42d3a045dcd397616432190245fc5618fbf0174d2b2f58e7d26',
} as const

/** Frozen Module 002 source SHAs. */
export const FARMS_MODULE_002_FREEZE_SHA256 = {
  FarmsOverviewKpisModule: '437c77f4c7e5a0e461031a9ae63ae7dd68b72ba609e5176ddff077d0cb1fe1b3',
  farmsOverviewKpisTokens: '90e937117f57aab418e096a2b7572fd259e524a6304493b0b832bc198a57e390',
  buildFarmsOverviewKpis: '86bfed331f8a935ba3c1b0379142d845b09fd568c7ad0413c73ecfe075a76696',
  useFarmsOverviewKpis: '3ccf7513fb70c538e4f0e8ef82a913f2c0a2119c57fc5022fa2fef721c6f5146',
  farmsOverviewKpisTypes: 'bfce9e6eb2a73988b8f73969e71170918f5345ec09ec11d88b127b90e219c8b9',
} as const

/** Frozen Module 003 source SHAs at tip 509e7119. */
export const FARMS_MODULE_003_FREEZE_SHA256 = {
  FarmsMyFarmsModule: 'ec17ce83d74f9822a3ee1e4428f2e4fd1a50b03a2984c185e4e70089f204c21f',
  FarmsMyFarmCard: 'b2669f7571a39f86d668e53cd68a4b5989e6f7708a7ec2bfe8ab8e6c1382f0f2',
  farmsMyFarmsTokens: 'e3ff36d7f62d4c0d6a762cc33385142ee63eb35a6812828b3b8e02cfabcb6e44',
  farmsMyFarmsTypes: '0e5dbf639af54928f1ecb5e010558ed8e95e4eb98119df69775643a8c5ebdd7b',
  buildFarmsWalletPositions: '0efbe107355b2c8f1d0e082d56d4cf8b12f7b8904ab4c508946c86ab4007bae8',
  useFarmsWalletPositions: '1f7db07cd4c03fb6b31454ed7d60ef936f4855fad0c806c2c88d3f2786ab4147',
} as const

export const FARMS_ARCHITECTURE_000_TIP = '8edd68d4ea94af3550b8100796592aafd5a09d97' as const
export const FARMS_MODULE_001_TIP = '21c2c0bb' as const
export const FARMS_MODULE_002_TIP = '69207266' as const
export const FARMS_MODULE_003_TIP = '509e7119a3806012eb25beee871f3dbac994c833' as const
