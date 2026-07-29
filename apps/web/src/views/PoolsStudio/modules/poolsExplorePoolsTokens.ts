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
  PoolsHeroModule: '61aa5f9a5ac872f51373d4ef18aacac662c4a67bb580d16a6bf3e8a79031994f',
  PoolsHeroArtwork: 'cd6c93acc6df9135ec3b3c56e6126682efd7c1b8f8170b6d33e24b7cdf4289b5',
  PoolsHeroTrustPanel: '4c01ee32b3d4e3a14fc48a5e1ce49f0c0fc337e99ef49eb95b6e2557ed806270',
  poolsHeroTokens: '4003c03f3e58db4fc4f3ffcdc4f13a2c646d88a4649a189190ca9cccd3209d89',
} as const

export const POOLS_MODULE_002_FREEZE_SHA256 = {
  PoolsOverviewKpisModule: '0720b1472bf8a821114e92cad1bdc1dde795c8a1a0f4d1119e009438a885d5d1',
  usePoolsOverviewKpis: '0b873985c479f44bc1b94fab679b40b8ac8cc76ea414d274e6cfc2f3f31fbcf9',
  poolsOverviewKpisTokens: '66dc7fe4a6d8c9fe6e512a9704ccf9b55c488e0e6cae5982dfe51e3cd9f1d3e9',
  poolsOverviewKpisTypes: '6f13ae436ec3652714f241bc24e25d328e60be6147d42a2e60952a4bef973799',
} as const

export const POOLS_MODULE_003_FREEZE_SHA256 = {
  PoolsMyPositionsModule: 'b930d18351eff0d9ad45e025ac019b8de9870fb935e97acbd6484837577fde80',
  PoolsMyPositionCard: '033db4c5e6686af024a8ed7e104467b18e110da578a6e0c77436f7ca86f3f1c9',
  buildPoolsWalletPositions: '86932a90c0222dc09118b34c0849b400f44bb274726f6bf73883d6b6ca40109a',
  usePoolsWalletPositions: '1839b8bc5664055dfc937aab615f3b21c4e81c3d5e958a270fa1b0df28e2b03e',
  poolsMyPositionsTokens: '8a1fa5582192ac422a0fbc00f0ee80085cf172224f4b3c999fd700e0a1551af7',
  poolsMyPositionsTypes: '162db03cd8cd722d1519d60027b00b09655354353239faff568ba7b5d0d01604',
} as const
