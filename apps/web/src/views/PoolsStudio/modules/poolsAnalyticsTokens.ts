/**
 * POOLS_MODULE_007 — Analytics geometry + freeze guards.
 * Desktop: 1376 × 240, four equal panels, 18px gap.
 */

import { POOLS_FOUNDER_MOCKUP } from '../poolsArchitecture000Contracts'
import { poolsHero } from './poolsHeroTokens'
import { poolsOverviewKpis } from './poolsOverviewKpisTokens'
import { poolsMyPositions } from './poolsMyPositionsTokens'
import { poolsExplore } from './poolsExplorePoolsTokens'
import { poolsFinished } from './poolsFinishedPoolsTokens'
import { poolsRewardAdvisor } from './poolsRewardAdvisorTokens'

export const poolsAnalytics = {
  moduleId: '007-analytics',
  architectureId: 'POOLS_ARCHITECTURE_000',
  mockupSha256: POOLS_FOUNDER_MOCKUP.sha256,
  module001MockupSha256: poolsHero.mockupSha256,
  module002MockupSha256: poolsOverviewKpis.mockupSha256,
  module003MockupSha256: poolsMyPositions.mockupSha256,
  module004MockupSha256: poolsExplore.mockupSha256,
  module005MockupSha256: poolsFinished.mockupSha256,
  module006MockupSha256: poolsRewardAdvisor.mockupSha256,

  contentMax: '1376px',
  moduleH: '240px',
  panelGap: '18px',
  /** (1376 − 3×18) / 4 = 330.5 */
  panelW: '330.5px',
  panelH: '240px',

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
    ended: '#8A8A8A',
    emergency: '#FF6B6B',
    withdraw: '#F4C430',
    healthy: '#3DDC97',
    partial: '#F4C430',
    unavailable: '#8A8A8A',
    rewarding: '#4DA3FF',
  },

  mobileBreak: '767px',
  tabletBreak: '1199px',
  maxRewardTokens: 5,
} as const

export const POOLS_MODULE_001_FREEZE_SHA256 = {
  PoolsHeroModule: '82f2fdc1d4fb98a9f7e74e46177decaf270f4e1cb8e35e967316c5fa04c66b21',
  PoolsHeroArtwork: 'cd6c93acc6df9135ec3b3c56e6126682efd7c1b8f8170b6d33e24b7cdf4289b5',
  PoolsHeroTrustPanel: '4f8689ae4895fac14292123185600219ecc16cb6df4cd5dfc1ed1c12a68d027c',
  poolsHeroTokens: '7d0feebaba9779a20ae14384e91605903000330fa3911dcc3596110ad13ab469',
} as const

export const POOLS_MODULE_002_FREEZE_SHA256 = {
  PoolsOverviewKpisModule: '0720b1472bf8a821114e92cad1bdc1dde795c8a1a0f4d1119e009438a885d5d1',
  usePoolsOverviewKpis: 'f162a452a9201619a0987301dbba80717036be273c7489a6beb83aac9574bd15',
  poolsOverviewKpisTokens: '1c684b1319d5fce87615a146af50019ed1072acab2972e09ba07af9a0e136421',
  poolsOverviewKpisTypes: '6f13ae436ec3652714f241bc24e25d328e60be6147d42a2e60952a4bef973799',
} as const

export const POOLS_MODULE_003_FREEZE_SHA256 = {
  PoolsMyPositionsModule: 'b930d18351eff0d9ad45e025ac019b8de9870fb935e97acbd6484837577fde80',
  PoolsMyPositionCard: 'ad215b98fdebfa956f87ba4c38c2980af1d4705db937d06b5c7e21590f19ffa9',
  buildPoolsWalletPositions: '2e5159531973810eb4606a25f00bb4210a2d5b29cc2099f2ee5d5be68eb9e9f2',
  usePoolsWalletPositions: 'e17c71eec24f5202b0a6b4381f610442cd4d9491bf793f2698d9957e8c383733',
  poolsMyPositionsTokens: '2380e92914acbf1b1fe50ad5ff24f3caa38e9755befcbd2041042bc2450b0843',
  poolsMyPositionsTypes: '162db03cd8cd722d1519d60027b00b09655354353239faff568ba7b5d0d01604',
} as const

export const POOLS_MODULE_004_FREEZE_SHA256 = {
  PoolsExplorePoolsModule: '6bfdf31cf77059100bd1a2beb005877e755f23b8611836ad6edc056a87e4ee5b',
  PoolsExplorePoolCard: '351029da38628fd539fd8f782b404e862b8ba329d144bf8eab453ef49aff14f4',
  buildPoolsExplorePools: 'e811bb9583d8ea15a40953ace491cb8ecd3596ee8ffca0c961fd011d378a515f',
  usePoolsExplorePools: '73fe0112f5101a4395422e87761efc940734953abe03d8cb61b58fc5338e69b6',
  poolsExplorePoolsTokens: '24861c6c19e88fc6426523327bfc2bbc4467307964a842c930c5309f99a475cc',
  poolsExplorePoolsTypes: '0892a81122b0f503135533bf55aae988b36ffb3c8e494fc298d149ae495e0628',
} as const

export const POOLS_MODULE_005_FREEZE_SHA256 = {
  PoolsFinishedPoolsModule: '42d904687b45e0fe2788d2b94c60118dda1a176ee6502a9208947b2dc50a53ec',
  PoolsFinishedPoolCard: 'd505ab78bb70231a3382310419f496e582c2517bc097bc9265fb0e33295954ca',
  buildPoolsFinishedPools: '6faf81b57a731d9fe2be33260a08d8a4581ed7adc1c7c335ac267b9ca273f395',
  usePoolsFinishedPools: 'e030c4662e941042954fa460921c82bd134339685928bb79c107c15950d6a64c',
  poolsFinishedPoolsTokens: '9bb365b8b9708afa852e30d6a8b9e8965a624b84a207437fe165b209a3d78207',
  poolsFinishedPoolsTypes: '6ad0d327797b7d115c8c8e315310c16c10ef9fba3b0ed4a2468d2bf7afcbe056',
} as const

export const POOLS_MODULE_006_FREEZE_SHA256 = {
  PoolsRewardAdvisorModule: '9ab963e6815f4dfc116aa1be4870761761fd7817129f092ffdaeb9f45ff3130d',
  PoolsRewardAdvisorCard: 'cde3f4a486bcf60552aeb1cd9a2770ce2bc02910ce444ccbe8d0b78465c574e8',
  buildPoolsRewardAdvisor: 'c4013a019cd180a351ac633831bd70974217bd913374460e5d54c3319e7ab40d',
  usePoolsRewardAdvisor: '0e59b77545d64877e7a491d1cf984ac38afa8c82e597b7d9be0a8b231cbeb52b',
  poolsRewardAdvisorTokens: '21b9211a41b8f05f9af8898726965d9d513f45709283a772ba1871e01097afea',
  poolsRewardAdvisorTypes: 'd62dd3c1a49b5602a26e8ce526629424b8d28a5b7096638a643a42059eaf1b7c',
} as const
