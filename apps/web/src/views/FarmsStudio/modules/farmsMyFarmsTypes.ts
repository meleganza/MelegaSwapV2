import type { FarmPreviewCard } from '../farmsStudioData'
import type { FarmsCanonicalStatus } from '../farmsArchitecture000Contracts'

export type FarmsPositionStatus = Extract<FarmsCanonicalStatus, 'ACTIVE' | 'ENDED' | 'WITHDRAW_ONLY' | 'EMERGENCY' | 'PARTIAL' | 'UNAVAILABLE' | 'LOADING'>
export type FarmsPositionActionKind = 'claim' | 'unstake' | 'stake' | 'connect'
export type FarmsPositionActionLabel = 'Harvest' | 'Harvesting…' | 'Withdraw' | 'Withdrawing…' | 'Stake More' | 'Manage' | 'Emergency Withdraw' | 'Connect Wallet' | 'Transaction Failed'

export interface FarmsPositionTokenRef { symbol: string; address: string | null; decimals: number | null; chainId: number | null }
export interface FarmsPositionAction {
  kind: FarmsPositionActionKind
  label: FarmsPositionActionLabel
  modalAction?: 'claim' | 'unstake' | 'stake'
  enabled: boolean
  accessibleName: string
}

export interface FarmsWalletPosition {
  positionId: string; farmId: string; pid: number | null; masterChef: string | null; chainId: number; lpToken: FarmsPositionTokenRef
  token0: FarmsPositionTokenRef; token1: FarmsPositionTokenRef; rewardToken: FarmsPositionTokenRef
  stakedRaw: string | null; stakedFormatted: string; stakedLpFormatted?: string; stakedValue: string | null
  depositedUsdAvailable?: boolean
  pendingRaw: string | null; pendingFormatted: string; pendingValue: string | null
  farmStatus: 'ACTIVE' | 'ENDED' | 'INDEXING' | 'UNAVAILABLE'
  positionStatus: FarmsPositionStatus
  statusLabel: 'Active' | 'Finished' | 'Emergency' | 'Partial' | 'Unavailable'
  apr: string | null; tvl: string | null; multiplier: string | null
  actions: FarmsPositionAction[]; source: 'masterchef' | 'historical'; freshness: 'live' | 'stale' | 'loading' | 'unavailable' | 'partial'
  partialData: boolean; partialReasons: string[]; provenance: string; sourceCard: FarmPreviewCard
  sortPendingUsd: number; sortStakedUsd: number; title: string; subtitle: string; farmStateLine: string
}

export type FarmsMyFarmsModuleState = 'disconnected' | 'loading' | 'empty' | 'ready' | 'partial' | 'unavailable' | 'stale'
export interface FarmsMyFarmsViewModel {
  state: FarmsMyFarmsModuleState; wallet: string | null; chainId: number | null; positions: FarmsWalletPosition[]; visiblePositions: FarmsWalletPosition[]
  totalCount: number | null; showCountBadge: boolean; showViewAll: boolean; moduleDisclosure: string | null; liveRegion: string
  freshness: FarmsWalletPosition['freshness']; authoritativeEmpty: boolean; generation: number
}
