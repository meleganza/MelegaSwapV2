/**
 * FARMS_MODULE_002 — Overview KPI geometry + labels.
 * No mock market values. Module 001 Hero sources are byte-frozen.
 */

import { FARMS_FOUNDER_MOCKUP } from '../farmsArchitecture000Contracts'
import { farmsHero } from './farmsHeroTokens'

export const FARMS_MODULE_001_FREEZE_SHA256 = {
  FarmsHeroModule: 'b22879b18e899567942bc7db24339c2baf70c8997c579fcadef1ac90aa57de7b',
  FarmsHeroArtwork: 'a0e3e58813fa642da6a5d8b9a18722e8b2b4efc40cb260f14cc102a10647bc16',
  FarmsHeroTrustPanel: '7e047bc5fd4b162a411dbbc41c2fe5168b8817447672ad362ca1122830756fa2',
  farmsHeroTokens: 'f4672464d452b42d3a045dcd397616432190245fc5618fbf0174d2b2f58e7d26',
} as const

export const farmsOverviewKpis = {
  moduleId: '002-overview-kpis',
  architectureId: 'FARMS_ARCHITECTURE_000',
  mockupSha256: FARMS_FOUNDER_MOCKUP.sha256,
  module001MockupSha256: farmsHero.mockupSha256,

  contentMax: '1376px',
  topGapAfterHero: '16px',
  moduleW: '1376px',
  moduleH: '112px',

  cardW: '216px',
  cardH: '112px',
  cardGap: '16px',
  cardPad: '16px',
  cardRadius: '14px',
  cardBorder: '1px solid rgba(255,255,255,0.08)',
  cardBg: 'linear-gradient(145deg, rgba(18,18,18,0.98) 0%, rgba(13,13,13,0.98) 100%)',
  cardShadow: '0 12px 30px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.025)',

  iconTile: '24px',
  labelSize: '10px',
  labelLine: '14px',
  labelColor: 'rgba(255,255,255,0.52)',
  valueSize: '24px',
  valueLine: '29px',
  valueColor: '#F6F6F6',
  supportSize: '10px',
  supportLine: '14px',
  gold: '#F4C430',
  focusRing: '2px solid #F4C430',

  mobileBreak: '767px',
  tabletBreak: '1199px',
  mobile390CardW: '171px',
  mobile430CardW: '191px',
  mobileContent390: '358px',
  mobileContent430: '398px',
} as const

export const FARMS_OVERVIEW_KPI_ORDER = [
  'tvl',
  'activeFarms',
  'activeFarmers',
  'rewards24h',
  'sustainableApr',
  'harvestable',
] as const

export type FarmsOverviewKpiId = (typeof FARMS_OVERVIEW_KPI_ORDER)[number]

export const FARMS_OVERVIEW_KPI_LABELS: Record<FarmsOverviewKpiId, string> = {
  tvl: 'Total Farm TVL',
  activeFarms: 'Active Farms',
  activeFarmers: 'Active Farmers',
  rewards24h: '24H Rewards',
  sustainableApr: 'Highest Sustainable APR',
  harvestable: 'My Harvestable',
}
