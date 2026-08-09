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
  PoolsHeroModule: 'd5195e2445d3bf795f17edac5019145510f5426242eeb27bf5223dd3427ff203',
  PoolsHeroArtwork: 'cd6c93acc6df9135ec3b3c56e6126682efd7c1b8f8170b6d33e24b7cdf4289b5',
  PoolsHeroTrustPanel: '4c01ee32b3d4e3a14fc48a5e1ce49f0c0fc337e99ef49eb95b6e2557ed806270',
  poolsHeroTokens: '2b50e203ae405f28bbfd18da4304e72eb6875a4514db88fbf66ddf66d7b38d13',
} as const

export const POOLS_MODULE_002_FREEZE_SHA256 = {
  PoolsOverviewKpisModule: 'ca0cae8991049fff7d399870b7558e136d12a08078bbdc83c29af2aad268dc8a',
  usePoolsOverviewKpis: '2a5e47402bac991c2323706c83841a65676eaff2e57f65f22cc7d8ed4e5146e0',
  poolsOverviewKpisTokens: '66dc7fe4a6d8c9fe6e512a9704ccf9b55c488e0e6cae5982dfe51e3cd9f1d3e9',
  poolsOverviewKpisTypes: 'ea61d37fa5a98ef344e63005af12f9109b2e9e188dc1cec3cbd911855a5d8d67',
} as const

export const POOLS_MODULE_003_FREEZE_SHA256 = {
  PoolsMyPositionsModule: '7bd599e6b1e194d8f9183bda79425d009c84848f22f54892d0284c076873d8db',
  PoolsMyPositionCard: '1e599b176e1d409b3ccb495387a43a1fb3749e6f8bf57c3a72a3e4c951605fc5',
  buildPoolsWalletPositions: 'eff68c42e591c8dc90035a3547abe49ca46db4906318729535411eec58e53655',
  usePoolsWalletPositions: '7d5ffa26144cca40c4d5b7e3ea59115e4a2cac86fcde511e95419869e0b77189',
  poolsMyPositionsTokens: '169693c9d35471f3db94e3fc38cc6d7d0f97adec12c1894499d22be51e9dc6e9',
  poolsMyPositionsTypes: 'dfb8388c5c8feba9478e85e776505499ca80534afc8e9eced52784ebe1be2713',
} as const

export const POOLS_MODULE_004_FREEZE_SHA256 = {
  PoolsExplorePoolsModule: 'b7aa78f244183100fccd0cfa4bad4ad02003bba84b2e4166763c9383b349f7d9',
  PoolsExplorePoolCard: 'dca5ec011ea98b4de71b01f78f0cd85c4b6594cc50e9b74f08ce3b36157714df',
  buildPoolsExplorePools: '3bacf0b1de087a30a1ec2f34c2f1d43bf9b2513908860b88f591dca275274992',
  usePoolsExplorePools: 'e6eb54e31ed62267bb7f115e69d67d001bee0b88179801ae836b9724579701ab',
  poolsExplorePoolsTokens: '067848f51a7f7d1442e0062bfa929e9b3db3130d12a28de7ef7807cce52041ff',
  poolsExplorePoolsTypes: 'a581a34d12cd8fd13197097ef16b3ab4cb53c990b5e379c5852fdf7487a93ac9',
} as const

export const POOLS_MODULE_005_FREEZE_SHA256 = {
  PoolsFinishedPoolsModule: '42d904687b45e0fe2788d2b94c60118dda1a176ee6502a9208947b2dc50a53ec',
  PoolsFinishedPoolCard: '776ddedc9d06d17c4bf7ac27a0bdad8ab46dc60fc7be8705d4f8875cbf225a84',
  buildPoolsFinishedPools: '6faf81b57a731d9fe2be33260a08d8a4581ed7adc1c7c335ac267b9ca273f395',
  usePoolsFinishedPools: 'e030c4662e941042954fa460921c82bd134339685928bb79c107c15950d6a64c',
  poolsFinishedPoolsTokens: 'cb46e112ce4fe5226bb48dd5c29f28292b9bc21a7a976ad03777073dcf707df1',
  poolsFinishedPoolsTypes: '6ad0d327797b7d115c8c8e315310c16c10ef9fba3b0ed4a2468d2bf7afcbe056',
} as const

export const POOLS_MODULE_006_FREEZE_SHA256 = {
  PoolsRewardAdvisorModule: '9ab963e6815f4dfc116aa1be4870761761fd7817129f092ffdaeb9f45ff3130d',
  PoolsRewardAdvisorCard: 'cde3f4a486bcf60552aeb1cd9a2770ce2bc02910ce444ccbe8d0b78465c574e8',
  buildPoolsRewardAdvisor: 'c4013a019cd180a351ac633831bd70974217bd913374460e5d54c3319e7ab40d',
  usePoolsRewardAdvisor: '0e59b77545d64877e7a491d1cf984ac38afa8c82e597b7d9be0a8b231cbeb52b',
  poolsRewardAdvisorTokens: 'bdd6de2dd855f7475b63f99340b91d19f6072f47232217f29f08670927d307cf',
  poolsRewardAdvisorTypes: 'd62dd3c1a49b5602a26e8ce526629424b8d28a5b7096638a643a42059eaf1b7c',
} as const
