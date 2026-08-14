/**
 * POOLS_MODULE_003 — wallet-scoped Pools staking position model.
 * Canonical vocabulary from Architecture 000.
 */

import type { PoolPreviewCard } from '../poolsStudioData'
import type { PoolsCanonicalStatus } from '../poolsArchitecture000Contracts'

export type PoolsPositionStatus = Extract<
  PoolsCanonicalStatus,
  'ACTIVE' | 'ENDED' | 'WITHDRAW_ONLY' | 'EMERGENCY' | 'UNAVAILABLE' | 'PARTIAL' | 'LOADING'
>

export type PoolsPositionActionKind =
  | 'claim'
  | 'withdraw'
  | 'manage'
  | 'emergency_withdraw'
  | 'connect'
  | 'switch_network'
  | 'view_details'

export type PoolsPositionActionLabel =
  | 'Claim'
  | 'Claiming…'
  | 'Withdraw'
  | 'Withdrawing…'
  | 'Manage'
  | 'Stake More'
  | 'Emergency Withdraw'
  | 'Connect Wallet'
  | 'Switch Network'
  | 'View details'
  | 'Transaction Confirmed'
  | 'Transaction Failed'
  | 'Data Unavailable'

export interface PoolsPositionTokenRef {
  symbol: string
  address: string | null
  decimals: number | null
  chainId: number | null
}

export interface PoolsPositionAction {
  kind: PoolsPositionActionKind
  label: PoolsPositionActionLabel
  /** Modal action for PoolsActionHost when applicable. */
  modalAction?: 'claim' | 'unstake' | 'stake'
  enabled: boolean
  accessibleName: string
}

export type PoolsPositionFreshness = 'live' | 'stale' | 'loading' | 'unavailable' | 'partial'

export interface PoolsWalletPosition {
  positionId: string
  poolId: string
  poolContract: string | null
  chainId: number
  stakeToken: PoolsPositionTokenRef
  rewardToken: PoolsPositionTokenRef
  stakedRaw: string | null
  stakedFormatted: string
  stakedValue: string | null
  claimableRaw: string | null
  claimableFormatted: string
  claimableValue: string | null
  unlockLine: string | null
  lockType: 'flexible' | 'locked' | 'ended' | 'emergency' | 'unknown' | null
  poolStatus: 'ACTIVE' | 'ENDED' | 'INDEXING' | 'UNAVAILABLE'
  positionStatus: PoolsPositionStatus
  statusLabel: 'Active' | 'Finished' | 'Ended' | 'Withdraw' | 'Emergency' | 'Partial' | 'Unavailable'
  actions: PoolsPositionAction[]
  source: 'smartchef' | 'historical' | 'vault'
  freshness: PoolsPositionFreshness
  partialData: boolean
  partialReasons: string[]
  errorState: string | null
  provenance: string
  /** Source card for action host — never fabricate. */
  sourceCard: PoolPreviewCard
  /** Stable sort keys (not UI). */
  sortClaimableUsd: number
  sortStakedUsd: number
  title: string
  subtitle: string
}

export type PoolsMyPositionsModuleState =
  | 'disconnected'
  | 'loading'
  | 'empty'
  | 'ready'
  | 'partial'
  | 'unavailable'
  | 'stale'

export interface PoolsMyPositionsViewModel {
  state: PoolsMyPositionsModuleState
  wallet: string | null
  chainId: number | null
  positions: PoolsWalletPosition[]
  visiblePositions: PoolsWalletPosition[]
  totalCount: number | null
  showCountBadge: boolean
  showViewAll: boolean
  moduleDisclosure: string | null
  liveRegion: string
  freshness: PoolsPositionFreshness
  authoritativeEmpty: boolean
  generation: number
}
