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
