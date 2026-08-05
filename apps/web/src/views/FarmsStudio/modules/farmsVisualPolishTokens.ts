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
  FarmsHeroModule: '65d046c35fd1c273c21e02eef4c15da3389f905c727b7dbc88ee80564669fed3',
  FarmsHeroArtwork: '1a8f4b669d2314b045303b1fd582c3adc752e983a0c2457f793ebd5700671442',
  FarmsHeroTrustPanel: '7e047bc5fd4b162a411dbbc41c2fe5168b8817447672ad362ca1122830756fa2',
  farmsHeroTokens: '6102837dcb221a52afab13a86bef3efaa295cca2748021fa6c37bc93bd04795f',
} as const

export const FARMS_MODULE_002_FREEZE_SHA256 = {
  FarmsOverviewKpisModule: '04d23c5fa731fda81cc8b16c6deebb2a3f25cf5e5cd350a41a6713950ece5877',
  farmsOverviewKpisTokens: '37e2f98032f21e0de55754439ecca409c934f824b8b616f6d354d7734973fc89',
  buildFarmsOverviewKpis: '93c0858ba9992234bf75a7ed7f0f23c00d4d5b6e922aa044cdc853850475af59',
  useFarmsOverviewKpis: 'f7ef59571a3935d5f944ef8a70e2afb6878c05214d3816c79787aca337199124',
  farmsOverviewKpisTypes: 'bfce9e6eb2a73988b8f73969e71170918f5345ec09ec11d88b127b90e219c8b9',
} as const

export const FARMS_MODULE_003_FREEZE_SHA256 = {
  FarmsMyFarmsModule: 'af6a59567f70801b4271c18b8610338f00471f6b0d6a4b62cef4c2270a1cf92e',
  FarmsMyFarmCard: 'f6948da196b85bd96f97055db9e9e1acf63fa3982704039da99d6301ad7ca629',
  farmsMyFarmsTokens: '1add9f0333d156bc18638d9806ded867aac4a81127f34ca624b3c17bfb432c01',
  farmsMyFarmsTypes: '59e1dc2b025d2fcdd1c37b7b7326baea1508458b7af42c523e4acffa265cf8fc',
  buildFarmsWalletPositions: '01c57977914530f4ad941645c3f2f516ad02af875019c0bb05f68ddd26e32ee5',
  useFarmsWalletPositions: '30d7f27335beea626a36edb40594cabae734105fd373e8489fd6cc85cad9253b',
} as const

export const FARMS_MODULE_004_FREEZE_SHA256 = {
  FarmsExploreFarmsModule: 'bca1bb7a334d36fe8824523c0016f18427473f9c6617125336d60e8f764b41c6',
  FarmsExploreFarmCard: 'f0df89cf453f2ab40bed243225755ef1061b35cfbb1323b911c5d17ddde00a84',
  farmsExploreFarmsTokens: 'c4dbd557892c0517549148f65da75e54583b29eb592643519b52fd151f686ea6',
  farmsExploreFarmsTypes: 'f7d40c5bbac21920a7c5c731eb828a395eda8421e9c6e6f9d9c98ccbc3ef24fb',
  buildFarmsExploreFarms: '1a2d7730e7430e1cc1e83860b0a28451ed8d6e5cbc1536f676effcf4cfbceccc',
  useFarmsExploreFarms: '489389398f3b714515e6ff1d1aa3cd0bb828950f76643584ec6b9d4772523deb',
} as const

export const FARMS_MODULE_005_FREEZE_SHA256 = {
  FarmsFinishedFarmsModule: '0fb2efe12d6eeef7e7896c4071e356cfd4efe7f75054af3622f941e837364bcf',
  FarmsFinishedFarmCard: '8db717eee8b4b356c192f009bad74e55c50cd007484b2131e8cc1a7be5f11abd',
  farmsFinishedFarmsTokens: '495afb520b34df2abf469e23998a00947c15747b582f7c28d081209dc91084aa',
  farmsFinishedFarmsTypes: '395114197f8c111479dd1486ea21df5707d16f2d480390a4a6adeb164757d4fc',
  buildFarmsFinishedFarms: 'b058737f8699b75d8b2baa5bb1c823ce280de41ec7d87665468cef81f2d548d8',
  useFarmsFinishedFarms: '163703cb9671d3ea2bccac5a9f618f00993f53be3fbf009835315bc86cc3653d',
} as const

export const FARMS_MODULE_006_FREEZE_SHA256 = {
  FarmsYieldAdvisorModule: '38a249133e0d64841c517beccc7ea2df8dd4aba3ea96c1f06e1554443442d38d',
  FarmsYieldAdvisorCard: '28d318a28251cfa6f9340a244eb667b740d4f4aa1432ec6b470e2ba94a1d9b4d',
  farmsYieldAdvisorTokens: '3cfb4c75805b1fa2bc6ad578a742ec8a75812f20e97ff12be8ad7b331cc48aa3',
  farmsYieldAdvisorTypes: 'ed9e30ac59809df0f62759cf9fa73ce4dbec07c5f498e49bac8263db3453ca61',
  buildFarmsYieldAdvisor: 'b23d0a2a064b92e717ccb2f71b2cab346ea66f6d64809b8e96ba6a8ba7714c05',
  useFarmsYieldAdvisor: 'e404ab29e946d22b4d1d40d2ca66f161c126adc0c92d61a67d8a5f9679ac3116',
} as const

export const FARMS_MODULE_007_FREEZE_SHA256 = {
  FarmsAnalyticsModule: 'e369e7e82921e6df3ad94ac084bc31602255367199ad7cf4150e4f1613246e56',
  FarmsAnalyticsPanel: '20f763f751042af96d9333bba020ef554a6f2802b3b91fc2601dd5acda051f30',
  buildFarmsAnalytics: '7f59ff1638f5943377781a4b5ae5d11ce98e19c199597588ca90cdec2b82987d',
  useFarmsAnalytics: '4efae2eeb1e70a154753d54eb27001ec311806c7ede74545627972c356757a9b',
  farmsAnalyticsTokens: '65c34734905b5fa03f2a0ac135cdbcc0012a7630fae233c7000834db481d9a8e',
  farmsAnalyticsTypes: '5008b24c7b411899d8a782575672613321fa4299b4a17a64d638cf18dbf055f4',
} as const

export const FARMS_ARCHITECTURE_000_TIP = '8edd68d4ea94af3550b8100796592aafd5a09d97' as const
export const FARMS_MODULE_007_TIP = '17a901c9eb3ce26420642a959d17b6dfe2b6f447' as const
