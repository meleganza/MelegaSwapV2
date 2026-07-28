/**
 * FARMS_MODULE_002 — Overview KPI geometry + labels.
 * No mock market values. Module 001 Hero sources are byte-frozen.
 */

import { FARMS_FOUNDER_MOCKUP } from '../farmsArchitecture000Contracts'
import { farmsHero } from './farmsHeroTokens'

export const FARMS_MODULE_001_FREEZE_SHA256 = {
  FarmsHeroModule: 'd9c56b4f1bd572229de1c58dcacd9efd1ae4f1f05f3a8df6854c3edcb15e640b',
  FarmsHeroArtwork: 'a0e3e58813fa642da6a5d8b9a18722e8b2b4efc40cb260f14cc102a10647bc16',
  FarmsHeroTrustPanel: 'ce9af36cc5b752098a5b448ba2566368c8f3c625e83c9358e09c24687f26270c',
  farmsHeroTokens: 'eb192bfabfcf4c87cb08751732aa12e8d7960190f7ebd62f43b016e033eea06c',
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
