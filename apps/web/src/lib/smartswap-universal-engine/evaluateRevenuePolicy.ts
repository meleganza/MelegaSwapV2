/**
 * Pure SmartSwap revenue-policy evaluation. No network I/O.
 */

import { PROTOCOL_FEE_STATE, type ProtocolFeeState } from './fee'
import {
  REVENUE_REASON,
  SMARTSWAP_REVENUE_POLICY_V1,
  type FeeBandId,
  type RevenueReasonCode,
  type SmartSwapRevenuePolicy,
} from './revenuePolicy'

export interface EvaluateRevenuePolicyInput {
  structuralRouteCostBps: number | null
  swapValueNormalized: number | null
  inputAmountRaw: string | null
  feeEnforcementState: ProtocolFeeState
  policy?: SmartSwapRevenuePolicy
}

export interface RevenuePolicyAssessment {
  policyId: string
  policyVersion: string
  feeBand: FeeBandId | null
  feeBps: number | null
  maxProtocolFeeBps: 25
  structuralRouteCostBps: number | null
  structuralPlusFeeBps: number | null
  withinTarget: boolean | null
  targetStructuralCostPlusFeeBps: 50
  reasonCodes: RevenueReasonCode[]
  productionExecutionEligible: boolean
  minimumRevenue: {
    enabled: false
    mode: 'OBSERVE_ONLY'
    wouldBind: false
  }
}

function resolveBand(structuralBps: number, policy: SmartSwapRevenuePolicy) {
  for (const band of policy.bands) {
    if (structuralBps <= band.maxStructuralCostBpsInclusive) return band
  }
  return policy.bands[policy.bands.length - 1]
}

export function evaluateRevenuePolicy(input: EvaluateRevenuePolicyInput): RevenuePolicyAssessment {
  const policy = input.policy ?? SMARTSWAP_REVENUE_POLICY_V1
  const reasons: RevenueReasonCode[] = []
  const enforcementBlocksProduction =
    input.feeEnforcementState === PROTOCOL_FEE_STATE.FEE_UNAVAILABLE ||
    input.feeEnforcementState === PROTOCOL_FEE_STATE.FEE_PREVIEW_ONLY

  if (enforcementBlocksProduction) reasons.push(REVENUE_REASON.FEE_ENFORCEMENT_UNAVAILABLE)
  if (input.swapValueNormalized == null) reasons.push(REVENUE_REASON.QUOTE_VALUE_UNAVAILABLE)
  if (input.inputAmountRaw === '0' || input.inputAmountRaw === '') reasons.push(REVENUE_REASON.ZERO_INPUT)

  if (input.structuralRouteCostBps == null || !Number.isFinite(input.structuralRouteCostBps) || input.structuralRouteCostBps < 0) {
    reasons.push(REVENUE_REASON.ROUTE_COST_UNCERTIFIED)
    reasons.push(REVENUE_REASON.MINIMUM_REVENUE_OBSERVE_ONLY)
    return {
      policyId: policy.id,
      policyVersion: policy.version,
      feeBand: null,
      feeBps: null,
      maxProtocolFeeBps: policy.maxProtocolFeeBps,
      structuralRouteCostBps: null,
      structuralPlusFeeBps: null,
      withinTarget: null,
      targetStructuralCostPlusFeeBps: policy.targetStructuralCostPlusFeeBps,
      reasonCodes: [...new Set(reasons)],
      productionExecutionEligible: false,
      minimumRevenue: { enabled: false, mode: 'OBSERVE_ONLY', wouldBind: false },
    }
  }

  const band = resolveBand(input.structuralRouteCostBps, policy)
  reasons.push(band.reason)
  reasons.push(REVENUE_REASON.MINIMUM_REVENUE_OBSERVE_ONLY)
  const structuralPlusFeeBps = input.structuralRouteCostBps + band.feeBps
  const withinTarget = structuralPlusFeeBps <= policy.targetStructuralCostPlusFeeBps

  return {
    policyId: policy.id,
    policyVersion: policy.version,
    feeBand: band.id,
    feeBps: band.feeBps,
    maxProtocolFeeBps: policy.maxProtocolFeeBps,
    structuralRouteCostBps: input.structuralRouteCostBps,
    structuralPlusFeeBps,
    withinTarget,
    targetStructuralCostPlusFeeBps: policy.targetStructuralCostPlusFeeBps,
    reasonCodes: [...new Set(reasons)],
    productionExecutionEligible: !enforcementBlocksProduction && band.feeBps <= policy.maxProtocolFeeBps,
    minimumRevenue: { enabled: false, mode: 'OBSERVE_ONLY', wouldBind: false },
  }
}

export function computeFeeAmountRaw(baseAmountRaw: string, feeBps: number): string {
  if (!/^\d+$/.test(baseAmountRaw)) throw new Error('INVALID_FEE_BASE_AMOUNT')
  if (feeBps < 0 || feeBps > 10_000) throw new Error('INVALID_FEE_BPS')
  return ((BigInt(baseAmountRaw) * BigInt(feeBps)) / 10_000n).toString()
}
