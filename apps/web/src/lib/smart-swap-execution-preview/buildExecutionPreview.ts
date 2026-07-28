import { D87_DEX_PRICING_RATIFIED } from 'lib/d87-pricing/codex/ratified'
import { previewFailure, type SmartSwapPreviewFailure, type SmartSwapPreviewFailureResult } from './failure'
import { classifyImpactSeverity } from './impact'
import { computeMinimumReceivedRaw, formatRawAmount } from './minimumReceived'
import type {
  SmartSwapExecutionPreview,
  SmartSwapExecutionPreviewInput,
  SmartSwapPreviewWarning,
  SmartSwapProtocolFeeDisplay,
} from './types'
import { buildHopVisualization } from './visualization'

export interface SmartSwapPreviewSuccessResult {
  status: 'ok'
  preview: SmartSwapExecutionPreview
}

export type SmartSwapPreviewResult = SmartSwapPreviewSuccessResult | SmartSwapPreviewFailureResult

function protocolFeeDisplay(isBuyMarco: boolean | undefined): SmartSwapProtocolFeeDisplay {
  const swap = D87_DEX_PRICING_RATIFIED.services.swap
  if (isBuyMarco === true) {
    return {
      bps: swap.protocolFeeBuyMarcoBps,
      availability: 'available',
      label: `${swap.protocolFeeBuyMarcoBps} bps (buy MARCO)`,
      note: 'Display only — settlement remains Treasury Runtime (FSC-01)',
      rule: 'buy-marco',
    }
  }
  if (isBuyMarco === false) {
    return {
      bps: swap.protocolFeeStandardBps,
      availability: 'available',
      label: `${swap.protocolFeeStandardBps} bps`,
      note: 'Display only — settlement remains Treasury Runtime (FSC-01)',
      rule: 'standard',
    }
  }
  return {
    bps: null,
    availability: 'unavailable',
    label: '—',
    note: 'Display only — settlement remains Treasury Runtime (FSC-01)',
    rule: 'unavailable',
  }
}

function collectWarnings(input: SmartSwapExecutionPreviewInput): SmartSwapPreviewWarning[] {
  const warnings: SmartSwapPreviewWarning[] = []
  if (input.routeUnavailable) {
    warnings.push({
      code: 'ROUTE_UNAVAILABLE',
      message: 'Route unavailable for this trade.',
      source: 'route-engine',
    })
  }
  if (input.insufficientLiquidity) {
    warnings.push({
      code: 'INSUFFICIENT_LIQUIDITY',
      message: 'Insufficient liquidity for this trade.',
      source: 'quote-liquidity',
    })
  }
  if (input.unsupportedToken) {
    warnings.push({
      code: 'UNSUPPORTED_TOKEN',
      message: 'Unsupported token for Smart Swap preview.',
      source: 'token-registry',
    })
  }
  if (input.partialData) {
    warnings.push({
      code: 'PARTIAL_ROUTE_DATA',
      message: 'Partial route data — some fields unavailable.',
      source: 'route-snapshot',
    })
  }
  if (input.stale) {
    warnings.push({
      code: 'STALE_DATA',
      message: 'Quote data may be stale — refresh before confirming.',
      source: 'freshness',
    })
  }
  const impactAvail = input.priceImpactPercent != null && Number.isFinite(input.priceImpactPercent)
  if (impactAvail && (input.priceImpactPercent as number) >= 5) {
    warnings.push({
      code: 'HIGH_PRICE_IMPACT',
      message: 'High price impact — review carefully before execution.',
      source: 'trade-price-impact',
    })
  }
  if (input.gasUnits == null) {
    warnings.push({
      code: 'GAS_ESTIMATION_UNAVAILABLE',
      message: 'Gas estimate unavailable — wallet will simulate before signing.',
      source: 'gas-estimator',
    })
  }
  return warnings
}

