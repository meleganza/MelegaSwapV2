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
  FarmsHeroModule: '3c03cf796944468c138c4ae5f95623a4c67d4e813613f3b4cc4692ff020c9b4b',
  FarmsHeroArtwork: '1a8f4b669d2314b045303b1fd582c3adc752e983a0c2457f793ebd5700671442',
  FarmsHeroTrustPanel: '7e047bc5fd4b162a411dbbc41c2fe5168b8817447672ad362ca1122830756fa2',
  farmsHeroTokens: '5ac42c58d6638d97140f798ea715a5763ca742f23553867b689d14c1cebd95c6',
} as const

export const FARMS_MODULE_002_FREEZE_SHA256 = {
  FarmsOverviewKpisModule: '04d23c5fa731fda81cc8b16c6deebb2a3f25cf5e5cd350a41a6713950ece5877',
  farmsOverviewKpisTokens: '860bd89e305c98d363abf8ab3925cbb1ad4ae10acc9065f43caf010c7743c388',
  buildFarmsOverviewKpis: '93c0858ba9992234bf75a7ed7f0f23c00d4d5b6e922aa044cdc853850475af59',
  useFarmsOverviewKpis: 'f7ef59571a3935d5f944ef8a70e2afb6878c05214d3816c79787aca337199124',
  farmsOverviewKpisTypes: 'bfce9e6eb2a73988b8f73969e71170918f5345ec09ec11d88b127b90e219c8b9',
} as const

export const FARMS_MODULE_003_FREEZE_SHA256 = {
  FarmsMyFarmsModule: 'af6a59567f70801b4271c18b8610338f00471f6b0d6a4b62cef4c2270a1cf92e',
  FarmsMyFarmCard: 'f0e0ced762ece9d37a90ad9dd08a0f01a76a53379e5d3c80ac015279b7aa119b',
  farmsMyFarmsTokens: 'e487e46a520f27ba721a9ced1e21bd6ac58c632dfe4fde99ece10784b47a96a7',
  farmsMyFarmsTypes: 'eb94bd37b88a914231de28e51df2f8a67b08f0ac0fd7708a4a437d9ce1089151',
  buildFarmsWalletPositions: '44b4749cd72d477db0b7fc8d68d5010bc643dfd26cc9580a6dfff88143594711',
  useFarmsWalletPositions: '30d7f27335beea626a36edb40594cabae734105fd373e8489fd6cc85cad9253b',
} as const

export const FARMS_MODULE_004_FREEZE_SHA256 = {
  FarmsExploreFarmsModule: 'fcd6d9b788ec9abd6a39f7d81d0585d7a31c47b692c9ac1308dc9400661a4dce',
  FarmsExploreFarmCard: 'bb1a0416ba9c5f286a4293b4184bbc0aba7a29d2b6ba792648bdd71057aa1247',
  farmsExploreFarmsTokens: 'c96b8bec3e30ea6296e90d3e18fc13b6acbfc66adebb415d522a067218582681',
  farmsExploreFarmsTypes: 'f7d40c5bbac21920a7c5c731eb828a395eda8421e9c6e6f9d9c98ccbc3ef24fb',
  buildFarmsExploreFarms: '7adab453e64fa407d48851368b7d445f91a3b589773d665e2aea21d3adff1320',
  useFarmsExploreFarms: 'aa38a2322e6022f52c5f4aaa20f64da62376590cdfb3fa7d0e4d01d0da5a0696',
} as const

export const FARMS_ARCHITECTURE_000_TIP = '8edd68d4ea94af3550b8100796592aafd5a09d97' as const
export const FARMS_MODULE_004_TIP = '115748611b3a6809c75c61efa66ac1d726b47675' as const
