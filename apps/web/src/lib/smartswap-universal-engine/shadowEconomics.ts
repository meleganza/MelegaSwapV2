/**
 * Shadow economic simulation. Never mutates the live quote or execution path.
 */

import { PROTOCOL_FEE_STATE } from './fee'
import { computeStructuralRouteCost, computeTotalExecutionCost, type RouteCostInputs } from './costTaxonomy'
import { evaluateRevenuePolicy, type RevenuePolicyAssessment } from './evaluateRevenuePolicy'
import { computeNetUserOutput, type NetExecutionResult } from './netExecution'
import { FEE_ASSET_SOURCE, sealSmartSwapFee, type SealedSmartSwapFee } from './quoteFee'
import type { NormalizedQuote } from './quote'
import { evmNative } from './assetIdentity'

export const SHADOW_OBSERVATION_KIND = {
  SYNTHETIC_TEST: 'SYNTHETIC_TEST',
  LIVE_FACTUAL_SHADOW: 'LIVE_FACTUAL_SHADOW',
} as const

export type ShadowObservationKind = (typeof SHADOW_OBSERVATION_KIND)[keyof typeof SHADOW_OBSERVATION_KIND]

export const SYNTHETIC_SWAP_VALUES_USD = [10, 50, 100, 500, 1_000, 5_000, 10_000, 100_000] as const

/** Factual Melega V2 LP base fee (repository truth). Not a fabricated price. */
export const MELEGA_FACTUAL_LP_FEE_BPS = 25 as const

export interface ShadowEconomicObservation {
  kind: ShadowObservationKind
  liveQuoteId: string | null
  venueId: string | null
  structuralRouteCostBps: number | null
  smartSwapFeeBps: number | null
  feeBand: string | null
  policyVersion: string
  feeEnforcementState: string
  grossOutputRaw: string | null
  netUserOutputRaw: string | null
  assessment: RevenuePolicyAssessment
  sealedFee: SealedSmartSwapFee | null
  net: NetExecutionResult | null
  liveQuoteMutated: false
}

export function observeShadowEconomics(input: {
  kind: ShadowObservationKind
  liveQuote?: NormalizedQuote | null
  venueId?: string | null
  costs: RouteCostInputs
  grossOutputRaw: string
  swapValueNormalized: number | null
  inputAmountRaw: string
  quoteTimestamp: string
  quoteExpiry: string
}): ShadowEconomicObservation {
  const structural = computeStructuralRouteCost(input.costs)
  const assessment = evaluateRevenuePolicy({
    structuralRouteCostBps: structural.structuralRouteCostBps,
    swapValueNormalized: input.swapValueNormalized,
    inputAmountRaw: input.inputAmountRaw,
    feeEnforcementState: input.liveQuote?.protocolFee.state ?? PROTOCOL_FEE_STATE.FEE_PREVIEW_ONLY,
  })
  const sealedFee =
    assessment.feeBand && assessment.feeBps != null
      ? sealSmartSwapFee({
          assessment,
          baseAmountRaw: input.grossOutputRaw,
          feeAssetSource: FEE_ASSET_SOURCE.OUTPUT,
          feeAsset: input.liveQuote?.outputAsset ?? evmNative(56, 'BNB'),
          quoteTimestamp: input.quoteTimestamp,
          quoteExpiry: input.quoteExpiry,
        })
      : null
  const total = computeTotalExecutionCost({
    structural,
    gasCostBps: input.costs.gasCostBps,
    smartSwapFeeBps: assessment.feeBps,
  })
  void total
  const net =
    sealedFee != null
      ? computeNetUserOutput({
          grossOutputRaw: input.grossOutputRaw,
          venueFeeRaw: null,
          venueFeesEmbeddedInGross: input.costs.venueFeesEmbeddedInGross,
          bridgeCostRaw: null,
          bridgeCostsEmbeddedInGross: input.costs.bridgeCostsEmbeddedInGross,
          gasCostInOutputRaw: null,
          smartSwapFeeRaw: sealedFee.feeAmountRaw,
          smartSwapFeeEmbeddedInGross: false,
        })
      : null

  return {
    kind: input.kind,
    liveQuoteId: input.liveQuote?.quoteId ?? null,
    venueId: input.venueId ?? input.liveQuote?.venueId ?? null,
    structuralRouteCostBps: structural.structuralRouteCostBps,
    smartSwapFeeBps: assessment.feeBps,
    feeBand: assessment.feeBand,
    policyVersion: assessment.policyVersion,
    feeEnforcementState: input.liveQuote?.protocolFee.state ?? PROTOCOL_FEE_STATE.FEE_PREVIEW_ONLY,
    grossOutputRaw: input.grossOutputRaw,
    netUserOutputRaw: net?.netUserOutputRaw ?? null,
    assessment,
    sealedFee,
    net,
    liveQuoteMutated: false,
  }
}

export function runSyntheticNotionalSimulation(structuralRouteCostBps: number): ShadowEconomicObservation[] {
  const timestamp = '2026-08-19T18:00:00.000Z'
  const expiry = '2026-08-19T18:00:30.000Z'
  return SYNTHETIC_SWAP_VALUES_USD.map((usd) => {
    const gross = BigInt(usd) * 1_000000000000000000n
    return observeShadowEconomics({
      kind: SHADOW_OBSERVATION_KIND.SYNTHETIC_TEST,
      costs: {
        venueFeesBps: structuralRouteCostBps,
        bridgeCostsBps: 0,
        gasCostBps: 8,
        venueFeesEmbeddedInGross: true,
        bridgeCostsEmbeddedInGross: true,
      },
      grossOutputRaw: gross.toString(),
      swapValueNormalized: usd,
      inputAmountRaw: gross.toString(),
      quoteTimestamp: timestamp,
      quoteExpiry: expiry,
    })
  })
}

export function observeFactualMelegaLpShadow(liveQuote: NormalizedQuote): ShadowEconomicObservation {
  return observeShadowEconomics({
    kind: SHADOW_OBSERVATION_KIND.LIVE_FACTUAL_SHADOW,
    liveQuote,
    venueId: liveQuote.venueId,
    costs: {
      venueFeesBps: MELEGA_FACTUAL_LP_FEE_BPS,
      bridgeCostsBps: 0,
      gasCostBps: null,
      venueFeesEmbeddedInGross: true,
      bridgeCostsEmbeddedInGross: true,
    },
    grossOutputRaw: liveQuote.grossOutputRaw,
    swapValueNormalized: null,
    inputAmountRaw: liveQuote.inputAmountRaw,
    quoteTimestamp: liveQuote.quotedAt,
    quoteExpiry: liveQuote.expiresAt ?? liveQuote.quotedAt,
  })
}
