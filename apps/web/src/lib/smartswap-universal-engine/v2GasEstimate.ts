import type { UnsignedUserTransaction, V2UserTransactionPreparation } from './v2ExecutionBinding'

export const V2_GAS_ESTIMATE_STATE = {
  IDLE: 'IDLE',
  ESTIMATING: 'ESTIMATING',
  SWAP: 'SWAP',
  APPROVAL_REQUIRED: 'APPROVAL_REQUIRED',
  UNAVAILABLE: 'UNAVAILABLE',
} as const

export type V2GasEstimate =
  | { state: typeof V2_GAS_ESTIMATE_STATE.IDLE | typeof V2_GAS_ESTIMATE_STATE.ESTIMATING | typeof V2_GAS_ESTIMATE_STATE.UNAVAILABLE; gasUnits: null }
  | { state: typeof V2_GAS_ESTIMATE_STATE.SWAP; gasUnits: number }
  | { state: typeof V2_GAS_ESTIMATE_STATE.APPROVAL_REQUIRED; gasUnits: number | null }

type GasEstimator = {
  estimateGas(transaction: { from: string; to: string; data: string; value: string }): Promise<{ toString(): string }>
}

function rpcTransaction(tx: UnsignedUserTransaction) {
  return { from: tx.from, to: tx.to, data: tx.data, value: tx.value }
}

function safeGasUnits(raw: string): number | null {
  try {
    const value = BigInt(raw)
    return value > BigInt(0) && value <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(value) : null
  } catch {
    return null
  }
}

/** Read-only estimate of exactly the already-prepared user transaction. Never broadcasts. */
export async function estimatePreparedV2Gas(
  estimator: GasEstimator,
  preparation: V2UserTransactionPreparation,
): Promise<V2GasEstimate> {
  if (preparation.approvalTransactions.length > 0) {
    try {
      const estimates = await Promise.all(
        preparation.approvalTransactions.map((tx) => estimator.estimateGas(rpcTransaction(tx))),
      )
      const units = estimates.reduce<number>((sum, estimate) => {
        const value = safeGasUnits(estimate.toString())
        if (value == null) throw new Error('INVALID_GAS_ESTIMATE')
        return sum + value
      }, 0)
      return { state: V2_GAS_ESTIMATE_STATE.APPROVAL_REQUIRED, gasUnits: units }
    } catch {
      return { state: V2_GAS_ESTIMATE_STATE.APPROVAL_REQUIRED, gasUnits: null }
    }
  }

  try {
    const estimate = await estimator.estimateGas(rpcTransaction(preparation.swapTransaction))
    const gasUnits = safeGasUnits(estimate.toString())
    return gasUnits == null
      ? { state: V2_GAS_ESTIMATE_STATE.UNAVAILABLE, gasUnits: null }
      : { state: V2_GAS_ESTIMATE_STATE.SWAP, gasUnits }
  } catch {
    return { state: V2_GAS_ESTIMATE_STATE.UNAVAILABLE, gasUnits: null }
  }
}
