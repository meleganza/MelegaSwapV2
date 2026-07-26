/**
 * SMART_SWAP_MODULE_002 — route engine failure states.
 * Empty route arrays are never a success.
 */

export const SMART_SWAP_ROUTE_FAILURES = [
  'NO_ROUTE',
  'PARTIAL_ROUTE_DATA',
  'QUOTE_UNAVAILABLE',
  'LIQUIDITY_UNAVAILABLE',
  'NETWORK_UNAVAILABLE',
  'UNSUPPORTED_PAIR',
] as const

export type SmartSwapRouteFailure = (typeof SMART_SWAP_ROUTE_FAILURES)[number]

export interface SmartSwapRouteFailureResult {
  status: 'failure'
  failure: SmartSwapRouteFailure
  message: string
  routes: []
  recommendedRouteId: null
  recommendationReason: null
}

export function routeFailure(
  failure: SmartSwapRouteFailure,
  message?: string,
): SmartSwapRouteFailureResult {
  const defaults: Record<SmartSwapRouteFailure, string> = {
    NO_ROUTE: 'No executable route found for this pair and amount.',
    PARTIAL_ROUTE_DATA: 'Route data is incomplete — impact or path fields are missing.',
    QUOTE_UNAVAILABLE: 'A quote could not be produced from approved DEX sources.',
    LIQUIDITY_UNAVAILABLE: 'Insufficient on-chain liquidity for this trade.',
    NETWORK_UNAVAILABLE: 'Network or RPC is unavailable for route discovery.',
    UNSUPPORTED_PAIR: 'This token pair is unsupported by Smart Swap route intelligence.',
  }
  return {
    status: 'failure',
    failure,
    message: message ?? defaults[failure],
    routes: [],
    recommendedRouteId: null,
    recommendationReason: null,
  }
}

export function isRouteFailure(value: { status: string }): value is SmartSwapRouteFailureResult {
  return value.status === 'failure'
}
