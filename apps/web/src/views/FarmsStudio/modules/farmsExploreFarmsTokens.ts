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
  cardH: '248px',
  cardGapX: '12px',
  cardGapY: '12px',
  cardPad: '12px',
  cardRadius: '12px',
  cardBorder: '1px solid rgba(255,255,255,0.08)',
  cardBg: 'linear-gradient(145deg, rgba(19,19,19,0.98) 0%, rgba(13,13,13,0.98) 100%)',
  cardShadow: '0 14px 32px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.025)',
  cardHoverBorder: '1px solid rgba(255,255,255,0.14)',
  cardHoverShadow: '0 16px 36px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.035)',
  cardHoverLift: '1px',

  cardHeaderH: '48px',
  lpLogo: 30,
  rewardLogo: 20,
  logoOverlap: -8,

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
  // Founder amendment P0-6 density breakpoints (mobile-first cascade).
  smallTabletBreak: '768px',
  tabletPortraitBreak: '1025px',
  desktopBreak: '1200px',
  ultraWideBreak: '1920px',
  mobile390CardW: '326px',
  mobile430CardW: '366px',
  mobileContent390: '358px',
  mobileContent430: '398px',
  mobileCardMinH: '240px',
  mobileCardGap: '10px',
  tabletMinCardW: '320px',
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
  FarmsHeroModule: '65d046c35fd1c273c21e02eef4c15da3389f905c727b7dbc88ee80564669fed3',
  FarmsHeroArtwork: '1a8f4b669d2314b045303b1fd582c3adc752e983a0c2457f793ebd5700671442',
  FarmsHeroTrustPanel: '7e047bc5fd4b162a411dbbc41c2fe5168b8817447672ad362ca1122830756fa2',
  farmsHeroTokens: '6102837dcb221a52afab13a86bef3efaa295cca2748021fa6c37bc93bd04795f',
} as const

/** Frozen Module 002 source SHAs. */
export const FARMS_MODULE_002_FREEZE_SHA256 = {
  FarmsOverviewKpisModule: '04d23c5fa731fda81cc8b16c6deebb2a3f25cf5e5cd350a41a6713950ece5877',
  farmsOverviewKpisTokens: '37e2f98032f21e0de55754439ecca409c934f824b8b616f6d354d7734973fc89',
  buildFarmsOverviewKpis: '93c0858ba9992234bf75a7ed7f0f23c00d4d5b6e922aa044cdc853850475af59',
  useFarmsOverviewKpis: 'f7ef59571a3935d5f944ef8a70e2afb6878c05214d3816c79787aca337199124',
  farmsOverviewKpisTypes: 'bfce9e6eb2a73988b8f73969e71170918f5345ec09ec11d88b127b90e219c8b9',
} as const

/** Frozen Module 003 source SHAs at tip 509e7119. */
export const FARMS_MODULE_003_FREEZE_SHA256 = {
  FarmsMyFarmsModule: 'af6a59567f70801b4271c18b8610338f00471f6b0d6a4b62cef4c2270a1cf92e',
  FarmsMyFarmCard: 'f6948da196b85bd96f97055db9e9e1acf63fa3982704039da99d6301ad7ca629',
  farmsMyFarmsTokens: '1add9f0333d156bc18638d9806ded867aac4a81127f34ca624b3c17bfb432c01',
  farmsMyFarmsTypes: '59e1dc2b025d2fcdd1c37b7b7326baea1508458b7af42c523e4acffa265cf8fc',
  buildFarmsWalletPositions: '01c57977914530f4ad941645c3f2f516ad02af875019c0bb05f68ddd26e32ee5',
  useFarmsWalletPositions: '30d7f27335beea626a36edb40594cabae734105fd373e8489fd6cc85cad9253b',
} as const

export const FARMS_ARCHITECTURE_000_TIP = '8edd68d4ea94af3550b8100796592aafd5a09d97' as const
export const FARMS_MODULE_001_TIP = '21c2c0bb' as const
export const FARMS_MODULE_002_TIP = '69207266' as const
export const FARMS_MODULE_003_TIP = '509e7119a3806012eb25beee871f3dbac994c833' as const
