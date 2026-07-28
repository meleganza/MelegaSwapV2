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
  FarmsHeroModule: 'd9c56b4f1bd572229de1c58dcacd9efd1ae4f1f05f3a8df6854c3edcb15e640b',
  FarmsHeroArtwork: 'a0e3e58813fa642da6a5d8b9a18722e8b2b4efc40cb260f14cc102a10647bc16',
  FarmsHeroTrustPanel: 'ce9af36cc5b752098a5b448ba2566368c8f3c625e83c9358e09c24687f26270c',
  farmsHeroTokens: 'eb192bfabfcf4c87cb08751732aa12e8d7960190f7ebd62f43b016e033eea06c',
} as const

export const FARMS_MODULE_002_FREEZE_SHA256 = {
  FarmsOverviewKpisModule: '437c77f4c7e5a0e461031a9ae63ae7dd68b72ba609e5176ddff077d0cb1fe1b3',
  farmsOverviewKpisTokens: 'c1578f74830d1aa4361808a18e86df926590b46c8e110240f92416668469f91b',
  buildFarmsOverviewKpis: 'f26b480e7e805fc39341c9e5bf79fa8ed9f02c5b24180313f6487a5b435932d5',
  useFarmsOverviewKpis: 'd93791d3f7f1676ec98f92aadcb0f11a396b1c4fad3074b70efdfa50e637173c',
  farmsOverviewKpisTypes: 'bfce9e6eb2a73988b8f73969e71170918f5345ec09ec11d88b127b90e219c8b9',
} as const

export const FARMS_MODULE_003_FREEZE_SHA256 = {
  FarmsMyFarmsModule: 'ec17ce83d74f9822a3ee1e4428f2e4fd1a50b03a2984c185e4e70089f204c21f',
  FarmsMyFarmCard: 'b2669f7571a39f86d668e53cd68a4b5989e6f7708a7ec2bfe8ab8e6c1382f0f2',
  farmsMyFarmsTokens: 'e3ff36d7f62d4c0d6a762cc33385142ee63eb35a6812828b3b8e02cfabcb6e44',
  farmsMyFarmsTypes: '0e5dbf639af54928f1ecb5e010558ed8e95e4eb98119df69775643a8c5ebdd7b',
  buildFarmsWalletPositions: '0efbe107355b2c8f1d0e082d56d4cf8b12f7b8904ab4c508946c86ab4007bae8',
  useFarmsWalletPositions: '1f7db07cd4c03fb6b31454ed7d60ef936f4855fad0c806c2c88d3f2786ab4147',
} as const

export const FARMS_MODULE_004_FREEZE_SHA256 = {
  FarmsExploreFarmsModule: '7c2d2cf8852a97e5e16f4c45413f7088bf8c552a7ca7f420ccf18ca6d6743842',
  FarmsExploreFarmCard: 'fe29452f96a35809893a0308b5248161096da9feefec9bfa4ec94893bdaaece7',
  farmsExploreFarmsTokens: 'a419c5ac3e990150bbbe827098e2c3e8138f8aa56d190378c747ce35561ef485',
  farmsExploreFarmsTypes: '314564befa19bd0e5c0dbbb4ac082e282ae0541ff854a321628f5564644c37ee',
  buildFarmsExploreFarms: '64eda6a26b12412b1dd20ba3d3014da6a2961b1c5837c4237074173eb62ddc1e',
  useFarmsExploreFarms: '0c3ca423e00dbf24037e82c14f1c6e3b5dd5931bbd944086bc6f6c79854ff8e0',
} as const

export const FARMS_MODULE_005_FREEZE_SHA256 = {
  FarmsFinishedFarmsModule: '0fb2efe12d6eeef7e7896c4071e356cfd4efe7f75054af3622f941e837364bcf',
  FarmsFinishedFarmCard: '3d7f6ce136a9c469df142900add0712496cca4640d0e23a0dcc4efbd50366eaa',
  farmsFinishedFarmsTokens: 'd4e4c7eab23392e89ec66fbf7a9a647828b57926215c281f7a8dba448cf87a9f',
  farmsFinishedFarmsTypes: '395114197f8c111479dd1486ea21df5707d16f2d480390a4a6adeb164757d4fc',
  buildFarmsFinishedFarms: '6507c580589af70bed9381fd242569dc824627df1a72a5f7f04a0d1f91b8a9fd',
  useFarmsFinishedFarms: '163703cb9671d3ea2bccac5a9f618f00993f53be3fbf009835315bc86cc3653d',
} as const

export const FARMS_MODULE_006_FREEZE_SHA256 = {
  FarmsYieldAdvisorModule: '38a249133e0d64841c517beccc7ea2df8dd4aba3ea96c1f06e1554443442d38d',
  FarmsYieldAdvisorCard: '28d318a28251cfa6f9340a244eb667b740d4f4aa1432ec6b470e2ba94a1d9b4d',
  farmsYieldAdvisorTokens: 'a450382883c67670fc78b3315e376e891693ebd129e69d1f7d1282fcb16360d3',
  farmsYieldAdvisorTypes: 'ed9e30ac59809df0f62759cf9fa73ce4dbec07c5f498e49bac8263db3453ca61',
  buildFarmsYieldAdvisor: 'b23d0a2a064b92e717ccb2f71b2cab346ea66f6d64809b8e96ba6a8ba7714c05',
  useFarmsYieldAdvisor: 'e404ab29e946d22b4d1d40d2ca66f161c126adc0c92d61a67d8a5f9679ac3116',
} as const

export const FARMS_ARCHITECTURE_000_TIP = '8edd68d4ea94af3550b8100796592aafd5a09d97' as const
export const FARMS_MODULE_006_TIP = '86c6c06837477f65963df7a53625b99092a46739' as const
