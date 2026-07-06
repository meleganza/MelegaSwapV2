import BigNumber from 'bignumber.js'
import { Token } from '@pancakeswap/sdk'
import { Pool } from '@pancakeswap/uikit'
import { VaultKey } from 'state/types'

export type PoolStatus = 'live' | 'indexing' | 'ended'

export interface PoolsKpiItem {
  id: string
  label: string
  value: string
  delta?: string
  deltaPositive?: boolean
  gold?: boolean
  sparkline?: number[]
}

export interface PoolAnalyzePreview {
  aprHistory: string
  rewardToken: string
  emission: string
  contract: string
  risk: string
  autoCompound: string
  estimatedRoi: string
}

export interface PoolPreviewCard {
  id: string
  name: string
  tokens: string[]
  tokenLogos?: string[]
  stakeToken?: string
  apr?: string
  aprExact?: number
  status: PoolStatus
  displayStatus?: 'LIVE' | 'ENDED' | 'ENDING SOON' | 'NEW' | 'INDEXING'
  visualType?: string
  tvl: string
  liquidity: string
  rewardToken: string
  dailyRewards: string
  estimatedDailyReward?: string
  remainingRewards?: string
  remainingRewardsPct?: number
  remainingRewardsTone?: 'green' | 'yellow' | 'red'
  multiplier: string
  participants: string
  lockPeriod?: string
  cooldown?: string
  rewardSustainability?: string
  sustainabilityScore?: number
  contractAddress?: string
  contractLabel?: string
  explorerUrl?: string
  cta?: 'stake' | 'analyze' | 'none'
  analyzePreview?: PoolAnalyzePreview
  /** Runtime fields (R017) */
  sousId?: number
  vaultKey?: VaultKey
  poolType?: string
  poolTypeLabel?: string
  rawPool?: Pool.DeserializedPool<Token>
  userStaked?: BigNumber
  pendingReward?: BigNumber
}

export interface PoolsActivityRow {
  time: string
  pool: string
  action: string
  amount: string
  reward: string
  status: 'completed' | 'preview' | 'pending'
  actionTone?: 'green' | 'gold' | 'muted'
  hash?: string
}

export const POOL_FILTER_CHIPS = [
  'All',
  'Official',
  'MARCO',
  'Flexible',
  'Fixed',
  'Auto Compound',
  '30 Days',
  '90 Days',
  '180 Days',
  '365 Days',
  'Highest APR',
  'Highest Rewards',
  'Lowest Risk',
  'Newest',
  'Featured',
] as const

export type PoolFilterChip = (typeof POOL_FILTER_CHIPS)[number]
