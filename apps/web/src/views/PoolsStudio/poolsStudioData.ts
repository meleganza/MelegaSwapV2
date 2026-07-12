import BigNumber from 'bignumber.js'
import { Token } from '@pancakeswap/sdk'
import { Pool } from '@pancakeswap/uikit'
import { VaultKey } from 'state/types'
import type { PoolLifecycleFlags } from 'lib/data-truth/poolLifecycle'

export type PoolStatus = 'live' | 'indexing' | 'ended'

export type PoolVisibilityStatus = 'VISIBLE' | 'HIDDEN' | 'DISCOVERABLE'

export type PoolDiscoveryClass =
  | 'tradeable'
  | 'liquidity_present'
  | 'inactive'
  | 'metadata_incomplete'
  | 'invalid_contract'

export type PoolTab = 'all' | 'positions' | 'finished'

export type PoolsSortMode = 'apr' | 'tvl' | 'budget' | 'newest'

export interface PoolsKpiItem {
  id: string
  label: string
  value: string
  secondary?: string
  delta?: string
  deltaPositive?: boolean
  gold?: boolean
  green?: boolean
}

export interface PoolAnalyzePreview {
  rewardBudget: string
  remainingRewards: string
  dailyEmission: string
  emissionEndEstimate: string
  aprHistory: string
  rewardSustainability: string
  risk: string
  contractAddress: string
  contractExplorerUrl: string
  sousChefAddress: string
  depositFee: string
  withdrawFee: string
  harvestInterval: string
  autoCompound: string
  poolVersion: string
  created: string
  lastUpdated: string
  rewardToken: string
  emission: string
  contract: string
  rewardContract: string
  stakeContract: string
  tokenExplorerUrl: string
  estimatedRoi: string
  duration: string
  poolHistory: string
  transactions: string
}

export interface PoolPreviewCard {
  id: string
  name: string
  tokens: string[]
  stakeToken?: string
  apr?: string
  aprExact?: number
  rawApr?: number
  sustainableAprDisplay?: string
  aprDisplayReason?: string
  currentApr?: string
  status: PoolStatus
  displayStatus?: 'LIVE' | 'ENDED' | 'INDEXING'
  visibilityStatus?: PoolVisibilityStatus
  discoveryClass?: PoolDiscoveryClass
  hiddenReason?: string
  hiddenReasonLabel?: string
  lifecycle?: PoolLifecycleFlags
  healthScore?: number
  rewardBadge?: 'Official' | 'Partner' | 'Community'
  visualType?: string
  tvl: string
  rewardToken: string
  dailyRewards: string
  estimatedDailyReward?: string
  remainingRewards?: string
  remainingRewardsPct?: number
  remainingRewardsTone?: 'green' | 'yellow' | 'red'
  rewardBudgetUsd?: string
  estimatedDuration?: string
  participants: string
  lockPeriod?: string
  cooldown?: string
  poolSafetyRisk?: 'Very Low' | 'Low' | 'Medium' | 'High'
  rewardSustainability?: string
  sustainabilityScore?: number
  weeklyRewards?: string
  monthlyRewards?: string
  contractAddress?: string
  stakeContractAddress?: string
  rewardContractAddress?: string
  contractLabel?: string
  explorerUrl?: string
  stakeExplorerUrl?: string
  rewardExplorerUrl?: string
  cta?: 'stake' | 'analyze' | 'none'
  analyzePreview?: PoolAnalyzePreview
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
  'Partner',
  'Community',
  'Flexible',
  '30–90 Days',
  '90–180 Days',
  '180–365 Days',
  '365+ Days',
  'Auto Compound',
] as const

export type PoolFilterChip = (typeof POOL_FILTER_CHIPS)[number]
