/**
 * Grounded explanation builder — factual, traceable, no advisory authority.
 * Does not call models with private data; does not select routes or execute.
 */

import { aiAssistanceFailure } from './failure'
import { assertSafeAIExplanation } from './safety'
import type {
  SmartSwapAIAssistance,
  SmartSwapAIAssistanceContext,
  SmartSwapAIAssistanceResult,
  SmartSwapAIConfidence,
  SmartSwapAIContextType,
} from './types'

function confidenceFrom(parts: { complete: boolean; partial: boolean; none: boolean }): {
  confidence: SmartSwapAIConfidence
  confidenceReason: string
} {
  if (parts.none) {
    return { confidence: 'UNAVAILABLE', confidenceReason: 'No explanation possible from available context.' }
  }
  if (parts.complete) {
    return { confidence: 'HIGH', confidenceReason: 'Source data complete for this explanation type.' }
  }
  if (parts.partial) {
    return { confidence: 'MEDIUM', confidenceReason: 'Partial data — explanation limited to known facts.' }
  }
  return { confidence: 'LOW', confidenceReason: 'Limited context for this explanation.' }
}

function resolveType(ctx: SmartSwapAIAssistanceContext): SmartSwapAIContextType | null {
  if (ctx.preferredType) return ctx.preferredType
  if (ctx.noRoute || ctx.previewFailureCode === 'NO_ROUTE') return 'ERROR_EXPLANATION'
  if (ctx.priceImpactSeverity === 'HIGH' || (ctx.priceImpactPercent != null && ctx.priceImpactPercent >= 5)) {
    return 'PRICE_IMPACT_EXPLANATION'
  }
  if (ctx.liquidityAvailable === false) return 'LIQUIDITY_EXPLANATION'
  if (ctx.feeAvailable && ctx.feeLabel) return 'FEE_EXPLANATION'
  if ((ctx.hopCount != null && ctx.hopCount > 0) || (ctx.pathSymbols && ctx.pathSymbols.length >= 2)) {
    return 'ROUTE_EXPLANATION'
  }
  if (ctx.previewFailureCode) return 'ERROR_EXPLANATION'
  return null
}

function buildRouteExplanation(ctx: SmartSwapAIAssistanceContext): {
  explanation: string
  complete: boolean
  partial: boolean
  relatedRoute: string | null
} {
  const hops = ctx.hopCount ?? (ctx.pathSymbols ? Math.max(0, ctx.pathSymbols.length - 1) : null)
  const path = ctx.pathSymbols?.filter(Boolean) ?? []
  const hopWord = hops === 1 ? 'one' : hops === 2 ? 'two' : hops != null ? String(hops) : null
  if (hops != null && hops >= 2 && path.length >= 3) {
    const mid = path.slice(1, -1).join(' → ')
    return {
      explanation: `This route uses ${hopWord} liquidity pools. Your swap passes through ${mid} before reaching ${
        path[path.length - 1]
      }.`,
      complete: true,
      partial: false,
      relatedRoute: path.join(' → '),
    }
  }
  if (hops === 1 && path.length >= 2) {
    return {
      explanation: `This route uses one liquidity pool (${path[0]}/${path[1]}).`,
      complete: true,
      partial: false,
      relatedRoute: path.join(' → '),
    }
  }
  if (hops != null && hops > 0 && hopWord) {
    return {
      explanation: `This route uses ${hopWord} liquidity pool${hops === 1 ? '' : 's'}.`,
      complete: false,
      partial: true,
      relatedRoute: ctx.routeId ?? null,
    }
  }
  return {
    explanation: 'Information unavailable.',
    complete: false,
    partial: false,
    relatedRoute: null,
  }
}

function buildImpactExplanation(ctx: SmartSwapAIAssistanceContext): {
  explanation: string
  complete: boolean
  partial: boolean
} {
  if (ctx.priceImpactPercent != null && Number.isFinite(ctx.priceImpactPercent)) {
    const pct = ctx.priceImpactPercent.toFixed(2)
    if (ctx.priceImpactSeverity === 'HIGH' || ctx.priceImpactPercent >= 5) {
      return {
        explanation: `Price impact is elevated (${pct}%) because available liquidity for this trade size appears limited.`,
        complete: ctx.liquidityAvailable != null,
        partial: ctx.liquidityAvailable == null,
      }
    }
    return {
      explanation: `Reported price impact is ${pct}%. Review the preview before confirming.`,
      complete: true,
      partial: false,
    }
  }
  if (ctx.priceImpactSeverity === 'HIGH') {
    return {
      explanation: 'Price impact is higher because available liquidity is limited.',
      complete: false,
      partial: true,
    }
  }
  return { explanation: 'Information unavailable.', complete: false, partial: false }
}

function buildLiquidityExplanation(ctx: SmartSwapAIAssistanceContext): {
  explanation: string
  complete: boolean
  partial: boolean
} {
  if (ctx.liquidityAvailable === false) {
    return {
      explanation:
        'This pair has lower available liquidity compared with other supported routes, or no usable liquidity was found for the requested amount.',
      complete: true,
      partial: false,
    }
  }
  if (ctx.liquidityAvailable === true) {
    return {
      explanation: 'Liquidity is available for this pair based on the current quote context.',
      complete: true,
      partial: false,
    }
  }
  return { explanation: 'Information unavailable.', complete: false, partial: false }
}

