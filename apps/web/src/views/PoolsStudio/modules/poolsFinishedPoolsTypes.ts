/**
 * POOLS_MODULE_005 — Finished Pools view-model types.
 * Wallet-scoped ENDED / WITHDRAW_ONLY / EMERGENCY only.
 */

import type { PoolPreviewCard } from '../poolsStudioData'

export type PoolsFinishedStatus = 'ENDED' | 'WITHDRAW_ONLY' | 'EMERGENCY'

export interface PoolsFinishedAction {
  kind: 'withdraw' | 'emergency_withdraw' | 'claim' | 'connect'
  label: 'Withdraw' | 'Withdrawing…' | 'Emergency Withdraw' | 'Claim' | 'Connect Wallet'
  modalAction?: 'unstake' | 'claim'
  enabled: boolean
  accessibleName: string
}

export interface PoolsFinishedPoolCardModel {
  positionId: string
  poolId: string
  title: string
  endedDateLabel: string
  status: PoolsFinishedStatus
  statusLabel: 'Ended' | 'Withdraw' | 'Emergency'
  withdrawalState: string
  principalFormatted: string
  claimableFormatted: string
  stakeToken: { symbol: string; address: string | null; chainId: number | null }
  rewardToken: { symbol: string; address: string | null; chainId: number | null }
  actions: PoolsFinishedAction[]
  sourceCard: PoolPreviewCard
  sortPriority: number
  sortPrincipal: number
  sortClaimable: number
}

export type PoolsFinishedModuleState =
  | 'disconnected'
  | 'loading'
  | 'empty'
  | 'ready'
  | 'unavailable'

export interface PoolsFinishedPoolsViewModel {
  state: PoolsFinishedModuleState
  pools: PoolsFinishedPoolCardModel[]
  totalCount: number | null
  showCountBadge: boolean
  liveRegion: string
}
