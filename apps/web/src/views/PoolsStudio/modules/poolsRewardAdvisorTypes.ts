/**
 * POOLS_MODULE_006 — Reward Advisor view-model types.
 * Factual priorities only — no AI / predictions.
 */

import type { PoolPreviewCard } from '../poolsStudioData'

export type PoolsAdvisorPriorityKind =
  | 'claim'
  | 'withdraw'
  | 'emergency_withdraw'
  | 'ending_soon'
  | 'high_apr'
  | 'all_clear'

export type PoolsAdvisorActionKind = 'claim' | 'withdraw' | 'emergency_withdraw' | 'stake' | 'view_pool' | 'none'

export interface PoolsAdvisorPriorityCard {
  id: string
  kind: PoolsAdvisorPriorityKind
  icon: string
  title: string
  explanation: string
  affectedPool: string
  actionKind: PoolsAdvisorActionKind
  actionLabel: 'Claim' | 'Withdraw' | 'Emergency Withdraw' | 'Stake' | 'View Pool' | '—'
  actionEnabled: boolean
  accessibleName: string
  sourceCard: PoolPreviewCard | null
  modalAction: 'claim' | 'unstake' | 'stake' | null
  sortPriority: number
}

export type PoolsRewardAdvisorModuleState = 'loading' | 'ready' | 'all_clear' | 'unavailable' | 'disconnected'

export interface PoolsRewardAdvisorViewModel {
  state: PoolsRewardAdvisorModuleState
  cards: PoolsAdvisorPriorityCard[]
  liveRegion: string
}
