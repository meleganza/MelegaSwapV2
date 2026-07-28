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
  FarmsHeroModule: 'b22879b18e899567942bc7db24339c2baf70c8997c579fcadef1ac90aa57de7b',
  FarmsHeroArtwork: 'a0e3e58813fa642da6a5d8b9a18722e8b2b4efc40cb260f14cc102a10647bc16',
  FarmsHeroTrustPanel: '7e047bc5fd4b162a411dbbc41c2fe5168b8817447672ad362ca1122830756fa2',
  farmsHeroTokens: 'f4672464d452b42d3a045dcd397616432190245fc5618fbf0174d2b2f58e7d26',
} as const

export const FARMS_MODULE_002_FREEZE_SHA256 = {
  FarmsOverviewKpisModule: '437c77f4c7e5a0e461031a9ae63ae7dd68b72ba609e5176ddff077d0cb1fe1b3',
  farmsOverviewKpisTokens: '90e937117f57aab418e096a2b7572fd259e524a6304493b0b832bc198a57e390',
  buildFarmsOverviewKpis: '86bfed331f8a935ba3c1b0379142d845b09fd568c7ad0413c73ecfe075a76696',
  useFarmsOverviewKpis: '3ccf7513fb70c538e4f0e8ef82a913f2c0a2119c57fc5022fa2fef721c6f5146',
  farmsOverviewKpisTypes: 'bfce9e6eb2a73988b8f73969e71170918f5345ec09ec11d88b127b90e219c8b9',
} as const
