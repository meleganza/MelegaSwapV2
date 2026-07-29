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

export const POOLS_MODULE_004_FREEZE_SHA256 = {
  PoolsExplorePoolsModule: '6bfdf31cf77059100bd1a2beb005877e755f23b8611836ad6edc056a87e4ee5b',
  PoolsExplorePoolCard: '873c13c486d70fd78236aa03d01ea1d029c6872ac37990f87f1cb4c2127540f7',
  buildPoolsExplorePools: 'cd1372919363f22ac58971f007177f80ff4542517006649074492d174e56bf85',
  usePoolsExplorePools: 'fe352c81e6201e5aad70b9d1316576603670211299d78a6ceaff56de7aad33f3',
  poolsExplorePoolsTokens: 'e2cc7955af9ac9d8ccccd8d894bbdb699bcb3bb665842b6994fc5c63d159d8d1',
  poolsExplorePoolsTypes: 'c7ce0b77f007ab06d21b3ba1f1e0b7e2684ff164b170f55bde94e595abbd5fe3',
} as const

export const POOLS_MODULE_005_FREEZE_SHA256 = {
  PoolsFinishedPoolsModule: '42d904687b45e0fe2788d2b94c60118dda1a176ee6502a9208947b2dc50a53ec',
  PoolsFinishedPoolCard: '0c50f70da2d5ed741e0fe8132fb0da8158109cfa6edd17de8c05f3ccc1638d95',
  buildPoolsFinishedPools: '6faf81b57a731d9fe2be33260a08d8a4581ed7adc1c7c335ac267b9ca273f395',
  usePoolsFinishedPools: 'e030c4662e941042954fa460921c82bd134339685928bb79c107c15950d6a64c',
  poolsFinishedPoolsTokens: '2470bddb5dbf2cf770beb892d203f25dc79ef78cf64952971b5fd926f81f847d',
  poolsFinishedPoolsTypes: '6ad0d327797b7d115c8c8e315310c16c10ef9fba3b0ed4a2468d2bf7afcbe056',
} as const
