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
  FarmsHeroModule: 'e8c7068144f874915f481dc6c398cc862816d144421f17041b624f3f21445810',
  FarmsHeroArtwork: '2aef0100d672662cc594cf74e85c6f35465cbf0b26e8c25986e149832c3a5a9a',
  FarmsHeroTrustPanel: '7e047bc5fd4b162a411dbbc41c2fe5168b8817447672ad362ca1122830756fa2',
  farmsHeroTokens: '5ac42c58d6638d97140f798ea715a5763ca742f23553867b689d14c1cebd95c6',
} as const

export const FARMS_MODULE_002_FREEZE_SHA256 = {
  FarmsOverviewKpisModule: '437c77f4c7e5a0e461031a9ae63ae7dd68b72ba609e5176ddff077d0cb1fe1b3',
  farmsOverviewKpisTokens: '5e364c44a8e049eefd43fbfb06c40cb20c1b8a260d7001e1b240a7cb261e7c26',
  buildFarmsOverviewKpis: '93c0858ba9992234bf75a7ed7f0f23c00d4d5b6e922aa044cdc853850475af59',
  useFarmsOverviewKpis: 'f7ef59571a3935d5f944ef8a70e2afb6878c05214d3816c79787aca337199124',
  farmsOverviewKpisTypes: 'bfce9e6eb2a73988b8f73969e71170918f5345ec09ec11d88b127b90e219c8b9',
} as const

export const FARMS_MODULE_003_FREEZE_SHA256 = {
  FarmsMyFarmsModule: 'ec17ce83d74f9822a3ee1e4428f2e4fd1a50b03a2984c185e4e70089f204c21f',
  FarmsMyFarmCard: 'cd0bd9fbfae31574cd08dc13f2a17815eb41b84dc2ad6d8f6d9789f5e1578dbb',
  farmsMyFarmsTokens: '94c01c03338ee138c9ec026b1ac7755e9fdfc4823c19d6c7810013072db567ed',
  farmsMyFarmsTypes: '0e5dbf639af54928f1ecb5e010558ed8e95e4eb98119df69775643a8c5ebdd7b',
  buildFarmsWalletPositions: '0efbe107355b2c8f1d0e082d56d4cf8b12f7b8904ab4c508946c86ab4007bae8',
  useFarmsWalletPositions: '1f7db07cd4c03fb6b31454ed7d60ef936f4855fad0c806c2c88d3f2786ab4147',
} as const

export const FARMS_MODULE_004_FREEZE_SHA256 = {
  FarmsExploreFarmsModule: '1f8aa38066a0a83c8bf58028cf55305999a4d68fd0dac830081cf37b45fff6b6',
  FarmsExploreFarmCard: '52e1fd0769fdf5f723c9f04871f9eae8ebda63db4a998e3137fc7960102f43d9',
  farmsExploreFarmsTokens: '990555608d6955b2f2f2b16ba9ae36fefbe9d1438c8dcd45fae7e9b082748062',
  farmsExploreFarmsTypes: 'f7d40c5bbac21920a7c5c731eb828a395eda8421e9c6e6f9d9c98ccbc3ef24fb',
  buildFarmsExploreFarms: '64eda6a26b12412b1dd20ba3d3014da6a2961b1c5837c4237074173eb62ddc1e',
  useFarmsExploreFarms: 'aa38a2322e6022f52c5f4aaa20f64da62376590cdfb3fa7d0e4d01d0da5a0696',
} as const

export const FARMS_MODULE_005_FREEZE_SHA256 = {
  FarmsFinishedFarmsModule: '0fb2efe12d6eeef7e7896c4071e356cfd4efe7f75054af3622f941e837364bcf',
  FarmsFinishedFarmCard: '8db717eee8b4b356c192f009bad74e55c50cd007484b2131e8cc1a7be5f11abd',
  farmsFinishedFarmsTokens: 'e32856ec997e4a5d59d669fc01293ac5a0184cbe64f1b1e098d194f2fd9a1763',
  farmsFinishedFarmsTypes: '395114197f8c111479dd1486ea21df5707d16f2d480390a4a6adeb164757d4fc',
  buildFarmsFinishedFarms: '6507c580589af70bed9381fd242569dc824627df1a72a5f7f04a0d1f91b8a9fd',
  useFarmsFinishedFarms: '163703cb9671d3ea2bccac5a9f618f00993f53be3fbf009835315bc86cc3653d',
} as const

export const FARMS_ARCHITECTURE_000_TIP = '8edd68d4ea94af3550b8100796592aafd5a09d97' as const
export const FARMS_MODULE_005_TIP = '640e1e6d14b6fc5bbc331f5a692226c481bc9ff1' as const
