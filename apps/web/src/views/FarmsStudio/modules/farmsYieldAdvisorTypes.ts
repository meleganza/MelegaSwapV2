/**
 * FARMS_MODULE_006 — Yield Advisor view-model types.
 * Factual priorities only — no AI / predictions / APR recommendations.
 */

import type { FarmPreviewCard } from '../farmsStudioData'

export type FarmsAdvisorPriorityKind =
  | 'emergency_withdraw'
  | 'withdraw_finished'
  | 'harvest_rewards'
  | 'harvest_active'
  | 'inactive_attention'
  | 'all_clear'

export type FarmsAdvisorActionKind =
  | 'emergency_withdraw'
  | 'withdraw'
  | 'harvest'
  | 'none'

export interface FarmsAdvisorPriorityCard {
  id: string
  kind: FarmsAdvisorPriorityKind
  icon: string
  title: string
  reason: string
  sourcePositionLabel: string
  actionKind: FarmsAdvisorActionKind
  actionLabel: 'Withdraw' | 'Harvest' | '—'
  actionEnabled: boolean
  accessibleName: string
  sourceCard: FarmPreviewCard | null
  modalAction: 'unstake' | 'claim' | null
  sortPriority: number
  freshness: 'live' | 'stale' | 'partial' | null
}

export type FarmsYieldAdvisorModuleState =
  | 'loading'
  | 'ready'
  | 'all_clear'
  | 'unavailable'
  | 'disconnected'

export interface FarmsYieldAdvisorViewModel {
  state: FarmsYieldAdvisorModuleState
  cards: FarmsAdvisorPriorityCard[]
  liveRegion: string
}
