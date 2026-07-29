/**
 * POOLS_MODULE_004 — Explore Pools view-model types.
 * ACTIVE stakeable registry only (no Finished / My Positions).
 */

import type { PoolPreviewCard } from '../poolsStudioData'

export type PoolsExploreStatus = 'ACTIVE' | 'PARTIAL' | 'UNAVAILABLE'

export type PoolsExploreFilter =
  | 'All'
  | 'Single Asset'
  | 'LP'
  | 'Flexible'
  | 'Locked'
  | 'High APR'
  | 'Highest TVL'
  | 'Newest'

export type PoolsExploreSort = 'Highest APR' | 'Highest TVL' | 'Newest' | 'Alphabetical'

export type PoolsExploreLockType =
  | 'Flexible'
  | '30 Days'
  | '90 Days'
  | '180 Days'
  | '365 Days'
  | 'Custom'

export interface PoolsExplorePoolCardModel {
  poolId: string
  title: string
  description: string
  status: PoolsExploreStatus
  statusLabel: 'Active' | 'Partial' | 'Unavailable'
  aprDisplay: string
  aprSupport: string | null
  tvlDisplay: string
  tvlSupport: string | null
  participantsDisplay: string
  lockType: PoolsExploreLockType
  stakeToken: { symbol: string; address: string | null; chainId: number | null }
  rewardToken: { symbol: string; address: string | null; chainId: number | null }
  stakeEnabled: boolean
  stakeLabel: 'Stake' | 'Unavailable'
  detailsHref: string | null
  /** SmartChef / staking contract — required for visible View Contract CTA. */
  contractAddress: string | null
  contractExplorerUrl: string | null
  sourceCard: PoolPreviewCard
  sortApr: number
  sortTvl: number
  sortNewest: number
  sortTitle: string
  isLp: boolean
  isFlexible: boolean
  isLocked: boolean
  partialReasons: string[]
}

export type PoolsExploreModuleState = 'loading' | 'ready' | 'empty' | 'partial' | 'unavailable'

export interface PoolsExplorePoolsViewModel {
  state: PoolsExploreModuleState
  pools: PoolsExplorePoolCardModel[]
  totalActive: number
  filter: PoolsExploreFilter
  sort: PoolsExploreSort
  search: string
  disclosure: string | null
  liveRegion: string
}
