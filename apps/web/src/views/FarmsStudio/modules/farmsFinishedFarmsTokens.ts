/**
 * FARMS_MODULE_005 — Finished Farms geometry + freeze guards.
 */

import { FARMS_FOUNDER_MOCKUP } from '../farmsArchitecture000Contracts'
import { farmsHero } from './farmsHeroTokens'
import { farmsOverviewKpis } from './farmsOverviewKpisTokens'
import { farmsMyFarms } from './farmsMyFarmsTokens'
import { farmsExplore } from './farmsExploreFarmsTokens'

export const farmsFinished = {
  moduleId: '005-finished-farms',
  architectureId: 'FARMS_ARCHITECTURE_000',
  mockupSha256: FARMS_FOUNDER_MOCKUP.sha256,
  module001MockupSha256: farmsHero.mockupSha256,
  module002MockupSha256: farmsOverviewKpis.mockupSha256,
  module003MockupSha256: farmsMyFarms.mockupSha256,
  module004MockupSha256: farmsExplore.mockupSha256,

  contentMax: '1376px',
  topGapAfterExplore: '16px',
  headerH: '56px',

  titleSize: '18px',
  titleLine: '24px',
  titleWeight: 750,
  titleColor: '#F5F5F5',
  supportSize: '11px',
  supportLine: '15px',
  supportColor: 'rgba(255,255,255,0.50)',
  countSize: '11px',

  cardW: '446px',
  cardH: '250px',
  cardGapX: '19px',
  cardGapY: '18px',
  cardPad: '18px',
  cardRadius: '14px',
  cardBorder: '1px solid rgba(255,255,255,0.08)',
  cardBg: 'linear-gradient(145deg, rgba(19,19,19,0.98) 0%, rgba(13,13,13,0.98) 100%)',
  cardShadow: '0 14px 32px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.025)',
  emergencyBorder: '1px solid rgba(255,138,101,0.35)',

  lpLogo: 34,
  rewardLogo: 22,
  logoOverlap: -9,

  gold: '#F4C430',
  focusRing: '2px solid #F4C430',
  focusOffset: '2px',
  touchMin: '44px',

  mobileBreak: '767px',
  tabletBreak: '1199px',
  mobile390CardW: '326px',
  mobile430CardW: '366px',
  mobileContent390: '358px',
  mobileContent430: '398px',
  mobileCardMinH: '270px',
  mobileCardGap: '10px',
  tabletMinCardW: '340px',

  /** Factual history route already exists. */
  historyHref: '/farms/history',
} as const

export const FARMS_MODULE_001_FREEZE_SHA256 = {
  FarmsHeroModule: '65d046c35fd1c273c21e02eef4c15da3389f905c727b7dbc88ee80564669fed3',
  FarmsHeroArtwork: '1a8f4b669d2314b045303b1fd582c3adc752e983a0c2457f793ebd5700671442',
  FarmsHeroTrustPanel: '7e047bc5fd4b162a411dbbc41c2fe5168b8817447672ad362ca1122830756fa2',
  farmsHeroTokens: '6102837dcb221a52afab13a86bef3efaa295cca2748021fa6c37bc93bd04795f',
} as const

export const FARMS_MODULE_002_FREEZE_SHA256 = {
  FarmsOverviewKpisModule: '086755b1373c10432dc496b59c96f757a86ac47f6d30b86bcaff05bc2a50a1d2',
  farmsOverviewKpisTokens: '1abe4ad7cf3aea392b791f5c7206e2d87b1ae0abb8582917d700da503ea70eb9',
  buildFarmsOverviewKpis: '63ba986be3690c3d0b9241368db362e00eac87eda0acc4f68417b64ce0eb66c9',
  useFarmsOverviewKpis: 'f7ef59571a3935d5f944ef8a70e2afb6878c05214d3816c79787aca337199124',
  farmsOverviewKpisTypes: 'bfce9e6eb2a73988b8f73969e71170918f5345ec09ec11d88b127b90e219c8b9',
} as const

export const FARMS_MODULE_003_FREEZE_SHA256 = {
  FarmsMyFarmsModule: 'd0a6b16c58b26e92606fd37cfe9d7494870989d00c3592632f85f95f0fe1d347',
  FarmsMyFarmCard: '83323d6346dda0ae9ec3bdee80353377608fa1c71e6520a5bfb2caca379ce421',
  farmsMyFarmsTokens: 'fc669509d43b6d2910f2b9a46f75bf981b5a6ee8630673602c1cbeea854ccc0f',
  farmsMyFarmsTypes: '59e1dc2b025d2fcdd1c37b7b7326baea1508458b7af42c523e4acffa265cf8fc',
  buildFarmsWalletPositions: '01c57977914530f4ad941645c3f2f516ad02af875019c0bb05f68ddd26e32ee5',
  useFarmsWalletPositions: '30d7f27335beea626a36edb40594cabae734105fd373e8489fd6cc85cad9253b',
} as const

export const FARMS_MODULE_004_FREEZE_SHA256 = {
  FarmsExploreFarmsModule: 'bca1bb7a334d36fe8824523c0016f18427473f9c6617125336d60e8f764b41c6',
  FarmsExploreFarmCard: '7a68435ea5e2ca5a60ba888a21dd284b2ca5487edaac3e0e772461eb9053a403',
  farmsExploreFarmsTokens: 'aac29d3bd0a461ad6c02ab4d694aec5b0355ca9aa0c6f2a7fdabab6b4d0ad797',
  farmsExploreFarmsTypes: '99f2304916993449cc31c68ba0ed73169d901f8b2917d15290b747848a34d4d3',
  buildFarmsExploreFarms: '820af53bfd99a86bc88c8464b397c4ddce92852f3b0df130e386b01cc47f928e',
  useFarmsExploreFarms: '489389398f3b714515e6ff1d1aa3cd0bb828950f76643584ec6b9d4772523deb',
} as const

export const FARMS_ARCHITECTURE_000_TIP = '8edd68d4ea94af3550b8100796592aafd5a09d97' as const
export const FARMS_MODULE_004_TIP = '115748611b3a6809c75c61efa66ac1d726b47675' as const
