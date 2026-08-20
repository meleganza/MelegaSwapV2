/**
 * Canonical EXACT_IN strategy: INPUT-ASSET FEE.
 * Venue quotes and executes on post-fee input. User receives 100% of venue output.
 * minimumReceived is the user minimum after SmartSwap economics (= venue amountOutMin).
 */

import { PROTOCOL_FEE_STATE, type ProtocolFeeFact } from './fee'
import { SMARTSWAP_PROTOCOL_FEE_ENFORCEMENT_GAP } from './fee'
import { CANONICAL_SMARTSWAP_FEE_BENEFICIARY } from './feeEnforcement'
import { assertExecutionIntent, type ExecutionIntent } from './executionIntent'
import { protocolFeeFloor } from './feeAccounting'
import { requireExecutionTarget } from './executionTargetRegistry'
import { TOKEN_EXECUTION_CLASS, assertTokenSupported, type TokenExecutionClass } from './tokenSupport'
import { V2_M4_FEE_VERIFIED_FORBIDDEN, assertNoMainnetBroadcast } from './m4OperatingState'
import { computeTotalExecutionCost, computeStructuralRouteCost } from './costTaxonomy'

export const FEE_COLLECTION_STRATEGY = 'INPUT_ASSET_FEE' as const

export interface SimulatedBalances {
  userInput: string
  userOutput: string
  treasuryFee: string
  venueInput: string
}

export interface FeeEnforcedSimulation {
  ok: boolean
  reason: string | null
  intent: ExecutionIntent
  netVenueInput: string
  userOutput: string
  treasuryDelta: string
  minUserOutSatisfied: boolean
  atomic: true
  broadcast: false
  feeState: ProtocolFeeFact['state']
  balances: SimulatedBalances | null
  executorGasOverheadUnits: number | null
  totalExecution: ReturnType<typeof computeTotalExecutionCost>
}

export function simulateFeeEnforcedExecution(input: {
  intent: ExecutionIntent
  path: string[]
  nowTs: number
  chainId: number
  tokenClass: TokenExecutionClass
  /** Venue output for the POST-FEE input. Injected. Never fabricated as market data. */
  venueOutputOnNetInput: string | null
  venueReverts?: boolean
  feeSettlementFails?: boolean
  executorGasOverheadUnits?: number | null
  usedNonces?: Set<string>
}): FeeEnforcedSimulation {
  const nonceKey = `${input.intent.user}:${input.intent.nonce}`
  const overhead = input.executorGasOverheadUnits ?? null
  const structural = computeStructuralRouteCost({
    venueFeesBps: input.intent.structuralRouteCostBps,
    bridgeCostsBps: 0,
    gasCostBps: null,
    venueFeesEmbeddedInGross: true,
    bridgeCostsEmbeddedInGross: true,
  })
  const totalExecution = computeTotalExecutionCost({
    structural,
    gasCostBps: null,
    smartSwapFeeBps: input.intent.feeBps,
  })

  const fail = (reason: string): FeeEnforcedSimulation => ({
    ok: false,
    reason,
    intent: input.intent,
    netVenueInput: '0',
    userOutput: '0',
    treasuryDelta: '0',
    minUserOutSatisfied: false,
    atomic: true,
    broadcast: false,
    feeState: PROTOCOL_FEE_STATE.FEE_PREVIEW_ONLY,
    balances: null,
    executorGasOverheadUnits: overhead,
    totalExecution,
  })

  try {
    assertTokenSupported(input.tokenClass)
    assertExecutionIntent(input.intent, input.nowTs, input.chainId)
    const target = requireExecutionTarget(input.intent.venueId, input.chainId)
    if (target.router.toLowerCase() !== input.intent.router.toLowerCase()) throw new Error('WRONG_ROUTER')
    if (input.usedNonces?.has(nonceKey)) throw new Error('REPLAY')
    const split = protocolFeeFloor(input.intent.inputAmount, input.intent.feeBps)
    if (split.feeRaw !== input.intent.feeAmount) throw new Error('WRONG_FEE')
    if (input.feeSettlementFails) throw new Error('FEE_SETTLEMENT_FAILURE')
    if (input.venueReverts) throw new Error('VENUE_REVERT')
    if (input.venueOutputOnNetInput == null) throw new Error('NO_ROUTE')
    const userOutput = input.venueOutputOnNetInput
    if (BigInt(userOutput) < BigInt(input.intent.minUserOut)) throw new Error('MINIMUM_OUTPUT_FAILURE')
    input.usedNonces?.add(nonceKey)
    return {
      ok: true,
      reason: null,
      intent: input.intent,
      netVenueInput: split.netRaw,
      userOutput,
      treasuryDelta: split.feeRaw,
      minUserOutSatisfied: true,
      atomic: true,
      broadcast: false,
      feeState: PROTOCOL_FEE_STATE.FEE_ENFORCEABLE,
      balances: {
        userInput: split.netRaw,
        userOutput,
        treasuryFee: split.feeRaw,
        venueInput: split.netRaw,
      },
      executorGasOverheadUnits: overhead,
      totalExecution,
    }
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause)
    return fail(message)
  }
}

export function markSimulatedPathEnforceable(simulation: FeeEnforcedSimulation): ProtocolFeeFact {
  if (!simulation.ok) {
    return {
      state: PROTOCOL_FEE_STATE.FEE_PREVIEW_ONLY,
      bps: simulation.intent.feeBps,
      formulaId: 'smartswap-revenue-policy-v1',
      amountRaw: simulation.intent.feeAmount,
      assetSymbol: null,
      recipient: CANONICAL_SMARTSWAP_FEE_BENEFICIARY,
      collectionProven: false,
      atomicWithSwap: true,
      productionExecutionEligible: false,
      gapCode: SMARTSWAP_PROTOCOL_FEE_ENFORCEMENT_GAP,
    }
  }
  return {
    state: PROTOCOL_FEE_STATE.FEE_ENFORCEABLE,
    bps: simulation.intent.feeBps,
    formulaId: 'smartswap-revenue-policy-v1',
    amountRaw: simulation.intent.feeAmount,
    assetSymbol: null,
    recipient: CANONICAL_SMARTSWAP_FEE_BENEFICIARY,
    collectionProven: false,
    atomicWithSwap: true,
    productionExecutionEligible: false,
    gapCode: null,
  }
}

export function assertNeverFeeVerified(): never {
  throw new Error(V2_M4_FEE_VERIFIED_FORBIDDEN)
}

export function assertSimulationCannotBroadcast(simulation: FeeEnforcedSimulation): void {
  if (simulation.broadcast) assertNoMainnetBroadcast()
}

export const APPROVAL_MODEL = {
  userApproves: 'SmartSwapExecutorV1',
  executorApproves: 'allowlisted V2 router for net input only, then 0',
  permit2: false,
  unlimitedApprovals: false,
  approve0BeforeReset: true,
  approvalIsNotFeePayment: true,
} as const

void TOKEN_EXECUTION_CLASS
