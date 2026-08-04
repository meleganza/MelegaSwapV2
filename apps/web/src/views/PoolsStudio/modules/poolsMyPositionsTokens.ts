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
  PoolsHeroModule: 'be37dd431672468faf033738028f4550d85cdd54df5f5ca080ad0e3fe7f6370f',
  PoolsHeroArtwork: 'cd6c93acc6df9135ec3b3c56e6126682efd7c1b8f8170b6d33e24b7cdf4289b5',
  PoolsHeroTrustPanel: '4c01ee32b3d4e3a14fc48a5e1ce49f0c0fc337e99ef49eb95b6e2557ed806270',
  poolsHeroTokens: '4003c03f3e58db4fc4f3ffcdc4f13a2c646d88a4649a189190ca9cccd3209d89',
} as const

export const POOLS_MODULE_002_FREEZE_SHA256 = {
  PoolsOverviewKpisModule: '0720b1472bf8a821114e92cad1bdc1dde795c8a1a0f4d1119e009438a885d5d1',
  usePoolsOverviewKpis: '2a5e47402bac991c2323706c83841a65676eaff2e57f65f22cc7d8ed4e5146e0',
  poolsOverviewKpisTokens: '66dc7fe4a6d8c9fe6e512a9704ccf9b55c488e0e6cae5982dfe51e3cd9f1d3e9',
  poolsOverviewKpisTypes: 'ea61d37fa5a98ef344e63005af12f9109b2e9e188dc1cec3cbd911855a5d8d67',
} as const
