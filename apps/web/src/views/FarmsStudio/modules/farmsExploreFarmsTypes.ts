/**
 * FARMS_MODULE_004 — Explore Farms view-model types.
 * ACTIVE stakeable LP registry only (no Finished / My Farms archive).
 */

import type { FarmPreviewCard } from '../farmsStudioData'

export type FarmsExploreStatus = 'ACTIVE' | 'PARTIAL' | 'UNAVAILABLE'

export type FarmsExploreFilter =
  | 'All'
  | 'Stable LP'
  | 'Volatile LP'
  | 'Native Pair'
  | 'High APR'
  | 'High TVL'
  | 'Wallet Has LP'
  | 'Approved'
  | 'Stakeable Now'

export type FarmsExploreSort =
  | 'Highest TVL'
  | 'Highest Sustainable APR'
  | 'Newest'

export type FarmsExploreAllowanceState = 'Approval required' | 'Approved' | 'Unavailable' | 'Disconnected'

export type FarmsExplorePrimaryAction =
  | 'Connect Wallet'
  | 'Switch Network'
  | 'Approve LP'
  | 'Approving…'
  | 'Stake LP'
  | 'Staking…'
  | 'Transaction Confirmed'
  | 'Transaction Failed'
  | 'Farm Unavailable'

export interface FarmsExploreTokenRef {
  symbol: string
  name: string | null
  address: string | null
  chainId: number | null
}

export interface ExploreFarmViewModel {
  farmId: string
  pid: number | null
  masterbuilder: string | null
  chainId: number
  lpToken: FarmsExploreTokenRef
  token0: FarmsExploreTokenRef
  token1: FarmsExploreTokenRef
  rewardToken: FarmsExploreTokenRef
  status: FarmsExploreStatus
  statusLabel: 'Active' | 'Partial' | 'Unavailable'
  depositEnabled: boolean
  apr: string
  aprLabel: 'Sustainable APR' | 'APR'
  aprState: 'Live' | 'Partial' | 'APR unavailable'
  sustainableApr: string | null
  tvl: string
  tvlState: 'Live' | 'Partial valuation' | 'TVL unavailable'
  multiplier: string | null
  rewardRate: string | null
  totalStaked: string | null
  userWalletLpBalance: string | null
  userWalletLpBalanceState: 'available' | 'zero' | 'unavailable' | 'disconnected'
  allowanceState: FarmsExploreAllowanceState
  source: string
  freshness: 'live' | 'stale' | 'partial'
  partialData: boolean
  partialReasons: string[]
  errorState: string | null
  provenance: string
  title: string
  earnLine: string
  primaryAction: FarmsExplorePrimaryAction
  stakeEnabled: boolean
  detailsHref: string | null
  sourceCard: FarmPreviewCard
  sortApr: number
  sortAprAvailable: boolean
  sortTvl: number
  sortTvlAvailable: boolean
  sortNewest: number
  sortNewestAvailable: boolean
  sortTitle: string
  sortWalletLp: number
  sortWalletLpAvailable: boolean
  isStable: boolean
  isNativePair: boolean
  hasWalletLp: boolean
  isApproved: boolean
}

export type FarmsExploreModuleState = 'loading' | 'ready' | 'empty' | 'partial' | 'unavailable' | 'stale'

export interface FarmsExploreFarmsViewModel {
  state: FarmsExploreModuleState
  /** Active registry before search/filter (stable public set). */
  registry: ExploreFarmViewModel[]
  farms: ExploreFarmViewModel[]
  visibleFarms: ExploreFarmViewModel[]
  totalActive: number
  filter: FarmsExploreFilter
  sort: FarmsExploreSort
  search: string
  pageSize: number
  visibleLimit: number
  hasMore: boolean
  disclosure: string | null
  liveRegion: string
  source: string
  freshness: 'live' | 'stale' | 'partial' | null
}
