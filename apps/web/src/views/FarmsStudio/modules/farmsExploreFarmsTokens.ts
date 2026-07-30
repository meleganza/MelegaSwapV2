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

  cardW: '328px',
  cardH: '292px',
  cardGapX: '14px',
  cardGapY: '14px',
  cardPad: '14px',
  cardRadius: '12px',
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
  'Highest TVL',
  'Highest Sustainable APR',
  'Newest',
] as const

/** Frozen Module 001 source SHAs (byte-identical guards). */
export const FARMS_MODULE_001_FREEZE_SHA256 = {
  FarmsHeroModule: '3c03cf796944468c138c4ae5f95623a4c67d4e813613f3b4cc4692ff020c9b4b',
  FarmsHeroArtwork: '1a8f4b669d2314b045303b1fd582c3adc752e983a0c2457f793ebd5700671442',
  FarmsHeroTrustPanel: '7e047bc5fd4b162a411dbbc41c2fe5168b8817447672ad362ca1122830756fa2',
  farmsHeroTokens: '5ac42c58d6638d97140f798ea715a5763ca742f23553867b689d14c1cebd95c6',
} as const

/** Frozen Module 002 source SHAs. */
export const FARMS_MODULE_002_FREEZE_SHA256 = {
  FarmsOverviewKpisModule: '437c77f4c7e5a0e461031a9ae63ae7dd68b72ba609e5176ddff077d0cb1fe1b3',
  farmsOverviewKpisTokens: '860bd89e305c98d363abf8ab3925cbb1ad4ae10acc9065f43caf010c7743c388',
  buildFarmsOverviewKpis: '93c0858ba9992234bf75a7ed7f0f23c00d4d5b6e922aa044cdc853850475af59',
  useFarmsOverviewKpis: 'f7ef59571a3935d5f944ef8a70e2afb6878c05214d3816c79787aca337199124',
  farmsOverviewKpisTypes: 'bfce9e6eb2a73988b8f73969e71170918f5345ec09ec11d88b127b90e219c8b9',
} as const

/** Frozen Module 003 source SHAs at tip 509e7119. */
export const FARMS_MODULE_003_FREEZE_SHA256 = {
  FarmsMyFarmsModule: 'ec17ce83d74f9822a3ee1e4428f2e4fd1a50b03a2984c185e4e70089f204c21f',
  FarmsMyFarmCard: 'ecea059d917ec0a3bd21bc255ba391a53d751591f02db30ad83df14eb9991f8c',
  farmsMyFarmsTokens: '13b99716071c6605260fb3b812caf8e4fff1385131957094f720329267ffc994',
  farmsMyFarmsTypes: 'eb94bd37b88a914231de28e51df2f8a67b08f0ac0fd7708a4a437d9ce1089151',
  buildFarmsWalletPositions: '44b4749cd72d477db0b7fc8d68d5010bc643dfd26cc9580a6dfff88143594711',
  useFarmsWalletPositions: '1f7db07cd4c03fb6b31454ed7d60ef936f4855fad0c806c2c88d3f2786ab4147',
} as const

export const FARMS_ARCHITECTURE_000_TIP = '8edd68d4ea94af3550b8100796592aafd5a09d97' as const
export const FARMS_MODULE_001_TIP = '21c2c0bb' as const
export const FARMS_MODULE_002_TIP = '69207266' as const
export const FARMS_MODULE_003_TIP = '509e7119a3806012eb25beee871f3dbac994c833' as const
