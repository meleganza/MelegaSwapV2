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
  PoolsHeroModule: 'd5195e2445d3bf795f17edac5019145510f5426242eeb27bf5223dd3427ff203',
  PoolsHeroArtwork: 'cd6c93acc6df9135ec3b3c56e6126682efd7c1b8f8170b6d33e24b7cdf4289b5',
  PoolsHeroTrustPanel: '4c01ee32b3d4e3a14fc48a5e1ce49f0c0fc337e99ef49eb95b6e2557ed806270',
  poolsHeroTokens: '2b50e203ae405f28bbfd18da4304e72eb6875a4514db88fbf66ddf66d7b38d13',
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
  poolsMyPositionsTokens: 'da8287a187df8e21e8b2aed5a90009069c04dbf4c41bdb3adbd711225290f269',
  poolsMyPositionsTypes: 'dfb8388c5c8feba9478e85e776505499ca80534afc8e9eced52784ebe1be2713',
} as const

export const POOLS_MODULE_004_FREEZE_SHA256 = {
  PoolsExplorePoolsModule: 'f0926fde06ef578ec671f98424d63b76204767839dbaafd10e87ab3f4ee34f3a',
  PoolsExplorePoolCard: 'd7e856bd00043b5211ed959ff44498d02131d5bbe6c6ec5493af16a14a46d65c',
  buildPoolsExplorePools: 'c80cd727def90bf9db2ca89d28962b7c3a554d033f7c07eeb59b286e14153366',
  usePoolsExplorePools: 'e6eb54e31ed62267bb7f115e69d67d001bee0b88179801ae836b9724579701ab',
  poolsExplorePoolsTokens: '19121ca8b5fc9f3568cee7559aea8de6cad28575d08f7d63b1200d7adc96150b',
  poolsExplorePoolsTypes: 'b541a400da143334cc4ed7bd15f23362974212f41359114ab500b1627fb11d78',
} as const

export const POOLS_MODULE_005_FREEZE_SHA256 = {
  PoolsFinishedPoolsModule: '42d904687b45e0fe2788d2b94c60118dda1a176ee6502a9208947b2dc50a53ec',
  PoolsFinishedPoolCard: '776ddedc9d06d17c4bf7ac27a0bdad8ab46dc60fc7be8705d4f8875cbf225a84',
  buildPoolsFinishedPools: '6faf81b57a731d9fe2be33260a08d8a4581ed7adc1c7c335ac267b9ca273f395',
  usePoolsFinishedPools: 'e030c4662e941042954fa460921c82bd134339685928bb79c107c15950d6a64c',
  poolsFinishedPoolsTokens: '0ea2d36ffe08a57bf4e7f4b5037490120582192dc822bad5bb87a2c3fe28b76f',
  poolsFinishedPoolsTypes: '6ad0d327797b7d115c8c8e315310c16c10ef9fba3b0ed4a2468d2bf7afcbe056',
} as const
