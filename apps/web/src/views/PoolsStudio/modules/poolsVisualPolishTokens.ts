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
  PoolsHeroModule: 'be37dd431672468faf033738028f4550d85cdd54df5f5ca080ad0e3fe7f6370f',
  PoolsHeroArtwork: 'cd6c93acc6df9135ec3b3c56e6126682efd7c1b8f8170b6d33e24b7cdf4289b5',
  PoolsHeroTrustPanel: '4c01ee32b3d4e3a14fc48a5e1ce49f0c0fc337e99ef49eb95b6e2557ed806270',
  poolsHeroTokens: '4003c03f3e58db4fc4f3ffcdc4f13a2c646d88a4649a189190ca9cccd3209d89',
} as const

export const POOLS_MODULE_002_FREEZE_SHA256 = {
  PoolsOverviewKpisModule: '0720b1472bf8a821114e92cad1bdc1dde795c8a1a0f4d1119e009438a885d5d1',
  usePoolsOverviewKpis: '2a5e47402bac991c2323706c83841a65676eaff2e57f65f22cc7d8ed4e5146e0',
  poolsOverviewKpisTokens: '66dc7fe4a6d8c9fe6e512a9704ccf9b55c488e0e6cae5982dfe51e3cd9f1d3e9',
  poolsOverviewKpisTypes: 'ea61d37fa5a98ef344e63005af12f9109b2e9e188dc1cec3cbd911855a5d8d67',
} as const

export const POOLS_MODULE_003_FREEZE_SHA256 = {
  PoolsMyPositionsModule: '2608c6b201e987193c67018c9dea87ea4d03c3360226c0b716f904f35591544e',
  PoolsMyPositionCard: 'e31f52e00fc34be5018a9bc978a6b37f33d08010801b7bd543a54fe62d62ecb0',
  buildPoolsWalletPositions: 'eff68c42e591c8dc90035a3547abe49ca46db4906318729535411eec58e53655',
  usePoolsWalletPositions: '7d5ffa26144cca40c4d5b7e3ea59115e4a2cac86fcde511e95419869e0b77189',
  poolsMyPositionsTokens: '643610c70b41dc55b2dd80588469f805dc871acd113b0746d0a2033a9dbfc1fe',
  poolsMyPositionsTypes: 'dfb8388c5c8feba9478e85e776505499ca80534afc8e9eced52784ebe1be2713',
} as const

export const POOLS_MODULE_004_FREEZE_SHA256 = {
  PoolsExplorePoolsModule: '006f341f4b135b9cc2efc22f87c206926cb63ad144b36dc3518a89b06590909c',
  PoolsExplorePoolCard: 'a9d5fef8b90eea57091f63562136c1f989146747a23dc6ba50e87d5fe9d85b31',
  buildPoolsExplorePools: 'cd1372919363f22ac58971f007177f80ff4542517006649074492d174e56bf85',
  usePoolsExplorePools: '698aa42fe598f4bf09fb20c8b23f8d65e420a7d5254d2115badc389c8d3e209c',
  poolsExplorePoolsTokens: 'c06a55c5b6a5f628fbcf4a5b9820873de94936cf1c544d189629d249aa09d4ad',
  poolsExplorePoolsTypes: 'c7ce0b77f007ab06d21b3ba1f1e0b7e2684ff164b170f55bde94e595abbd5fe3',
} as const

export const POOLS_MODULE_005_FREEZE_SHA256 = {
  PoolsFinishedPoolsModule: '42d904687b45e0fe2788d2b94c60118dda1a176ee6502a9208947b2dc50a53ec',
  PoolsFinishedPoolCard: '776ddedc9d06d17c4bf7ac27a0bdad8ab46dc60fc7be8705d4f8875cbf225a84',
  buildPoolsFinishedPools: '6faf81b57a731d9fe2be33260a08d8a4581ed7adc1c7c335ac267b9ca273f395',
  usePoolsFinishedPools: 'e030c4662e941042954fa460921c82bd134339685928bb79c107c15950d6a64c',
  poolsFinishedPoolsTokens: '07deb40ff491206cf3990fba9da56117074f53cf082f2ed15f20628bb3597dab',
  poolsFinishedPoolsTypes: '6ad0d327797b7d115c8c8e315310c16c10ef9fba3b0ed4a2468d2bf7afcbe056',
} as const

export const POOLS_MODULE_006_FREEZE_SHA256 = {
  PoolsRewardAdvisorModule: '9ab963e6815f4dfc116aa1be4870761761fd7817129f092ffdaeb9f45ff3130d',
  PoolsRewardAdvisorCard: 'cde3f4a486bcf60552aeb1cd9a2770ce2bc02910ce444ccbe8d0b78465c574e8',
  buildPoolsRewardAdvisor: 'c4013a019cd180a351ac633831bd70974217bd913374460e5d54c3319e7ab40d',
  usePoolsRewardAdvisor: '0e59b77545d64877e7a491d1cf984ac38afa8c82e597b7d9be0a8b231cbeb52b',
  poolsRewardAdvisorTokens: '2a8c191ffd9bf1fb12c6879cd277892ff96f47a1466440ffd94b3acdf679f8ea',
  poolsRewardAdvisorTypes: 'd62dd3c1a49b5602a26e8ce526629424b8d28a5b7096638a643a42059eaf1b7c',
} as const

export const POOLS_MODULE_007_FREEZE_SHA256 = {
  PoolsAnalyticsModule: '50d7f74d5fd46e4314b78568665a120a611f7ed09274c83092a176d9c12e68c1',
  PoolsAnalyticsPanel: '131af6a398bd127bd2d37a185151471034f0e94fcd0db08d1fba76e17d2b1765',
  buildPoolsAnalytics: '425c0450775343242479c0a2f406b9fe89a68a5d13de6adffef4a1686640d927',
  usePoolsAnalytics: '38cb0c0117705cea8d9dbf34866e48917fdf19586a78e37ea7851dab4e19338f',
  poolsAnalyticsTokens: '7d4d1933a7d6024a45dc5179bc6a97dce20f294fb94386d8eefa1dfc8f7ca580',
  poolsAnalyticsTypes: 'cc940dd2af8dba8f8282be1b1a0f622024aa46c4ef58263646d866a77f1c05ba',
} as const
