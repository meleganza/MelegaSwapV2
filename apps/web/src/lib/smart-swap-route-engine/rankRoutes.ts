import type { SmartSwapRoute } from './types'

export interface SmartSwapRouteRanking {
  orderedRouteIds: string[]
  recommendedRouteId: string | null
  /** Explainable factual reason — never "best route guaranteed". */
  recommendationReason: string | null
  scores: Record<string, { total: number; breakdown: string[] }>
}

function outputScore(route: SmartSwapRoute, maxOutput: bigint): number {
  try {
    const out = BigInt(route.expectedOutputRaw || '0')
    if (maxOutput <= 0n) return 0
    return Number((out * 100n) / maxOutput)
  } catch {
    return 0
  }
}

function impactScore(route: SmartSwapRoute): number {
  if (route.priceImpact.availability !== 'available' || route.priceImpact.percent == null) {
    return 40 // neutral when unavailable — do not invent impact
  }
  const p = route.priceImpact.percent
  if (p <= 0.5) return 100
  if (p <= 1) return 85
  if (p <= 2) return 70
  if (p <= 5) return 45
  if (p <= 15) return 20
  return 0
}

function gasScore(route: SmartSwapRoute): number {
  if (route.gasEstimate.availability !== 'available' || route.gasEstimate.units == null) {
    return 50 // gas missing must not block ranking
  }
  const g = route.gasEstimate.units
  if (g <= 180_000) return 100
  if (g <= 250_000) return 80
  if (g <= 400_000) return 60
  return 40
}

function reliabilityScore(route: SmartSwapRoute): number {
  let s = route.confidence
  if (route.routeType === 'UNSUPPORTED') return 0
  if (route.routeType === 'DIRECT') s += 5
  if (route.routeType === 'STABLE') s += 3
  return Math.min(100, s)
}

/**
 * Rank routes by explainable weighted scores.
 * Weights: output 45%, impact 25%, gas 10%, reliability 20%.
 */
export function rankSmartSwapRoutes(routes: SmartSwapRoute[]): SmartSwapRouteRanking {
  const usable = routes.filter((r) => r.routeType !== 'UNSUPPORTED' && r.expectedOutputRaw !== '0')
  if (usable.length === 0) {
    return {
      orderedRouteIds: [],
      recommendedRouteId: null,
      recommendationReason: null,
      scores: {},
    }
  }

  let maxOutput = 0n
  for (const r of usable) {
    try {
      const v = BigInt(r.expectedOutputRaw)
      if (v > maxOutput) maxOutput = v
    } catch {
      /* ignore */
    }
  }

  const scores: SmartSwapRouteRanking['scores'] = {}
  const ranked = usable
    .map((route) => {
      const out = outputScore(route, maxOutput)
      const impact = impactScore(route)
      const gas = gasScore(route)
      const reliability = reliabilityScore(route)
      const total = out * 0.45 + impact * 0.25 + gas * 0.1 + reliability * 0.2
      const breakdown = [
        `output=${out.toFixed(1)} (45%)`,
        `impact=${impact.toFixed(1)} (25%)`,
        `gas=${gas.toFixed(1)} (10%)`,
        `reliability=${reliability.toFixed(1)} (20%)`,
      ]
      scores[route.routeId] = { total, breakdown }
      return { route, total }
    })
    .sort((a, b) => b.total - a.total)

  const best = ranked[0]
  const reason = best
    ? `Recommended route by factual score ${best.total.toFixed(1)} — ${scores[best.route.routeId].breakdown.join(', ')}. Not a guaranteed best price.`
    : null

  return {
    orderedRouteIds: ranked.map((r) => r.route.routeId),
    recommendedRouteId: best?.route.routeId ?? null,
    recommendationReason: reason,
    scores,
  }
}
