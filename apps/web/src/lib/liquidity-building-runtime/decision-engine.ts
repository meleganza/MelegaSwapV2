import type { BaseUnitString, DecisionEngineInput, DecisionV1 } from './types'
import { LB_BPS, LB_DECISION_SCHEMA, LB_STRATEGY_CEILING_BPS, LB_SUCCESS_FEE_BPS } from './types'

export const STRATEGY_ENGINE_VERSION = 'LiquidityBuildingStrategyEngineV1'

function bu(v: bigint): BaseUnitString {
  return v.toString()
}

export function candidateGrossQuoteTarget(eligibleNetBuyFlow: BaseUnitString, rateBps: number): BaseUnitString {
  return bu((BigInt(eligibleNetBuyFlow) * BigInt(rateBps)) / BigInt(LB_BPS))
}

export function successFeeOnGross(gross: BaseUnitString): BaseUnitString {
  return bu((BigInt(gross) * BigInt(LB_SUCCESS_FEE_BPS)) / BigInt(LB_BPS))
}

/** Approximate curve impact G/Y in bps (integer). */
export function approxImpactBps(gross: BaseUnitString, quoteReserve: BaseUnitString): number {
  const y = BigInt(quoteReserve)
  if (y === 0n) return Number.MAX_SAFE_INTEGER
  return Number((BigInt(gross) * BigInt(LB_BPS)) / y)
}

/**
 * Bounded decision engine. Never exceeds protocol ceiling or owner Dynamic Range.
 * Does not alter fee, LP recipient, Treasury, or budget.
 */
export function decideLiquidityBuilding(input: DecisionEngineInput): DecisionV1 {
  const ceiling = input.protocolStrategyCeilingBps ?? LB_STRATEGY_CEILING_BPS
  const hardImpact = input.hardCurveImpactBps ?? 100
  const now = input.nowMs ?? Date.now()
  const deadline = Math.floor(now / 1000) + (input.decisionDeadlineSeconds ?? 600)
  const engine = input.strategyEngineVersion || STRATEGY_ENGINE_VERSION

  const base = {
    schemaVersion: LB_DECISION_SCHEMA,
    program: input.program,
    epochId: input.epochId,
    observationReference: input.observationReference,
    eligibleNetBuyFlow: input.eligibleNetBuyFlow,
    strategyMode: input.strategyMode,
    strategyEngineVersion: engine,
    createdAt: new Date(now).toISOString(),
    deadline,
  } as const

  const zeroDecision = (
    decision: DecisionV1['decision'],
    reasonCode: string,
    selectedRateBps: number,
  ): DecisionV1 => ({
    ...base,
    selectedRateBps,
    grossQuoteTarget: '0',
    projectedProjectTokenInput: '0',
    projectedFee: '0',
    projectedMatching: '0',
    projectedLiquidity: '0',
    expectedImpactBps: 0,
    expectedDeviationBps: 0,
    decision,
    reasonCode,
  })

  if (input.epochAlreadyExecuted) {
    return zeroDecision('SKIP', 'EPOCH_ALREADY_EXECUTED', 0)
  }

  let rate = input.selectedRateBps
  if (input.strategyMode === 'DynamicRange') {
    const min = input.ownerMinimumRateBps ?? 0
    const max = input.ownerMaximumRateBps ?? ceiling
    if (min > max) return zeroDecision('SKIP', 'DYNAMIC_RANGE_INVALID', 0)
    if (max > ceiling) return zeroDecision('SKIP', 'DYNAMIC_RANGE_ABOVE_CEILING', 0)
    if (rate < min || rate > max) return zeroDecision('SKIP', 'DYNAMIC_RANGE_VIOLATION', rate)
  } else {
    // Full AI
    if (rate > ceiling) {
      rate = ceiling
    }
    if (rate < 0) return zeroDecision('SKIP', 'INVALID_RATE', rate)
  }

  if (rate > ceiling) {
    return zeroDecision('SKIP', 'RATE_ABOVE_PROTOCOL_CEILING', rate)
  }

  const E = BigInt(input.eligibleNetBuyFlow)
  if (E === 0n) {
    return zeroDecision('WAIT', 'ELIGIBLE_FLOW_ZERO', rate)
  }

  let gross = BigInt(candidateGrossQuoteTarget(input.eligibleNetBuyFlow, rate))
  const floor = BigInt(input.minimumGrossQuoteFloor || '0')
  if (floor > 0n && gross < floor) {
    return zeroDecision('SKIP', 'BELOW_GROSS_QUOTE_FLOOR', rate)
  }

  const budget = BigInt(input.remainingBudget)
  // Budget is project tokens; gross is quote — for decision bounding we also clamp gross by impact/budget proxies.
  if (budget === 0n) {
    return zeroDecision('SKIP', 'BUDGET_EXHAUSTED', rate)
  }

  const Y = BigInt(input.anchorQuoteReserve)
  const X = BigInt(input.anchorProjectReserve)
  if (X === 0n || Y === 0n) {
    return zeroDecision('SKIP', 'ZERO_RESERVES', rate)
  }

  let impact = approxImpactBps(bu(gross), input.anchorQuoteReserve)
  if (impact > hardImpact) {
    return zeroDecision('SKIP', 'HARD_IMPACT_EXCEEDED', rate)
  }

  const gasCost = BigInt(input.gasCostQuote || '0')
  const gasShareCap = input.maximumGasCostShareBps ?? 1000
  if (gasCost > 0n && gross > 0n) {
    const netAfterFee = gross - (gross * BigInt(LB_SUCCESS_FEE_BPS)) / BigInt(LB_BPS)
    if (netAfterFee === 0n || (gasCost * BigInt(LB_BPS)) / netAfterFee > BigInt(gasShareCap)) {
      return zeroDecision('SKIP', 'GAS_UNECONOMIC', rate)
    }
  }

  // Matched project for LP leg (post-fee quote approximation)
  const fee = (gross * BigInt(LB_SUCCESS_FEE_BPS)) / BigInt(LB_BPS)
  const netQuote = gross - fee
  const matched = Y === 0n ? 0n : (netQuote * X) / Y

  return {
    ...base,
    selectedRateBps: rate,
    grossQuoteTarget: bu(gross),
    projectedProjectTokenInput: bu(matched), // planning estimate; Program recomputes on-chain
    projectedFee: bu(fee),
    projectedMatching: bu(matched),
    projectedLiquidity: bu(netQuote),
    expectedImpactBps: impact,
    expectedDeviationBps: 0,
    decision: 'EXECUTE',
    reasonCode: 'EXECUTE_BOUNDED',
  }
}
