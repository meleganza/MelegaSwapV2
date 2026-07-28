/**
 * FARMS_MODULE_003 — My Farms geometry and prior-module freeze guards.
 */
import { FARMS_FOUNDER_MOCKUP } from '../farmsArchitecture000Contracts'
import { farmsHero } from './farmsHeroTokens'
import { farmsOverviewKpis } from './farmsOverviewKpisTokens'

export const farmsMyFarms = {
  moduleId: '003-my-farms',
  architectureId: 'FARMS_ARCHITECTURE_000',
  mockupSha256: FARMS_FOUNDER_MOCKUP.sha256,
  module001MockupSha256: farmsHero.mockupSha256,
  module002MockupSha256: farmsOverviewKpis.mockupSha256,
  contentMax: '1376px', rowW: '1376px', leftW: '936px', columnGap: '16px', rightSlotW: '424px',
  moduleH: '360px', moduleRadius: '16px', moduleBorder: '1px solid rgba(255,255,255,0.085)',
  moduleBg: 'linear-gradient(145deg, rgba(18,18,18,0.98), rgba(12,12,12,0.98))',
  moduleShadow: '0 16px 36px rgba(0,0,0,0.26), inset 0 1px 0 rgba(255,255,255,0.025)',
  headerH: '60px', headerPadX: '18px', titleSize: '16px', titleLine: '22px', titleWeight: 750, titleColor: '#F5F5F5',
  countMinW: '24px', countH: '22px', countRadius: '999px', countBg: 'rgba(244,196,48,0.18)', countColor: '#F4C430', countSize: '11px',
  viewAllW: '116px', viewAllH: '34px', contentPadX: '18px', contentW: '900px',
  cardW: '288px', cardH: '276px', cardGap: '18px', cardPad: '16px', cardRadius: '13px',
  cardBorder: '1px solid rgba(255,255,255,0.08)', cardBg: 'rgba(19,19,19,0.96)',
  stakeLogo: 32, rewardLogo: 22, logoOverlap: -8,
  statusH: '24px', statusRadius: '999px', gold: '#F4C430', focusRing: '2px solid #F4C430', focusOffset: '2px',
  mobileBreak: '767px', tabletBreak: '1199px', mobileHeaderH: '56px', mobileCardMinH: '250px', mobileCardGap: '10px',
  touchMin: '44px', maxVisibleDesktop: 3,
} as const

export const FARMS_MODULE_001_FREEZE_SHA256 = {
  FarmsHeroModule: 'd9c56b4f1bd572229de1c58dcacd9efd1ae4f1f05f3a8df6854c3edcb15e640b',
  FarmsHeroArtwork: 'a0e3e58813fa642da6a5d8b9a18722e8b2b4efc40cb260f14cc102a10647bc16',
  FarmsHeroTrustPanel: 'ce9af36cc5b752098a5b448ba2566368c8f3c625e83c9358e09c24687f26270c',
  farmsHeroTokens: 'eb192bfabfcf4c87cb08751732aa12e8d7960190f7ebd62f43b016e033eea06c',
} as const

export const FARMS_MODULE_002_FREEZE_SHA256 = {
  FarmsOverviewKpisModule: '437c77f4c7e5a0e461031a9ae63ae7dd68b72ba609e5176ddff077d0cb1fe1b3',
  farmsOverviewKpisTokens: 'c1578f74830d1aa4361808a18e86df926590b46c8e110240f92416668469f91b',
  buildFarmsOverviewKpis: 'f26b480e7e805fc39341c9e5bf79fa8ed9f02c5b24180313f6487a5b435932d5',
  useFarmsOverviewKpis: 'd93791d3f7f1676ec98f92aadcb0f11a396b1c4fad3074b70efdfa50e637173c',
  farmsOverviewKpisTypes: 'bfce9e6eb2a73988b8f73969e71170918f5345ec09ec11d88b127b90e219c8b9',
} as const
