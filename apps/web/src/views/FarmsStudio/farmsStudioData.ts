import BigNumber from 'bignumber.js'
import type { FarmWithStakedValue } from '@pancakeswap/farms'

export type FarmStatus = 'live' | 'new' | 'finished' | 'indexing' | 'coming-soon'

export interface FarmsKpiItem {
  id: string
  label: string
  value: string
  delta?: string
  deltaPositive?: boolean
  gold?: boolean
  sparkline?: number[]
}

export interface FarmAnalyzePreview {
  aprHistory: string
  rewardToken: string
  emission: string
  contract: string
  risk: string
}

export interface FarmPreviewCard {
  id: string
  pair: string
  tokens: [string, string]
  apr?: string
  status: FarmStatus
  tvl: string
  dailyRewards: string
  multiplier: string
  liquidity: string
  cta?: 'stake' | 'analyze' | 'none'
  analyzePreview?: FarmAnalyzePreview
  /** Runtime fields (R018) */
  pid?: number
  rawFarm?: FarmWithStakedValue
  userStaked?: BigNumber
  pendingReward?: BigNumber
  displayApr?: string
  lpLabel?: string
  rewardToken?: string
  participants?: string
}

export interface FarmsActivityRow {
  time: string
  pair: string
  action: string
  amount: string
  rewards: string
  status: 'indexed' | 'preview'
  actionTone?: 'green' | 'gold' | 'muted'
  hash?: string
}

export const DEFAULT_ANALYZE_PREVIEW: FarmAnalyzePreview = {
  aprHistory: '7d stable',
  rewardToken: 'MARCO',
  emission: '—',
  contract: 'Indexed',
  risk: 'Low',
}

export const FARM_FILTER_CHIPS = [
  'All',
  'MARCO',
  'Stable',
  'High APR',
  'New',
  'My Farms',
  'Finished',
  'AI Suggested',
] as const

export type FarmFilterChip = (typeof FARM_FILTER_CHIPS)[number]
