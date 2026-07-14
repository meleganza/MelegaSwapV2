import type { IndexerCheckpoint, IndexerHealthSnapshot, TierMetricStatus } from '../types'

export interface TierPairStatusInput {
  hasSignal: boolean
  touched: boolean
  windowComplete: boolean
  health?: IndexerHealthSnapshot | null
  checkpoint?: IndexerCheckpoint | null
  rpcFailure: boolean
}

export function detectTierPairRpcFailure(health?: IndexerHealthSnapshot | null): boolean {
  return (
    health?.status === 'error' &&
    Boolean(health?.lastFailureReason?.toLowerCase().includes('rpc'))
  )
}

/** Non-RPC persistence or checkpoint errors after first scan touch. */
export function detectTierPairInconsistency(input: TierPairStatusInput): boolean {
  if (!input.touched || input.rpcFailure) return false
  return input.health?.status === 'error'
}

/**
 * R791A.6L — tier pair read-model state machine.
 *
 * NOT_STARTED → SYNCING → EMPTY_VERIFIED | READY
 * Side branches: RPC_UNAVAILABLE, INCONSISTENT
 */
export function resolveTierPairStatus(input: TierPairStatusInput): TierMetricStatus {
  if (input.hasSignal) return 'READY'
  if (input.rpcFailure) return 'RPC_UNAVAILABLE'
  if (detectTierPairInconsistency(input)) return 'INCONSISTENT'
  if (!input.touched) return 'NOT_STARTED'
  if (!input.windowComplete || input.health?.status === 'syncing') return 'SYNCING'
  return 'EMPTY_VERIFIED'
}

export function buildTierPairStatusInput(params: {
  hasSignal: boolean
  checkpoint: IndexerCheckpoint | null | undefined
  health: IndexerHealthSnapshot | null | undefined
  windowComplete: boolean
}): TierPairStatusInput {
  const touched = Boolean(params.checkpoint || params.health?.lastSuccessfulSync)
  const rpcFailure = detectTierPairRpcFailure(params.health)
  return {
    hasSignal: params.hasSignal,
    touched,
    windowComplete: params.windowComplete,
    health: params.health,
    checkpoint: params.checkpoint,
    rpcFailure,
  }
}
