import { PROTOCOL_FEE_STATE } from './fee'
import { CANONICAL_SMARTSWAP_FEE_BENEFICIARY } from './feeEnforcement'
import type { ExecutionIntent } from './executionIntent'
import { V2_M4_FEE_VERIFIED_FORBIDDEN } from './m4OperatingState'

export interface ExecutionReceiptEvidence {
  txStatus: 'success' | 'reverted' | 'simulated' | 'fork'
  chainId: number
  executor: string | null
  venueId: string
  inputAsset: string
  inputAmount: string
  feeBps: number
  feeAsset: string
  beneficiary: string
  treasuryDelta: string | null
  userOutput: string | null
  minUserOut: string
  minSatisfied: boolean | null
  routeHash: string
  collectionProven: boolean
}

export function verifySimulatedEconomics(input: {
  intent: ExecutionIntent
  treasuryDelta: string
  userOutput: string
  chainId: number
  executor?: string | null
}): ExecutionReceiptEvidence {
  const minSatisfied = BigInt(input.userOutput) >= BigInt(input.intent.minUserOut)
  const beneficiaryOk = input.intent.beneficiary.toLowerCase() === CANONICAL_SMARTSWAP_FEE_BENEFICIARY.toLowerCase()
  const feeOk = input.treasuryDelta === input.intent.feeAmount
  return {
    txStatus: 'simulated',
    chainId: input.chainId,
    executor: input.executor ?? null,
    venueId: input.intent.venueId,
    inputAsset: input.intent.inputAsset,
    inputAmount: input.intent.inputAmount,
    feeBps: input.intent.feeBps,
    feeAsset: input.intent.feeAsset,
    beneficiary: input.intent.beneficiary,
    treasuryDelta: input.treasuryDelta,
    userOutput: input.userOutput,
    minUserOut: input.intent.minUserOut,
    minSatisfied,
    routeHash: input.intent.routeHash,
    collectionProven: false,
  }
}

export function receiptToFeeState(evidence: ExecutionReceiptEvidence): string {
  if (evidence.txStatus === 'success' && evidence.collectionProven) {
    throw new Error(V2_M4_FEE_VERIFIED_FORBIDDEN)
  }
  if (
    (evidence.txStatus === 'simulated' || evidence.txStatus === 'fork') &&
    evidence.treasuryDelta &&
    evidence.minSatisfied
  ) {
    return PROTOCOL_FEE_STATE.FEE_ENFORCEABLE
  }
  return PROTOCOL_FEE_STATE.FEE_PREVIEW_ONLY
}

/** Fork/local success never proves a mainnet fee. collectionProven stays false. */
export function verifyForkEconomics(input: {
  intent: ExecutionIntent
  treasuryDelta: string
  userOutput: string
  chainId: number
  executor?: string | null
}): ExecutionReceiptEvidence {
  return {
    ...verifySimulatedEconomics(input),
    txStatus: 'fork',
    collectionProven: false,
  }
}
