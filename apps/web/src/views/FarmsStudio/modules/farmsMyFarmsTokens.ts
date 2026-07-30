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
  FarmsHeroModule: '3c03cf796944468c138c4ae5f95623a4c67d4e813613f3b4cc4692ff020c9b4b',
  FarmsHeroArtwork: '1a8f4b669d2314b045303b1fd582c3adc752e983a0c2457f793ebd5700671442',
  FarmsHeroTrustPanel: '7e047bc5fd4b162a411dbbc41c2fe5168b8817447672ad362ca1122830756fa2',
  farmsHeroTokens: '5ac42c58d6638d97140f798ea715a5763ca742f23553867b689d14c1cebd95c6',
} as const

export const FARMS_MODULE_002_FREEZE_SHA256 = {
  FarmsOverviewKpisModule: '04d23c5fa731fda81cc8b16c6deebb2a3f25cf5e5cd350a41a6713950ece5877',
  farmsOverviewKpisTokens: '860bd89e305c98d363abf8ab3925cbb1ad4ae10acc9065f43caf010c7743c388',
  buildFarmsOverviewKpis: '93c0858ba9992234bf75a7ed7f0f23c00d4d5b6e922aa044cdc853850475af59',
  useFarmsOverviewKpis: 'f7ef59571a3935d5f944ef8a70e2afb6878c05214d3816c79787aca337199124',
  farmsOverviewKpisTypes: 'bfce9e6eb2a73988b8f73969e71170918f5345ec09ec11d88b127b90e219c8b9',
} as const