function buildFeeExplanation(ctx: SmartSwapAIAssistanceContext): {
  explanation: string
  complete: boolean
  partial: boolean
} {
  if (ctx.feeAvailable && ctx.feeLabel) {
    return {
      explanation: `The protocol fee shown (${ctx.feeLabel}) is determined by the canonical fee engine. Smart Swap only displays it.`,
      complete: true,
      partial: false,
    }
  }
  if (ctx.feeAvailable === false) {
    return {
      explanation: 'Protocol fee details are not available for this trade yet.',
      complete: false,
      partial: true,
    }
  }
  return { explanation: 'Information unavailable.', complete: false, partial: false }
}

function buildErrorExplanation(ctx: SmartSwapAIAssistanceContext): {
  explanation: string
  complete: boolean
  partial: boolean
} {
  if (ctx.noRoute || ctx.previewFailureCode === 'NO_ROUTE') {
    return {
      explanation: 'No route is currently available for this token pair.',
      complete: true,
      partial: false,
    }
  }
  if (ctx.previewFailureCode === 'QUOTE_UNAVAILABLE') {
    return {
      explanation: 'A quote is not available yet. Enter an amount or adjust the pair, then review the preview.',
      complete: true,
      partial: false,
    }
  }
  if (ctx.previewFailureCode) {
    return {
      explanation: `Preview reports ${ctx.previewFailureCode.replace(/_/g, ' ').toLowerCase()}. AI does not change execution.`,
      complete: false,
      partial: true,
    }
  }
  return { explanation: 'Information unavailable.', complete: false, partial: false }
}

/**
 * Build optional AI assistance. Failures never block swap execution.
 */
export function buildSmartSwapAIAssistance(
  ctx: SmartSwapAIAssistanceContext | null | undefined,
): SmartSwapAIAssistanceResult {
  if (ctx?.aiEnabled === false || ctx?.forceFailure === 'AI_UNAVAILABLE') {
    return aiAssistanceFailure('AI_UNAVAILABLE')
  }
  if (ctx?.timedOut || ctx?.forceFailure === 'TIMEOUT') {
    return aiAssistanceFailure('TIMEOUT')
  }
  if (!ctx || ctx.forceFailure === 'CONTEXT_UNAVAILABLE') {
    return aiAssistanceFailure('CONTEXT_UNAVAILABLE')
  }
  if (ctx.forceFailure === 'INSUFFICIENT_DATA') {
    return aiAssistanceFailure('INSUFFICIENT_DATA')
  }
  if (ctx.forceFailure === 'PARTIAL_CONTEXT') {
    return aiAssistanceFailure('PARTIAL_CONTEXT')
  }

  const type = resolveType(ctx)
  if (!type) {
    return aiAssistanceFailure('INSUFFICIENT_DATA')
  }

  let explanation = 'Information unavailable.'
  let complete = false
  let partial = false
  let relatedRoute: string | null = ctx.routeId ?? null
  const warnings: string[] = []

  if (type === 'ROUTE_EXPLANATION') {
    const r = buildRouteExplanation(ctx)
    explanation = r.explanation
    complete = r.complete
    partial = r.partial
    relatedRoute = r.relatedRoute
  } else if (type === 'PRICE_IMPACT_EXPLANATION') {
    const r = buildImpactExplanation(ctx)
    explanation = r.explanation
    complete = r.complete
    partial = r.partial
  } else if (type === 'LIQUIDITY_EXPLANATION') {
    const r = buildLiquidityExplanation(ctx)
    explanation = r.explanation
    complete = r.complete
    partial = r.partial
  } else if (type === 'FEE_EXPLANATION') {
    const r = buildFeeExplanation(ctx)
    explanation = r.explanation
    complete = r.complete
    partial = r.partial
  } else {
    const r = buildErrorExplanation(ctx)
    explanation = r.explanation
    complete = r.complete
    partial = r.partial
  }

  explanation = assertSafeAIExplanation(explanation)
  if (explanation === 'Information unavailable.') {
    return aiAssistanceFailure('INSUFFICIENT_DATA')
  }

  const none = false
  const { confidence, confidenceReason } = confidenceFrom({ complete, partial, none })
  if (partial) warnings.push('Explanation based on partial context.')
  warnings.push('AI assistance is optional and does not execute or select routes.')

  const relatedToken = ctx.outputSymbol ?? ctx.inputSymbol ?? null
  const generatedAt = ctx.generatedAt ?? new Date().toISOString()

  const assistance: SmartSwapAIAssistance = {
    contextType: type,
    explanation,
    source: 'smart-swap-ai-assistance:grounded-context',
    confidence,
    confidenceReason,
    generatedAt,
    freshness: ctx.freshness ?? null,
    relatedRoute,
    relatedToken,
    warnings,
  }

  return { status: 'ok', assistance, optional: true }
}