function confidenceFrom(input: SmartSwapExecutionPreviewInput, warnings: SmartSwapPreviewWarning[]): {
  confidence: number
  factors: string[]
} {
  const factors: string[] = []
  let score = 0
  if (input.hops.length > 0) {
    score += 25
    factors.push('route path present')
  }
  if (input.expectedOutputRaw && input.expectedOutputRaw !== '0') {
    score += 25
    factors.push('expected output available')
  }
  if (input.priceImpactPercent != null) {
    score += 20
    factors.push('price impact available')
  } else {
    factors.push('price impact unavailable')
  }
  if (input.gasUnits != null) {
    score += 10
    factors.push('gas estimate available')
  } else {
    factors.push('gas estimate unavailable')
  }
  if (input.freshness) {
    score += 10
    factors.push('freshness timestamp present')
  }
  if (!input.stale && !input.partialData) {
    score += 10
    factors.push('no stale/partial flags')
  }
  if (warnings.some((w) => w.code === 'HIGH_PRICE_IMPACT')) score -= 15
  if (input.insufficientLiquidity || input.routeUnavailable) score = 0
  return { confidence: Math.max(0, Math.min(100, score)), factors }
}

/**
 * Build execution preview from route intelligence + swap slippage settings.
 * Never returns status=ok with a null preview.
 */
export function buildSmartSwapExecutionPreview(
  input: SmartSwapExecutionPreviewInput | null | undefined,
  forceFailure?: SmartSwapPreviewFailure,
): SmartSwapPreviewResult {
  if (forceFailure) return previewFailure(forceFailure)
  if (!input) return previewFailure('QUOTE_UNAVAILABLE')
  if (input.routeUnavailable) return previewFailure('NO_ROUTE')
  if (input.insufficientLiquidity) return previewFailure('NO_ROUTE', 'Insufficient liquidity for this trade.')
  if (input.stale && (!input.expectedOutputRaw || input.expectedOutputRaw === '0')) {
    return previewFailure('STALE_DATA')
  }
  if (!input.expectedOutputRaw || input.expectedOutputRaw === '0') {
    return previewFailure('QUOTE_UNAVAILABLE')
  }
  if (input.partialData && input.hops.length === 0) {
    return previewFailure('PARTIAL_DATA')
  }

  const impactAvailability =
    input.priceImpactPercent != null && Number.isFinite(input.priceImpactPercent) ? 'available' : 'unavailable'
  const severity = classifyImpactSeverity(input.priceImpactPercent ?? null, impactAvailability)
  // Never convert unavailable impact to zero
  const impactPercent = impactAvailability === 'available' ? (input.priceImpactPercent as number) : null

  const minRaw = computeMinimumReceivedRaw(input.expectedOutputRaw, input.slippageBips)
  const warnings = collectWarnings(input)
  const { confidence, factors } = confidenceFrom(input, warnings)
  const hopVisualization = buildHopVisualization({
    inputToken: input.inputToken,
    outputToken: input.outputToken,
    hops: input.hops,
    pools: input.pools,
    pathSymbols: input.pathSymbols,
    pathAddresses: input.pathAddresses,
  })

  const preview: SmartSwapExecutionPreview = {
    routeId: input.routeId,
    inputAmount: input.inputAmount,
    inputToken: input.inputToken,
    outputToken: input.outputToken,
    expectedOutput: input.expectedOutputRaw,
    expectedOutputFormatted: input.expectedOutputFormatted ?? formatRawAmount(input.expectedOutputRaw, input.outputToken.decimals),
    minimumReceived: minRaw,
    minimumReceivedFormatted: formatRawAmount(minRaw, input.outputToken.decimals),
    slippageBips: input.slippageBips,
    priceImpactPercent: impactPercent,
    priceImpactSeverity: severity,
    priceImpactAvailability: impactAvailability,
    gasEstimateUnits: input.gasUnits ?? null,
    gasEstimateAvailability: input.gasUnits != null ? 'available' : 'unavailable',
    protocolFee: protocolFeeDisplay(input.isBuyMarco),
    routeHops: input.hops,
    liquiditySources: input.pools,
    hopVisualization,
    warnings,
    confidence,
    confidenceFactors: factors,
    explanation: `If confirmed, this swap routes ${input.inputToken.symbol} → ${input.outputToken.symbol} via ${input.hops.length} hop(s). Execution remains wallet-signed through the DEX Router.`,
    timestamp: input.nowIso ?? new Date().toISOString(),
    freshness: input.freshness ?? null,
  }

  return { status: 'ok', preview }
}
