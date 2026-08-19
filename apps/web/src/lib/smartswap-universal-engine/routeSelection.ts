/**
 * Deterministic net-execution comparison.
 * BEST ROUTE != highest raw output. No home-venue preference.
 * Not activated in production during M1.
 */

import type { NormalizedQuote } from './quote'
import { canMarkRouteProductionCapable } from './fee'

export interface RouteComparisonScore {
  quoteId: string
  venueId: string
  total: number
  netUserOutputRaw: string | null
  breakdown: string[]
  eligible: boolean
  reason: string
}

export interface RouteSelectionResult {
  orderedQuoteIds: string[]
  selectedQuoteId: string | null
  scores: RouteComparisonScore[]
  productionActivation: false
}

function asBigInt(value: string | null | undefined): bigint | null {
  if (value == null || value === '') return null
  try {
    return BigInt(value)
  } catch {
    return null
  }
}

function impactScore(percent: number | null): number {
  if (percent == null) return 40
  if (percent <= 0.5) return 100
  if (percent <= 1) return 85
  if (percent <= 2) return 70
  if (percent <= 5) return 45
  if (percent <= 15) return 20
  return 0
}

function freshnessScore(quote: NormalizedQuote): number {
  if (quote.stale || !quote.valid) return 0
  return 100
}

function healthPenalty(quote: NormalizedQuote): number {
  if (!quote.valid) return 0
  if (quote.confidence == null) return 70
  return Math.max(0, Math.min(100, quote.confidence))
}

/**
 * Compare economically executable outcomes.
 * Missing net output is a defect, not a reason to invent a winner.
 */
export function compareNormalizedQuotes(quotes: NormalizedQuote[]): RouteSelectionResult {
  const scores: RouteComparisonScore[] = quotes.map((quote) => {
    const net = asBigInt(quote.netUserOutputRaw) ?? asBigInt(quote.grossOutputRaw)
    const eligible =
      quote.valid &&
      !quote.stale &&
      net != null &&
      net > 0n &&
      quote.productionExecutionCapable === false
    const impact = impactScore(quote.priceImpactPercent)
    const fresh = freshnessScore(quote)
    const health = healthPenalty(quote)
    const feeReady = canMarkRouteProductionCapable(quote.protocolFee) ? 100 : 50
    const total = eligible ? impact * 0.25 + fresh * 0.15 + health * 0.2 + feeReady * 0.1 : 0
    return {
      quoteId: quote.quoteId,
      venueId: quote.venueId,
      total,
      netUserOutputRaw: net?.toString() ?? null,
      breakdown: [
        `net=${net?.toString() ?? 'missing'}`,
        `impact=${impact}`,
        `fresh=${fresh}`,
        `health=${health}`,
        `feeReady=${feeReady}`,
        `venue=${quote.venueId}`,
      ],
      eligible,
      reason: eligible
        ? 'Compared on net executable outcome. No home-venue preference.'
        : 'Ineligible: invalid, stale, missing net, or production-capable flag forbidden in M1.',
    }
  })

  const eligible = scores.filter((row) => row.eligible && row.netUserOutputRaw)
  eligible.sort((a, b) => {
    const netA = BigInt(a.netUserOutputRaw || '0')
    const netB = BigInt(b.netUserOutputRaw || '0')
    if (netB !== netA) return netB > netA ? 1 : -1
    if (b.total !== a.total) return b.total - a.total
    return a.quoteId.localeCompare(b.quoteId)
  })

  return {
    orderedQuoteIds: eligible.map((row) => row.quoteId),
    selectedQuoteId: eligible[0]?.quoteId ?? null,
    scores,
    productionActivation: false,
  }
}
