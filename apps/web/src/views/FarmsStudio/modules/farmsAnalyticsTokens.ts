/**
 * FARMS_MODULE_007 — Analytics geometry + freeze guards.
 * Desktop: 1376 × 240, four equal panels, 18px gap (330 × 4 + 18 × 3 ≈ 1374).
 */

import { FARMS_FOUNDER_MOCKUP } from '../farmsArchitecture000Contracts'
import { farmsHero } from './farmsHeroTokens'
import { farmsOverviewKpis } from './farmsOverviewKpisTokens'
import { farmsMyFarms } from './farmsMyFarmsTokens'
import { farmsExplore } from './farmsExploreFarmsTokens'
import { farmsFinished } from './farmsFinishedFarmsTokens'
import { farmsYieldAdvisor } from './farmsYieldAdvisorTokens'

export const farmsAnalytics = {
  moduleId: '007-analytics',
  architectureId: 'FARMS_ARCHITECTURE_000',
  mockupSha256: FARMS_FOUNDER_MOCKUP.sha256,
  module001MockupSha256: farmsHero.mockupSha256,
  module002MockupSha256: farmsOverviewKpis.mockupSha256,
  module003MockupSha256: farmsMyFarms.mockupSha256,
  module004MockupSha256: farmsExplore.mockupSha256,
  module005MockupSha256: farmsFinished.mockupSha256,
  module006MockupSha256: farmsYieldAdvisor.mockupSha256,

  contentMax: '1376px',
  moduleH: '240px',
  panelGap: '18px',
  /** Mission geometry: 330 × 4 + 18 × 3 ≈ 1374 (grid fills 1376). */
  panelW: '330px',
  panelH: '240px',
  topGap: '16px',

  radius: '16px',
  border: '1px solid rgba(255,255,255,0.085)',
  bg: 'linear-gradient(145deg, rgba(18,18,18,0.98) 0%, rgba(12,12,12,0.98) 100%)',
  shadow: '0 14px 32px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.025)',
  pad: '14px 16px',

  titleSize: '13px',
  titleLine: '18px',
  titleWeight: 750,
  titleColor: '#F5F5F5',

  gold: '#F4C430',
  green: '#3DDC97',
  blue: '#4DA3FF',
  red: '#FF6B6B',
  muted: 'rgba(255,255,255,0.55)',

  colors: {
    active: '#3DDC97',
    finished: '#8A8A8A',
    emergency: '#FF6B6B',
    withdraw: '#F4C430',
    healthy: '#3DDC97',
    partial: '#F4C430',
    unavailable: '#8A8A8A',
  },

  mobileBreak: '767px',
  tabletBreak: '1199px',
  mobileContent390: '358px',
  mobileContent430: '398px',
  maxRewardTokens: 5,
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
  FarmsMyFarmCard: 'ecea059d917ec0a3bd21bc255ba391a53d751591f02db30ad83df14eb9991f8c',
  farmsMyFarmsTokens: 'e487e46a520f27ba721a9ced1e21bd6ac58c632dfe4fde99ece10784b47a96a7',
  farmsMyFarmsTypes: 'eb94bd37b88a914231de28e51df2f8a67b08f0ac0fd7708a4a437d9ce1089151',
  buildFarmsWalletPositions: '44b4749cd72d477db0b7fc8d68d5010bc643dfd26cc9580a6dfff88143594711',
  useFarmsWalletPositions: '1f7db07cd4c03fb6b31454ed7d60ef936f4855fad0c806c2c88d3f2786ab4147',
} as const

export const FARMS_MODULE_004_FREEZE_SHA256 = {
  FarmsExploreFarmsModule: 'fcd6d9b788ec9abd6a39f7d81d0585d7a31c47b692c9ac1308dc9400661a4dce',
  FarmsExploreFarmCard: '1634ba125184a5835225d3f64eaed1d72ab3ab0b3ce5e222e3ed569927522a84',
  farmsExploreFarmsTokens: 'c96b8bec3e30ea6296e90d3e18fc13b6acbfc66adebb415d522a067218582681',
  farmsExploreFarmsTypes: 'f7d40c5bbac21920a7c5c731eb828a395eda8421e9c6e6f9d9c98ccbc3ef24fb',
  buildFarmsExploreFarms: '64eda6a26b12412b1dd20ba3d3014da6a2961b1c5837c4237074173eb62ddc1e',
  useFarmsExploreFarms: 'aa38a2322e6022f52c5f4aaa20f64da62376590cdfb3fa7d0e4d01d0da5a0696',
} as const

export const FARMS_MODULE_005_FREEZE_SHA256 = {
  FarmsFinishedFarmsModule: '0fb2efe12d6eeef7e7896c4071e356cfd4efe7f75054af3622f941e837364bcf',
  FarmsFinishedFarmCard: '8db717eee8b4b356c192f009bad74e55c50cd007484b2131e8cc1a7be5f11abd',
  farmsFinishedFarmsTokens: 'e049d6d1d9a5dab0dba7d411e6f8051fc3a7270f18f2b5088f654bf0efb77eec',
  farmsFinishedFarmsTypes: '395114197f8c111479dd1486ea21df5707d16f2d480390a4a6adeb164757d4fc',
  buildFarmsFinishedFarms: '6507c580589af70bed9381fd242569dc824627df1a72a5f7f04a0d1f91b8a9fd',
  useFarmsFinishedFarms: '163703cb9671d3ea2bccac5a9f618f00993f53be3fbf009835315bc86cc3653d',
} as const

export const FARMS_MODULE_006_FREEZE_SHA256 = {
  FarmsYieldAdvisorModule: '38a249133e0d64841c517beccc7ea2df8dd4aba3ea96c1f06e1554443442d38d',
  FarmsYieldAdvisorCard: '28d318a28251cfa6f9340a244eb667b740d4f4aa1432ec6b470e2ba94a1d9b4d',
  farmsYieldAdvisorTokens: '7f91b4afdda9f26057cf435f778931d0f14bd82e5f4d718bcd84558398b668c2',
  farmsYieldAdvisorTypes: 'ed9e30ac59809df0f62759cf9fa73ce4dbec07c5f498e49bac8263db3453ca61',
  buildFarmsYieldAdvisor: 'b23d0a2a064b92e717ccb2f71b2cab346ea66f6d64809b8e96ba6a8ba7714c05',
  useFarmsYieldAdvisor: 'e404ab29e946d22b4d1d40d2ca66f161c126adc0c92d61a67d8a5f9679ac3116',
} as const

export const FARMS_ARCHITECTURE_000_TIP = '8edd68d4ea94af3550b8100796592aafd5a09d97' as const
export const FARMS_MODULE_006_TIP = '86c6c06837477f65963df7a53625b99092a46739' as const
