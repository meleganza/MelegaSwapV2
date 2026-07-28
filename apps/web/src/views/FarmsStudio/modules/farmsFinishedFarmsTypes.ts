/**
 * FARMS_MODULE_005 — Finished Farms view-model types.
 * Wallet-scoped recovery positions only (no ACTIVE explore farms).
 */

import type { FarmPreviewCard } from '../farmsStudioData'

export type FarmsFinishedStatus = 'ENDED' | 'WITHDRAW_ONLY' | 'EMERGENCY' | 'PARTIAL' | 'UNAVAILABLE' | 'LOADING'

export type FarmsFinishedStatusLabel = 'Ended' | 'Withdraw' | 'Emergency' | 'Partial' | 'Unavailable'

export interface FarmsFinishedAction {
  kind: 'withdraw' | 'emergency_withdraw' | 'claim' | 'connect' | 'switch_network' | 'unavailable'
  label:
    | 'Withdraw LP'
    | 'Withdrawing…'
    | 'Emergency Withdraw'
    | 'Harvest'
    | 'Harvesting…'
    | 'Connect Wallet'
    | 'Switch Network'
    | 'Unavailable'
  modalAction?: 'unstake' | 'claim'
  enabled: boolean
  accessibleName: string
}

export interface FarmsFinishedTokenRef {
  symbol: string
  address: string | null
  decimals: number | null
  chainId: number | null
}

/** Canonical FinishedFarmPosition. */
export interface FinishedFarmPosition {
  positionId: string
  farmId: string
  pid: number | null
  masterbuilder: string | null
  chainId: number
  lpToken: FarmsFinishedTokenRef
  token0: FarmsFinishedTokenRef
  token1: FarmsFinishedTokenRef
  rewardToken: FarmsFinishedTokenRef
  stakedRaw: string | null
  stakedFormatted: string
  stakedValue: string | null
  pendingRaw: string | null
  pendingFormatted: string
  pendingValue: string | null
  farmEndState: string
  endedAt: string | null
  endedDateLabel: string
  positionStatus: FarmsFinishedStatus
  statusLabel: FarmsFinishedStatusLabel
  withdrawSupported: boolean
  emergencyWithdrawSupported: boolean
  harvestSupported: boolean
  recoveryLine: string
  actions: FarmsFinishedAction[]
  source: string
  freshness: 'live' | 'stale' | 'partial'
  partialData: boolean
  partialReasons: string[]
  errorState: string | null
  provenance: string
  title: string
  subtitle: string
  sourceCard: FarmPreviewCard
  sortPriority: number
  sortStaked: number
  sortPending: number
  sortEnded: number
}

export type FarmsFinishedModuleState =
  | 'disconnected'
  | 'loading'
  | 'empty'
  | 'ready'
  | 'partial'
  | 'stale'
  | 'unavailable'

export interface FarmsFinishedFarmsViewModel {
  state: FarmsFinishedModuleState
  positions: FinishedFarmPosition[]
  totalCount: number | null
  showCountBadge: boolean
  moduleDisclosure: string | null
  liveRegion: string
  freshness: 'live' | 'stale' | 'partial' | 'loading' | 'unavailable' | null
  historyHref: string | null
}
