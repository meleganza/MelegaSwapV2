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
  PoolsMyPositionCard: 'c82b69687c0307ddc6e340115b100ce3934b7c460b5e50748de5eb22adbc10b2',
  buildPoolsWalletPositions: '86932a90c0222dc09118b34c0849b400f44bb274726f6bf73883d6b6ca40109a',
  usePoolsWalletPositions: '1839b8bc5664055dfc937aab615f3b21c4e81c3d5e958a270fa1b0df28e2b03e',
  poolsMyPositionsTokens: 'fef2040e5a14dbf7959d56ed9cddd4fa7fe03893c437a397d6da8551d001a3d2',
  poolsMyPositionsTypes: '162db03cd8cd722d1519d60027b00b09655354353239faff568ba7b5d0d01604',
} as const

export const POOLS_MODULE_004_FREEZE_SHA256 = {
  PoolsExplorePoolsModule: '6bfdf31cf77059100bd1a2beb005877e755f23b8611836ad6edc056a87e4ee5b',
  PoolsExplorePoolCard: '351029da38628fd539fd8f782b404e862b8ba329d144bf8eab453ef49aff14f4',
  buildPoolsExplorePools: 'e811bb9583d8ea15a40953ace491cb8ecd3596ee8ffca0c961fd011d378a515f',
  usePoolsExplorePools: 'ecc1b46a006b4deb389916a130db2a0be50b5fa95bde6c9190e92e5da13f4cf8',
  poolsExplorePoolsTokens: '995a05b8534c9fe8f19121f35eb8a63998ef45f37489dd67adaa0de32c5e3f83',
  poolsExplorePoolsTypes: '0892a81122b0f503135533bf55aae988b36ffb3c8e494fc298d149ae495e0628',
} as const
