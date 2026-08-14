/**
 * POOLS_MODULE_005 — Finished Pools geometry + freeze guards.
 */

import { POOLS_FOUNDER_MOCKUP } from '../poolsArchitecture000Contracts'
import { poolsHero } from './poolsHeroTokens'
import { poolsOverviewKpis } from './poolsOverviewKpisTokens'
import { poolsMyPositions } from './poolsMyPositionsTokens'
import { poolsExplore } from './poolsExplorePoolsTokens'

export const poolsFinished = {
  moduleId: '005-finished-pools',
  architectureId: 'POOLS_ARCHITECTURE_000',
  mockupSha256: POOLS_FOUNDER_MOCKUP.sha256,
  module001MockupSha256: poolsHero.mockupSha256,
  module002MockupSha256: poolsOverviewKpis.mockupSha256,
  module003MockupSha256: poolsMyPositions.mockupSha256,
  module004MockupSha256: poolsExplore.mockupSha256,

  contentMax: '1376px',
  topGapAfterExplore: '16px',

  cardW: '430px',
  cardH: '240px',
  cardGap: '18px',
  cardPad: '16px',
  cardRadius: '14px',
  cardBorder: '1px solid rgba(255,255,255,0.085)',
  cardBg: 'linear-gradient(145deg, rgba(18,18,18,0.98) 0%, rgba(12,12,12,0.98) 100%)',
  cardShadow: '0 14px 32px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.025)',

  titleSize: '16px',
  titleLine: '22px',
  titleWeight: 750,
  titleColor: '#F5F5F5',

  gold: '#F4C430',
  focusRing: '2px solid #F4C430',
  focusOffset: '2px',
  touchMin: '44px',

  mobileBreak: '767px',
  tabletBreak: '1199px',
  mobileContent390: '358px',
  mobileContent430: '398px',
} as const

/** Frozen Module 001–004 source SHAs. */
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
  PoolsMyPositionsModule: '6f34293df4c41b5b5bcb3e62dc6ec776a069913d04fe55b27e8c158815f97276',
  PoolsMyPositionCard: 'e31f52e00fc34be5018a9bc978a6b37f33d08010801b7bd543a54fe62d62ecb0',
  buildPoolsWalletPositions: 'eff68c42e591c8dc90035a3547abe49ca46db4906318729535411eec58e53655',
  usePoolsWalletPositions: '7d5ffa26144cca40c4d5b7e3ea59115e4a2cac86fcde511e95419869e0b77189',
  poolsMyPositionsTokens: 'afc19ca4e20fac5d0a5f40c488ab10ba56aefb981e2160a74e6606d8b6891131',
  poolsMyPositionsTypes: 'dfb8388c5c8feba9478e85e776505499ca80534afc8e9eced52784ebe1be2713',
} as const

export const POOLS_MODULE_004_FREEZE_SHA256 = {
  PoolsExplorePoolsModule: '3af4c4d4ac07322e2a43d996d2e344b71a675d6fe31067da1ec76902086027be',
  PoolsExplorePoolCard: '5731d03580c5e347994b76ba2d40a39bbd3bad329a77f2c0372a1e7771106f7c',
  buildPoolsExplorePools: '6c575e7fc145aa413872469cfdcf29eddd2920af8775910b02e1617d90d3f639',
  usePoolsExplorePools: 'e6eb54e31ed62267bb7f115e69d67d001bee0b88179801ae836b9724579701ab',
  poolsExplorePoolsTokens: '115e64bf1033870b158a58efdf8cbf9587b8778e173225a3855c7e0e0fd42500',
  poolsExplorePoolsTypes: 'c3b09151a908aea0d3e1a3d8db77ac09d04f6a3b7f3e8c18b5c79064ac9a6183',
} as const
