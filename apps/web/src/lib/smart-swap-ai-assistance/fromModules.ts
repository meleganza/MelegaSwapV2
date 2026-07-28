/**
 * Adapt Module 003 / 004 public state into AI assistance context (read-only).
 */

import type { SmartSwapPreviewResult } from 'lib/smart-swap-execution-preview'
import type { SmartSwapFeeTransparency } from 'lib/smart-swap-fee-transparency'
import type { SmartSwapAIAssistanceContext } from './types'

export function aiContextFromPreviewAndFee(params: {
  preview: SmartSwapPreviewResult
  fee?: SmartSwapFeeTransparency | null
  preferredType?: SmartSwapAIAssistanceContext['preferredType']
}): SmartSwapAIAssistanceContext {
  const { preview, fee, preferredType } = params

  if (preview.status !== 'ok' || !preview.preview) {
    return {
      preferredType: preferredType ?? 'ERROR_EXPLANATION',
      noRoute: preview.status === 'failure' && preview.failure === 'NO_ROUTE',
      previewFailureCode: preview.status === 'failure' ? preview.failure : 'QUOTE_UNAVAILABLE',
      feeAvailable: fee ? fee.state === 'AVAILABLE' || fee.state === 'PARTIAL' : null,
      feeLabel: fee?.protocolFee.label ?? null,
      freshness: null,
    }
  }

  const p = preview.preview
  const pathSymbols = p.hopVisualization.filter((h) => h.kind === 'token').map((h) => h.label)
  const hopCount = p.routeHops?.length ?? Math.max(0, pathSymbols.length - 1)

  return {
    preferredType,
    hopCount,
    pathSymbols: pathSymbols.length >= 2 ? pathSymbols : [p.inputToken.symbol, p.outputToken.symbol],
    routeId: p.routeId,
    priceImpactPercent: p.priceImpactPercent,
    priceImpactSeverity: p.priceImpactSeverity,
    liquidityAvailable: p.warnings.some((w) => w.code === 'INSUFFICIENT_LIQUIDITY') ? false : hopCount > 0,
    feeAvailable: fee ? fee.protocolFee.bps != null : p.protocolFee.availability === 'available',
    feeLabel: fee?.protocolFee.label ?? p.protocolFee.label,
    inputSymbol: p.inputToken.symbol,
    outputSymbol: p.outputToken.symbol,
    freshness: p.freshness,
  }
}
