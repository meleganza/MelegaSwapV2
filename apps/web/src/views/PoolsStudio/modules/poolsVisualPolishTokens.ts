/**
 * POOLS_MODULE_008 — Final Visual Polish tokens + freeze guards.
 * Style layer only. No geometry tokens that alter Modules 001–007 boxes.
 */

import { POOLS_FOUNDER_MOCKUP } from '../poolsArchitecture000Contracts'
import { poolsHero } from './poolsHeroTokens'
import { poolsOverviewKpis } from './poolsOverviewKpisTokens'
import { poolsMyPositions } from './poolsMyPositionsTokens'
import { poolsExplore } from './poolsExplorePoolsTokens'
import { poolsFinished } from './poolsFinishedPoolsTokens'
import { poolsRewardAdvisor } from './poolsRewardAdvisorTokens'
import { poolsAnalytics } from './poolsAnalyticsTokens'

export const poolsVisualPolish = {
  moduleId: '008-final-visual-polish',
  architectureId: 'POOLS_ARCHITECTURE_000',
  mockupSha256: POOLS_FOUNDER_MOCKUP.sha256,
  module001MockupSha256: poolsHero.mockupSha256,
  module002MockupSha256: poolsOverviewKpis.mockupSha256,
  module003MockupSha256: poolsMyPositions.mockupSha256,
  module004MockupSha256: poolsExplore.mockupSha256,
  module005MockupSha256: poolsFinished.mockupSha256,
  module006MockupSha256: poolsRewardAdvisor.mockupSha256,
  module007MockupSha256: poolsAnalytics.mockupSha256,

  /** Restrained gold (Liquidity / Passport parity) — focus / accent only */
  gold: '#C9A84A',
  goldHover: '#D4B45C',
  goldFocus: 'rgba(201, 168, 74, 0.55)',
  goldFocusSoft: 'rgba(201, 168, 74, 0.45)',

  canvas: '#0B0B0B',
  cardBg: 'rgba(18, 18, 18, 0.98)',
  borderSoft: 'rgba(255, 255, 255, 0.05)',
  borderHover: 'rgba(255, 255, 255, 0.12)',
  insetHighlight: 'rgba(255, 255, 255, 0.03)',
  cardShadow: '0 16px 40px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.03)',

  transitionMs: '120ms',
  transitionEase: 'ease',

  focusOutline: '1px solid rgba(201, 168, 74, 0.55)',
  focusOffset: '2px',

  scope: '[data-pools-studio-screen]',
} as const

export const POOLS_MODULE_001_FREEZE_SHA256 = {
  PoolsHeroModule: '59e9ebd1d22eddc2786a3edb9567ad3dbe1e27c756f1b11b3334ebcaf3a4644f',
  PoolsHeroArtwork: 'cd6c93acc6df9135ec3b3c56e6126682efd7c1b8f8170b6d33e24b7cdf4289b5',
  PoolsHeroTrustPanel: '4c01ee32b3d4e3a14fc48a5e1ce49f0c0fc337e99ef49eb95b6e2557ed806270',
  poolsHeroTokens: '4003c03f3e58db4fc4f3ffcdc4f13a2c646d88a4649a189190ca9cccd3209d89',
} as const

export const POOLS_MODULE_002_FREEZE_SHA256 = {
  PoolsOverviewKpisModule: '0720b1472bf8a821114e92cad1bdc1dde795c8a1a0f4d1119e009438a885d5d1',
  usePoolsOverviewKpis: 'b902f2dad92d4d3ae3fa52b98c69f383fb068da90d7d409a5b4d0aecb47785d6',
  poolsOverviewKpisTokens: 'f4180aebb935e53075be0f501d7a17be0eacf02caf000234dfe90cb34c9e75ba',
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

export const POOLS_MODULE_007_FREEZE_SHA256 = {
  PoolsAnalyticsModule: '50d7f74d5fd46e4314b78568665a120a611f7ed09274c83092a176d9c12e68c1',
  PoolsAnalyticsPanel: '131af6a398bd127bd2d37a185151471034f0e94fcd0db08d1fba76e17d2b1765',
  buildPoolsAnalytics: '425c0450775343242479c0a2f406b9fe89a68a5d13de6adffef4a1686640d927',
  usePoolsAnalytics: '38cb0c0117705cea8d9dbf34866e48917fdf19586a78e37ea7851dab4e19338f',
  poolsAnalyticsTokens: '4e12bcf45751711a86322894a0700631e141a97d0695c89ab87f879c0046b3c7',
  poolsAnalyticsTypes: 'cc940dd2af8dba8f8282be1b1a0f622024aa46c4ef58263646d866a77f1c05ba',
} as const
