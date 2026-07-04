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
  apr?: string
  status: PoolStatus
  tvl: string
  liquidity: string
  rewardToken: string
  dailyRewards: string
  multiplier: string
  participants: string
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
  'Community',
  'Locked',
  'Flexible',
  'Highest APR',
  'Newest',
  'AI Suggested',
] as const

export type PoolFilterChip = (typeof POOL_FILTER_CHIPS)[number]
