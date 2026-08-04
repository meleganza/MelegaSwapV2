/**
 * FARMS_MODULE_002 — Overview KPI geometry + labels.
 * No mock market values. Module 001 Hero sources are byte-frozen.
 */

import { FARMS_FOUNDER_MOCKUP } from '../farmsArchitecture000Contracts'
import { farmsHero } from './farmsHeroTokens'

export const FARMS_MODULE_001_FREEZE_SHA256 = {
  FarmsHeroModule: '65d046c35fd1c273c21e02eef4c15da3389f905c727b7dbc88ee80564669fed3',
  FarmsHeroArtwork: '1a8f4b669d2314b045303b1fd582c3adc752e983a0c2457f793ebd5700671442',
  FarmsHeroTrustPanel: '7e047bc5fd4b162a411dbbc41c2fe5168b8817447672ad362ca1122830756fa2',
  farmsHeroTokens: '6102837dcb221a52afab13a86bef3efaa295cca2748021fa6c37bc93bd04795f',
} as const

export const farmsOverviewKpis = {
  moduleId: '002-overview-kpis',
  architectureId: 'FARMS_ARCHITECTURE_000',
  mockupSha256: FARMS_FOUNDER_MOCKUP.sha256,
  module001MockupSha256: farmsHero.mockupSha256,

  contentMax: '1376px',
  topGapAfterHero: '16px',
  moduleW: '1376px',
  moduleH: '96px',

  cardW: '216px',
  cardH: '96px',
  cardGap: '16px',
  cardPad: '12px 14px',
  cardRadius: '12px',
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
  harvestable: 'My Claimable',
}
