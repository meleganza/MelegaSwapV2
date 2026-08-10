/**
 * FARMS_MODULE_006 — Yield Advisor geometry + freeze guards.
 * Desktop slot matches Module 003 reserved 424×360.
 */

import { FARMS_FOUNDER_MOCKUP } from '../farmsArchitecture000Contracts'
import { farmsHero } from './farmsHeroTokens'
import { farmsOverviewKpis } from './farmsOverviewKpisTokens'
import { farmsMyFarms } from './farmsMyFarmsTokens'
import { farmsExplore } from './farmsExploreFarmsTokens'
import { farmsFinished } from './farmsFinishedFarmsTokens'

export const farmsYieldAdvisor = {
  moduleId: '006-yield-advisor',
  architectureId: 'FARMS_ARCHITECTURE_000',
  mockupSha256: FARMS_FOUNDER_MOCKUP.sha256,
  module001MockupSha256: farmsHero.mockupSha256,
  module002MockupSha256: farmsOverviewKpis.mockupSha256,
  module003MockupSha256: farmsMyFarms.mockupSha256,
  module004MockupSha256: farmsExplore.mockupSha256,
  module005MockupSha256: farmsFinished.mockupSha256,

  slotW: '424px',
  slotH: '360px',
  maxVisible: 4,

  radius: '16px',
  border: '1px solid rgba(255,255,255,0.085)',
  bg: 'linear-gradient(145deg, rgba(18,18,18,0.98) 0%, rgba(12,12,12,0.98) 100%)',
  shadow: '0 16px 36px rgba(0,0,0,0.26), inset 0 1px 0 rgba(255,255,255,0.025)',

  headerH: '72px',
  titleSize: '16px',
  titleLine: '22px',
  titleWeight: 750,
  titleColor: '#F5F5F5',
  subtitleSize: '11px',
  subtitleLine: '15px',
  subtitleColor: 'rgba(255,255,255,0.50)',

  cardW: '390px',
  cardH: '64px',
  cardPad: '0 12px',
  cardGap: '8px',
  cardRadius: '10px',
  cardBorder: '1px solid rgba(255,255,255,0.08)',
  cardBg: 'rgba(22,22,22,0.96)',

  gold: '#F4C430',
  focusRing: '2px solid #F4C430',
  focusOffset: '2px',
  touchMin: '44px',

  mobileBreak: '767px',
  tabletBreak: '1199px',
  mobileContent390: '358px',
  slotSelector: '[data-farms-module-006-slot="reserved"]',
} as const

export const FARMS_MODULE_001_FREEZE_SHA256 = {
  FarmsHeroModule: '65d046c35fd1c273c21e02eef4c15da3389f905c727b7dbc88ee80564669fed3',
  FarmsHeroArtwork: '1a8f4b669d2314b045303b1fd582c3adc752e983a0c2457f793ebd5700671442',
  FarmsHeroTrustPanel: '7e047bc5fd4b162a411dbbc41c2fe5168b8817447672ad362ca1122830756fa2',
  farmsHeroTokens: '6102837dcb221a52afab13a86bef3efaa295cca2748021fa6c37bc93bd04795f',
} as const

export const FARMS_MODULE_002_FREEZE_SHA256 = {
  FarmsOverviewKpisModule: 'f4d119abf68e9791ee14bc89e7571368591886e1a53b2525f6174bb794a0ba9c',
  farmsOverviewKpisTokens: '1abe4ad7cf3aea392b791f5c7206e2d87b1ae0abb8582917d700da503ea70eb9',
  buildFarmsOverviewKpis: '63ba986be3690c3d0b9241368db362e00eac87eda0acc4f68417b64ce0eb66c9',
  useFarmsOverviewKpis: 'f7ef59571a3935d5f944ef8a70e2afb6878c05214d3816c79787aca337199124',
  farmsOverviewKpisTypes: 'bfce9e6eb2a73988b8f73969e71170918f5345ec09ec11d88b127b90e219c8b9',
} as const

export const FARMS_MODULE_003_FREEZE_SHA256 = {
  FarmsMyFarmsModule: '90155b0dbfca378e509c8a7bfc627cc36bb4c623666fab81cca4044c2ea7c571',
  FarmsMyFarmCard: '36b6ef0fd086fafc5b68f3e5dbee73a531ca9a415e6579152f23e8be7552d0d6',
  farmsMyFarmsTokens: '7467f28f279ab9f2fad41a475a5a76bbc7499affdd968875b5d4b7390989e77c',
  farmsMyFarmsTypes: '59e1dc2b025d2fcdd1c37b7b7326baea1508458b7af42c523e4acffa265cf8fc',
  buildFarmsWalletPositions: '01c57977914530f4ad941645c3f2f516ad02af875019c0bb05f68ddd26e32ee5',
  useFarmsWalletPositions: '30d7f27335beea626a36edb40594cabae734105fd373e8489fd6cc85cad9253b',
} as const

export const FARMS_MODULE_004_FREEZE_SHA256 = {
  FarmsExploreFarmsModule: 'f1b22a98bf45edc242e507d0812d825074d34f43cc4cce52bc1e128832fb63d6',
  FarmsExploreFarmCard: '81debf8ced0e6ee697140813d1adb87b7fd8188f7437e6ad438a42e4fc278fce',
  farmsExploreFarmsTokens: 'a62ff1c7345abc452a99092ac9be91309b337a24105cde6b7bcd71f52fb87854',
  farmsExploreFarmsTypes: '99f2304916993449cc31c68ba0ed73169d901f8b2917d15290b747848a34d4d3',
  buildFarmsExploreFarms: '7cfe6e073ed9bfe1aa91b0b5e064f8d196d150d1d5f06e4362b17ef53c77c22e',
  useFarmsExploreFarms: '489389398f3b714515e6ff1d1aa3cd0bb828950f76643584ec6b9d4772523deb',
} as const

export const FARMS_MODULE_005_FREEZE_SHA256 = {
  FarmsFinishedFarmsModule: '0fb2efe12d6eeef7e7896c4071e356cfd4efe7f75054af3622f941e837364bcf',
  FarmsFinishedFarmCard: '8db717eee8b4b356c192f009bad74e55c50cd007484b2131e8cc1a7be5f11abd',
  farmsFinishedFarmsTokens: '2c749d8ce7a83c63cd2128a1d06097897b3b28638240d50b2033ce5322f700f4',
  farmsFinishedFarmsTypes: '395114197f8c111479dd1486ea21df5707d16f2d480390a4a6adeb164757d4fc',
  buildFarmsFinishedFarms: 'b058737f8699b75d8b2baa5bb1c823ce280de41ec7d87665468cef81f2d548d8',
  useFarmsFinishedFarms: '163703cb9671d3ea2bccac5a9f618f00993f53be3fbf009835315bc86cc3653d',
} as const

export const FARMS_ARCHITECTURE_000_TIP = '8edd68d4ea94af3550b8100796592aafd5a09d97' as const
export const FARMS_MODULE_005_TIP = '640e1e6d14b6fc5bbc331f5a692226c481bc9ff1' as const
