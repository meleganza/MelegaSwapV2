/**
 * FARMS_MODULE_008 — Final Visual Polish tokens + freeze guards.
 * Style layer only. No geometry tokens that alter Modules 001–007 boxes.
 */

import { FARMS_FOUNDER_MOCKUP } from '../farmsArchitecture000Contracts'
import { farmsHero } from './farmsHeroTokens'
import { farmsOverviewKpis } from './farmsOverviewKpisTokens'
import { farmsMyFarms } from './farmsMyFarmsTokens'
import { farmsExplore } from './farmsExploreFarmsTokens'
import { farmsFinished } from './farmsFinishedFarmsTokens'
import { farmsYieldAdvisor } from './farmsYieldAdvisorTokens'
import { farmsAnalytics } from './farmsAnalyticsTokens'

export const farmsVisualPolish = {
  moduleId: '008-final-visual-polish',
  architectureId: 'FARMS_ARCHITECTURE_000',
  mockupSha256: FARMS_FOUNDER_MOCKUP.sha256,
  module001MockupSha256: farmsHero.mockupSha256,
  module002MockupSha256: farmsOverviewKpis.mockupSha256,
  module003MockupSha256: farmsMyFarms.mockupSha256,
  module004MockupSha256: farmsExplore.mockupSha256,
  module005MockupSha256: farmsFinished.mockupSha256,
  module006MockupSha256: farmsYieldAdvisor.mockupSha256,
  module007MockupSha256: farmsAnalytics.mockupSha256,

  /** Restrained gold (Liquidity / Pools / Passport parity) — focus / accent only */
  gold: '#C9A84A',
  goldHover: '#D4B45C',
  goldFocus: 'rgba(201, 168, 74, 0.55)',
  goldFocusSoft: 'rgba(201, 168, 74, 0.45)',

  canvas: '#0D0D0D',
  cardBg: 'rgba(18, 18, 18, 0.98)',
  borderSoft: 'rgba(255, 255, 255, 0.05)',
  borderHover: 'rgba(255, 255, 255, 0.12)',
  insetHighlight: 'rgba(255, 255, 255, 0.03)',
  cardShadow: '0 16px 40px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.03)',

  transitionMs: '120ms',
  transitionEase: 'ease',

  focusOutline: '2px solid rgba(201, 168, 74, 0.55)',
  focusOffset: '2px',

  scope: '[data-farms-studio-screen]',
} as const

export const FARMS_MODULE_001_FREEZE_SHA256 = {
  FarmsHeroModule: 'b22879b18e899567942bc7db24339c2baf70c8997c579fcadef1ac90aa57de7b',
  FarmsHeroArtwork: 'a0e3e58813fa642da6a5d8b9a18722e8b2b4efc40cb260f14cc102a10647bc16',
  FarmsHeroTrustPanel: '7e047bc5fd4b162a411dbbc41c2fe5168b8817447672ad362ca1122830756fa2',
  farmsHeroTokens: 'f4672464d452b42d3a045dcd397616432190245fc5618fbf0174d2b2f58e7d26',
} as const

export const FARMS_MODULE_002_FREEZE_SHA256 = {
  FarmsOverviewKpisModule: '437c77f4c7e5a0e461031a9ae63ae7dd68b72ba609e5176ddff077d0cb1fe1b3',
  farmsOverviewKpisTokens: '90e937117f57aab418e096a2b7572fd259e524a6304493b0b832bc198a57e390',
  buildFarmsOverviewKpis: '86bfed331f8a935ba3c1b0379142d845b09fd568c7ad0413c73ecfe075a76696',
  useFarmsOverviewKpis: '3ccf7513fb70c538e4f0e8ef82a913f2c0a2119c57fc5022fa2fef721c6f5146',
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

export const FARMS_MODULE_007_FREEZE_SHA256 = {
  FarmsAnalyticsModule: 'e369e7e82921e6df3ad94ac084bc31602255367199ad7cf4150e4f1613246e56',
  FarmsAnalyticsPanel: '20f763f751042af96d9333bba020ef554a6f2802b3b91fc2601dd5acda051f30',
  buildFarmsAnalytics: '7f59ff1638f5943377781a4b5ae5d11ce98e19c199597588ca90cdec2b82987d',
  useFarmsAnalytics: '4efae2eeb1e70a154753d54eb27001ec311806c7ede74545627972c356757a9b',
  farmsAnalyticsTokens: '2e6b22c173251259f0aa962732bc93488fdebba2c67a4022fa6390b28e29cbf4',
  farmsAnalyticsTypes: '5008b24c7b411899d8a782575672613321fa4299b4a17a64d638cf18dbf055f4',
} as const

export const FARMS_ARCHITECTURE_000_TIP = '8edd68d4ea94af3550b8100796592aafd5a09d97' as const
export const FARMS_MODULE_007_TIP = '17a901c9eb3ce26420642a959d17b6dfe2b6f447' as const
