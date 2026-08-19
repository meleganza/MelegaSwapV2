import { PROTOCOL_FEE_STATE, canMarkRouteProductionCapable, type ProtocolFeeFact } from './fee'
import type { VenueHealthSnapshot } from './health'
import { isQuoteEligible } from './health'
import { quoteIsStale, type NormalizedQuote } from './quote'
import type { ExecutionNetwork } from './domain'
import { assetsEqual, type CanonicalAssetId } from './assetIdentity'

export interface RouteEligibilityInput {
  quote: NormalizedQuote
  health: VenueHealthSnapshot
  nowIso: string
  staleAfterMs: number
  expectedNetwork: ExecutionNetwork
  expectedInput: CanonicalAssetId
  expectedOutput: CanonicalAssetId
  requireSimulation: boolean
  simulationOk: boolean | null
}

export interface RouteEligibility {
  competeInShadow: boolean
  productionExecutionEligible: boolean
  reasons: string[]
}

export function evaluateRouteEligibility(input: RouteEligibilityInput): RouteEligibility {
  const reasons: string[] = []
  if (!input.quote.valid) reasons.push('QUOTE_INVALID')
  if (input.quote.stale || quoteIsStale(input.quote, input.nowIso, input.staleAfterMs)) reasons.push('QUOTE_STALE')
  if (!isQuoteEligible(input.health)) reasons.push('VENUE_HEALTH_BLOCKED')
  if (input.quote.network.domain !== input.expectedNetwork.domain) reasons.push('DOMAIN_MISMATCH')
  if (!assetsEqual(input.quote.inputAsset, input.expectedInput)) reasons.push('INPUT_ASSET_MISMATCH')
  if (!assetsEqual(input.quote.outputAsset, input.expectedOutput)) reasons.push('OUTPUT_ASSET_MISMATCH')
  if (input.requireSimulation && input.simulationOk !== true) reasons.push('SIMULATION_REQUIRED')

  const fee = input.quote.protocolFee
  if (!isFeeCompatibleForProduction(fee)) reasons.push('FEE_NOT_PRODUCTION_ELIGIBLE')

  const competeInShadow = input.quote.valid && !reasons.includes('QUOTE_STALE') && !reasons.includes('VENUE_HEALTH_BLOCKED')
  const productionExecutionEligible =
    competeInShadow &&
    isFeeCompatibleForProduction(fee) &&
    reasons.filter((code) => code !== 'FEE_NOT_PRODUCTION_ELIGIBLE').length === 0 &&
    canMarkRouteProductionCapable(fee)

  return { competeInShadow, productionExecutionEligible, reasons }
}

export function isFeeCompatibleForProduction(fee: ProtocolFeeFact): boolean {
  return (
    fee.state === PROTOCOL_FEE_STATE.FEE_ENFORCEABLE || fee.state === PROTOCOL_FEE_STATE.FEE_VERIFIED
  )
}

export function previewOnlyCannotBeProduction(fee: ProtocolFeeFact): boolean {
  return fee.state === PROTOCOL_FEE_STATE.FEE_PREVIEW_ONLY || fee.state === PROTOCOL_FEE_STATE.FEE_UNAVAILABLE
}
