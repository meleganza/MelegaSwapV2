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

  cardW: '430px',
  cardH: '248px',
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
