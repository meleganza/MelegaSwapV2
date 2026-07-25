/**
 * POOLS_MODULE_003 — My Positions geometry + visual tokens.
 * Preserves Module 001 / 002 freeze SHAs by reference only.
 */

import { POOLS_FOUNDER_MOCKUP } from '../poolsArchitecture000Contracts'
import { poolsHero } from './poolsHeroTokens'
import { poolsOverviewKpis } from './poolsOverviewKpisTokens'

export const poolsMyPositions = {
  moduleId: '003-my-positions',
  architectureId: 'POOLS_ARCHITECTURE_000',
  mockupSha256: POOLS_FOUNDER_MOCKUP.sha256,
  module001MockupSha256: poolsHero.mockupSha256,
  module002MockupSha256: poolsOverviewKpis.mockupSha256,

  contentMax: '1376px',
  topGapAfterKpis: '16px',

  rowW: '1376px',
  leftW: '936px',
  columnGap: '16px',
  rightSlotW: '424px',

  moduleH: '360px',
  moduleRadius: '16px',
  moduleBorder: '1px solid rgba(255,255,255,0.085)',
  moduleBg: 'linear-gradient(145deg, rgba(18,18,18,0.98) 0%, rgba(12,12,12,0.98) 100%)',
  moduleShadow: '0 16px 36px rgba(0,0,0,0.26), inset 0 1px 0 rgba(255,255,255,0.025)',

  headerH: '60px',
  headerPadX: '18px',
  titleSize: '16px',
  titleLine: '22px',
  titleWeight: 750,
  titleColor: '#F5F5F5',

  countMinW: '24px',
  countH: '22px',
  countRadius: '999px',
  countBg: 'rgba(244,196,48,0.18)',
  countColor: '#F4C430',
  countSize: '11px',

  viewAllW: '128px',
  viewAllH: '34px',

  contentPadX: '18px',
  contentW: '900px',
  cardW: '288px',
  cardH: '276px',
  cardGap: '18px',
  cardPad: '16px',
  cardRadius: '13px',
  cardBorder: '1px solid rgba(255,255,255,0.08)',
  cardBg: 'rgba(19,19,19,0.96)',

  stakeLogo: 32,
  rewardLogo: 24,
  logoOverlap: -8,

  cardTitleSize: '17px',
  cardTitleLine: '22px',
  cardSubtitleSize: '11px',
  cardSubtitleLine: '15px',
  cardSubtitleColor: 'rgba(255,255,255,0.50)',

  statusH: '24px',
  statusRadius: '999px',

  gold: '#F4C430',
  focusRing: '2px solid #F4C430',
  focusOffset: '2px',

  mobileBreak: '767px',
  tabletBreak: '1199px',
  tabletStackMax: '1199px',

  mobile390ModuleW: '358px',
  mobile390CardW: '326px',
  mobile430ModuleW: '398px',
  mobile430CardW: '366px',
  mobileHeaderH: '56px',
  mobileCardMinH: '250px',
  mobileCardGap: '10px',
  touchMin: '44px',

  maxVisibleDesktop: 3,
} as const

/** Frozen Module 001 / 002 source SHAs (byte-identical guard). */
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
