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

export const POOLS_MODULE_005_FREEZE_SHA256 = {
  PoolsFinishedPoolsModule: '42d904687b45e0fe2788d2b94c60118dda1a176ee6502a9208947b2dc50a53ec',
  PoolsFinishedPoolCard: 'd505ab78bb70231a3382310419f496e582c2517bc097bc9265fb0e33295954ca',
  buildPoolsFinishedPools: '6faf81b57a731d9fe2be33260a08d8a4581ed7adc1c7c335ac267b9ca273f395',
  usePoolsFinishedPools: 'e030c4662e941042954fa460921c82bd134339685928bb79c107c15950d6a64c',
  poolsFinishedPoolsTokens: '8b76bcc2722d85327891c9d69582bed40e706f6eac367a48783ff13d01edd129',
  poolsFinishedPoolsTypes: '6ad0d327797b7d115c8c8e315310c16c10ef9fba3b0ed4a2468d2bf7afcbe056',
} as const

export const POOLS_MODULE_006_FREEZE_SHA256 = {
  PoolsRewardAdvisorModule: '9ab963e6815f4dfc116aa1be4870761761fd7817129f092ffdaeb9f45ff3130d',
  PoolsRewardAdvisorCard: 'cde3f4a486bcf60552aeb1cd9a2770ce2bc02910ce444ccbe8d0b78465c574e8',
  buildPoolsRewardAdvisor: 'c4013a019cd180a351ac633831bd70974217bd913374460e5d54c3319e7ab40d',
  usePoolsRewardAdvisor: '0e59b77545d64877e7a491d1cf984ac38afa8c82e597b7d9be0a8b231cbeb52b',
  poolsRewardAdvisorTokens: '50e80c57399e0274edd560f00f2a4e5fe9117bdc90d3cbda15c6bdd6171da3a7',
  poolsRewardAdvisorTypes: 'd62dd3c1a49b5602a26e8ce526629424b8d28a5b7096638a643a42059eaf1b7c',
} as const
