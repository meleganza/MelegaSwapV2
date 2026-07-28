import { routeFailure, type SmartSwapRouteFailure, type SmartSwapRouteFailureResult } from './failure'
import { normalizeSmartSwapRoute } from './normalizeRoute'
import { rankSmartSwapRoutes } from './rankRoutes'
import type { SmartSwapRoute, SmartSwapTradeSnapshot } from './types'

export interface SmartSwapRouteSuccessResult {
  status: 'ok'
  routes: SmartSwapRoute[]
  recommendedRouteId: string | null
  recommendationReason: string | null
  rankingBreakdown: Record<string, { total: number; breakdown: string[] }>
}

export type SmartSwapRouteEngineResult = SmartSwapRouteSuccessResult | SmartSwapRouteFailureResult

export interface BuildRouteEngineInput {
  snapshots: SmartSwapTradeSnapshot[]
  /** Force a failure before normalization (e.g. network down). */
  forceFailure?: SmartSwapRouteFailure
  /** When true, zero snapshots → NO_ROUTE (never empty success). */
  emptyMeansNoRoute?: boolean
}

/**
 * Build a route-engine result from approved DEX trade snapshots.
 * Never returns status=ok with an empty routes array.
 */
export function buildSmartSwapRouteEngineResult(input: BuildRouteEngineInput): SmartSwapRouteEngineResult {
  if (input.forceFailure) {
    return routeFailure(input.forceFailure)
  }

  const snapshots = input.snapshots ?? []
  if (snapshots.length === 0) {
    return routeFailure(input.emptyMeansNoRoute === false ? 'QUOTE_UNAVAILABLE' : 'NO_ROUTE')
  }

  const routes = snapshots.map(normalizeSmartSwapRoute)
  const usable = routes.filter((r) => r.routeType !== 'UNSUPPORTED' && r.expectedOutputRaw !== '0')

  if (usable.length === 0) {
    if (routes.some((r) => r.routeType === 'UNSUPPORTED')) {
      return routeFailure('UNSUPPORTED_PAIR')
    }
    const partial = routes.some(
      (r) =>
        r.priceImpact.availability === 'unavailable' ||
        r.hops.length === 0 ||
        !r.expectedOutputRaw ||
        r.expectedOutputRaw === '0',
    )
    if (partial) return routeFailure('PARTIAL_ROUTE_DATA')
    return routeFailure('LIQUIDITY_UNAVAILABLE')
  }

  const ranking = rankSmartSwapRoutes(usable)
  if (!ranking.recommendedRouteId) {
    return routeFailure('QUOTE_UNAVAILABLE')
  }

  return {
    status: 'ok',
    routes: usable,
    recommendedRouteId: ranking.recommendedRouteId,
    recommendationReason: ranking.recommendationReason,
    rankingBreakdown: ranking.scores,
  }
}
