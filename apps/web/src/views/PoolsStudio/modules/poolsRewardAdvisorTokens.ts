/**
 * POOLS_MODULE_006 — Reward Advisor geometry + freeze guards.
 * Desktop slot matches Module 003 reserved 424×360.
 */

import { POOLS_FOUNDER_MOCKUP } from '../poolsArchitecture000Contracts'
import { poolsHero } from './poolsHeroTokens'
import { poolsOverviewKpis } from './poolsOverviewKpisTokens'
import { poolsMyPositions } from './poolsMyPositionsTokens'
import { poolsExplore } from './poolsExplorePoolsTokens'
import { poolsFinished } from './poolsFinishedPoolsTokens'

export const poolsRewardAdvisor = {
  moduleId: '006-reward-advisor',
  architectureId: 'POOLS_ARCHITECTURE_000',
  mockupSha256: POOLS_FOUNDER_MOCKUP.sha256,
  module001MockupSha256: poolsHero.mockupSha256,
  module002MockupSha256: poolsOverviewKpis.mockupSha256,
  module003MockupSha256: poolsMyPositions.mockupSha256,
  module004MockupSha256: poolsExplore.mockupSha256,
  module005MockupSha256: poolsFinished.mockupSha256,

  /** Exact Module 003 reserved slot */
  slotW: '424px',
  slotH: '360px',
  maxVisible: 4,

  radius: '16px',
  border: '1px solid rgba(255,255,255,0.085)',
  bg: 'linear-gradient(145deg, rgba(18,18,18,0.98) 0%, rgba(12,12,12,0.98) 100%)',
  shadow: '0 16px 36px rgba(0,0,0,0.26), inset 0 1px 0 rgba(255,255,255,0.025)',

  headerH: '48px',
  titleSize: '15px',
  titleLine: '20px',
  titleWeight: 750,
  titleColor: '#F5F5F5',

  cardPad: '10px 12px',
  cardGap: '8px',
  cardRadius: '10px',
  cardBorder: '1px solid rgba(255,255,255,0.08)',
  cardBg: 'rgba(22,22,22,0.96)',

  gold: '#F4C430',
  focusRing: '2px solid #F4C430',
  focusOffset: '2px',
  touchMin: '44px',

  highAprThreshold: 20,
  endingSoonRemainingPct: 15,

  mobileBreak: '767px',
  tabletBreak: '1199px',
  slotSelector: '[data-pools-module-006-slot="reserved"]',
} as const

export const POOLS_MODULE_001_FREEZE_SHA256 = {
  PoolsHeroModule: 'ff831d8355a2b3624e160099b5f7a9b077d14d2502f8db37967bd258f515465a',
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
  PoolsMyPositionCard: '746fd5944e9ca6eac2a4000729c00d3d95c56267cad82bdc533995c40567b63e',
  buildPoolsWalletPositions: 'eff68c42e591c8dc90035a3547abe49ca46db4906318729535411eec58e53655',
  usePoolsWalletPositions: '1839b8bc5664055dfc937aab615f3b21c4e81c3d5e958a270fa1b0df28e2b03e',
  poolsMyPositionsTokens: '3fd412c005aacc920816cfafb13a9befca5415e6c4bfcaaf9c882446869cf5aa',
  poolsMyPositionsTypes: 'dfb8388c5c8feba9478e85e776505499ca80534afc8e9eced52784ebe1be2713',
} as const

export const POOLS_MODULE_004_FREEZE_SHA256 = {
  PoolsExplorePoolsModule: '006f341f4b135b9cc2efc22f87c206926cb63ad144b36dc3518a89b06590909c',
  PoolsExplorePoolCard: 'c8cd5f68ea9b6703c4433c8af53b8e1dc1ea58735ff597240d8874fe9bf19869',
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
  poolsFinishedPoolsTokens: '461d18a152d8b7b0be43ff8063cb226e03ceaee1f9a69dbce455a696d4ef00df',
  poolsFinishedPoolsTypes: '6ad0d327797b7d115c8c8e315310c16c10ef9fba3b0ed4a2468d2bf7afcbe056',
} as const
