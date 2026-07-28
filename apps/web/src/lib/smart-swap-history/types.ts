/**
 * SMART_SWAP_MODULE_005 — read-only Smart Swap execution memory.
 * Presentation only. Does not execute, settle, or invent history.
 */

export const SMART_SWAP_HISTORY_MODULE = 'SMART_SWAP_MODULE_005_HISTORY' as const

export type SmartSwapHistoryExecutionStatus =
  | 'SUCCESS'
  | 'PENDING'
  | 'FAILED'
  | 'PARTIAL'
  | 'UNAVAILABLE'

export type SmartSwapHistoryFeeState = 'AVAILABLE' | 'PARTIAL' | 'UNAVAILABLE' | 'STALE'

export type SmartSwapHistoryGasState = 'AVAILABLE' | 'UNAVAILABLE'

export type SmartSwapHistoryEconomicAttributionState =
  | 'RECORDED'
  | 'PENDING'
  | 'UNAVAILABLE'
  | 'NOT_APPLICABLE'

export interface SmartSwapHistoryTokenRef {
  symbol: string
  address: string | null
}

export interface SmartSwapHistoryHopDisplay {
  kind: 'token' | 'pool'
  label: string
}

export interface SmartSwapHistoryEntry {
  transactionHash: string
  timestamp: string | null
  inputToken: SmartSwapHistoryTokenRef
  outputToken: SmartSwapHistoryTokenRef
  inputAmount: string | null
  outputAmount: string | null
  routeId: string | null
  routeHops: SmartSwapHistoryHopDisplay[]
  liquiditySources: string[]
  executionStatus: SmartSwapHistoryExecutionStatus
  /** User-facing failure reason when available — never raw revert data by default. */
  failureReason: string | null
  protocolFee: string | null
  feeState: SmartSwapHistoryFeeState
  economicAttributionState: SmartSwapHistoryEconomicAttributionState
  gasUsed: string | null
  gasState: SmartSwapHistoryGasState
  source: 'wallet' | 'protocol'
  freshness: string | null
  explorerHint: string | null
}

export interface SmartSwapHistoryPage {
  entries: SmartSwapHistoryEntry[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
  listState: 'READY' | 'EMPTY' | 'UNAVAILABLE'
  emptyReason: string | null
}
