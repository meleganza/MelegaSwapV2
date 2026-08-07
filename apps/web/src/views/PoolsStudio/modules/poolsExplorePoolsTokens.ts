/**
 * POOLS_MODULE_004 — Explore Pools geometry + freeze guards.
 */

import { POOLS_FOUNDER_MOCKUP } from '../poolsArchitecture000Contracts'
import { poolsHero } from './poolsHeroTokens'
import { poolsOverviewKpis } from './poolsOverviewKpisTokens'
import { poolsMyPositions } from './poolsMyPositionsTokens'

export const poolsExplore = {
  moduleId: '004-explore-pools',
  architectureId: 'POOLS_ARCHITECTURE_000',
  mockupSha256: POOLS_FOUNDER_MOCKUP.sha256,
  module001MockupSha256: poolsHero.mockupSha256,
  module002MockupSha256: poolsOverviewKpis.mockupSha256,
  module003MockupSha256: poolsMyPositions.mockupSha256,

  contentMax: '1376px',
  topGapAfterPositions: '16px',

  cardW: '328px',
  cardH: '268px',
  cardGap: '12px',
  cardPad: '12px',
  cardRadius: '12px',
  cardBorder: '1px solid rgba(255,255,255,0.085)',
  cardBg: 'linear-gradient(145deg, rgba(18,18,18,0.98) 0%, rgba(12,12,12,0.98) 100%)',
  cardShadow: '0 14px 32px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.025)',

  titleSize: '16px',
  titleLine: '22px',
  titleWeight: 750,
  titleColor: '#F5F5F5',
  descSize: '12px',
  descLine: '16px',
  descColor: 'rgba(255,255,255,0.52)',

  gold: '#F4C430',
  focusRing: '2px solid #F4C430',
  focusOffset: '2px',
  touchMin: '44px',

  toolbarH: '52px',
  mobileBreak: '767px',
  tabletBreak: '1199px',
  // Founder amendment P0-9 density breakpoints (mobile-first cascade, matches Farms).
  smallTabletBreak: '768px',
  tabletPortraitBreak: '1025px',
  desktopBreak: '1200px',
  ultraWideBreak: '1920px',
  mobile390CardW: '326px',
  mobile430CardW: '366px',
  mobileContent390: '358px',
  mobileContent430: '398px',
} as const

export const POOLS_EXPLORE_FILTERS = [
  'All',
  'Single Asset',
  'LP',
  'Flexible',
  'Locked',
  'High APR',
  'Highest TVL',
  'Newest',
] as const

export const POOLS_EXPLORE_SORTS = ['Highest APR', 'Highest TVL', 'Newest', 'Alphabetical'] as const

/** Frozen Module 001–003 source SHAs (byte-identical guards). */
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
  PoolsMyPositionsModule: 'b95fd3658ed6462becb079ac714216e8d8de406d902e49320ad1c997bf36f369',
  PoolsMyPositionCard: 'e31f52e00fc34be5018a9bc978a6b37f33d08010801b7bd543a54fe62d62ecb0',
  buildPoolsWalletPositions: 'eff68c42e591c8dc90035a3547abe49ca46db4906318729535411eec58e53655',
  usePoolsWalletPositions: '7d5ffa26144cca40c4d5b7e3ea59115e4a2cac86fcde511e95419869e0b77189',
  poolsMyPositionsTokens: 'da8287a187df8e21e8b2aed5a90009069c04dbf4c41bdb3adbd711225290f269',
  poolsMyPositionsTypes: 'dfb8388c5c8feba9478e85e776505499ca80534afc8e9eced52784ebe1be2713',
} as const
