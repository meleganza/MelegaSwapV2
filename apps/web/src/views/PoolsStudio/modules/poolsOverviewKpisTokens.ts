/**
 * POOLS_MODULE_002 — Overview KPI geometry + labels.
 * No mock market values.
 */

import { POOLS_FOUNDER_MOCKUP } from '../poolsArchitecture000Contracts'
import { poolsHero } from './poolsHeroTokens'

export const poolsOverviewKpis = {
  moduleId: '002-overview-kpis',
  architectureId: 'POOLS_ARCHITECTURE_000',
  mockupSha256: POOLS_FOUNDER_MOCKUP.sha256,
  module001MockupSha256: poolsHero.mockupSha256,

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

export const POOLS_OVERVIEW_KPI_ORDER = [
  'tvl',
  'discovered',
  'rewarding',
  'rewards24h',
  'sustainableApr',
  'claimable',
] as const

export type PoolsOverviewKpiId = (typeof POOLS_OVERVIEW_KPI_ORDER)[number]

export const POOLS_OVERVIEW_KPI_LABELS: Record<PoolsOverviewKpiId, string> = {
  tvl: 'Total Value Locked',
  discovered: 'Pools Discovered',
  rewarding: 'Pools Rewarding',
  rewards24h: 'Total Rewards — 24H',
  sustainableApr: 'Highest Sustainable APR',
  claimable: 'My Claimable',
}
