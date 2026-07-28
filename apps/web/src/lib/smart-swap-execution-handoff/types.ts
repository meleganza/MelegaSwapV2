/**
 * SMART_SWAP_MAINNET_EXECUTION_HANDOFF
 * Certified bridge: preview → readiness → wallet confirmation (user-signed).
 * Does not auto-sign, auto-broadcast, or modify Router / fee / KERL.
 */

export const SMART_SWAP_EXECUTION_HANDOFF_MODULE = 'SMART_SWAP_MAINNET_EXECUTION_HANDOFF' as const

export type SmartSwapHandoffFailure =
  | 'WALLET_NOT_CONNECTED'
  | 'WRONG_NETWORK'
  | 'NO_ROUTE'
  | 'STALE_QUOTE'
  | 'INSUFFICIENT_BALANCE'
  | 'INSUFFICIENT_ALLOWANCE'
  | 'GAS_ESTIMATION_FAILED'
  | 'SIMULATION_FAILED'
  | 'CALLDATA_INVALID'
  | 'EXECUTION_UNAVAILABLE'

export type SmartSwapHandoffLifecycle =
  | 'SELECTED'
  | 'LOADING'
  | 'ROUTE_FOUND'
  | 'PREVIEW_AVAILABLE'
  | 'HANDOFF_READY'
  | 'EXECUTION_PENDING'
  | 'SUCCESS'
  | 'FAILURE'
  | 'UNAVAILABLE'

export interface SmartSwapHandoffCheck {
  id: string
  label: string
  satisfied: boolean
  failure?: SmartSwapHandoffFailure
  detail?: string
}

export interface SmartSwapExecutionHandoff {
  certified: boolean
  lifecycle: SmartSwapHandoffLifecycle
  checks: SmartSwapHandoffCheck[]
  failures: SmartSwapHandoffFailure[]
  /** Explicit user confirmation required — never auto-sign. */
  requiresUserConfirmation: true
  autoSignForbidden: true
  autoBroadcastForbidden: true
  relatedRouteId: string | null
  relatedPreviewFreshness: string | null
  message: string
  evaluatedAt: string
}

export interface SmartSwapExecutionHandoffInput {
  walletConnected: boolean
  chainId?: number | null
  expectedChainId?: number
  routeAvailable: boolean
  quoteFresh: boolean
  minimumReceivedAvailable: boolean
  gasEstimateAvailable: boolean
  /** null = not yet known (partial); false = failed check */
  allowanceSufficient: boolean | null
  balanceSufficient: boolean | null
  simulationPassed: boolean | null
  calldataValid: boolean
  deadlineValid: boolean
  previewAvailable?: boolean
  loading?: boolean
  executionPending?: boolean
  executionSuccess?: boolean
  executionFailure?: boolean
  relatedRouteId?: string | null
  relatedPreviewFreshness?: string | null
  evaluatedAt?: string
}
