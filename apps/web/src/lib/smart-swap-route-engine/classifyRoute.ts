import type { SmartSwapRouteSource, SmartSwapRouteType, SmartSwapTradeSnapshot } from './types'

export function classifyRouteType(snapshot: SmartSwapTradeSnapshot): SmartSwapRouteType {
  if (snapshot.unsupported) return 'UNSUPPORTED'
  if (!snapshot.pathAddresses || snapshot.pathAddresses.length < 2) return 'UNSUPPORTED'
  if (snapshot.smartRouterRouteType === 'STABLE_SWAP') return 'STABLE'
  if (snapshot.isNativeRoute) return 'NATIVE'
  const hopCount = Math.max(0, snapshot.pathAddresses.length - 1)
  if (hopCount <= 1) return 'DIRECT'
  if (hopCount >= 2) return 'MULTI_HOP'
  return 'UNSUPPORTED'
}

export function resolveRouteSource(snapshot: SmartSwapTradeSnapshot): SmartSwapRouteSource {
  if (snapshot.source) return snapshot.source
  if (snapshot.smartRouterRouteType === 'STABLE_SWAP') return 'stable-swap'
  if (snapshot.smartRouterRouteType === 'MIXED') return 'mixed'
  if (snapshot.smartRouterRouteType === 'V2') return 'v2-router'
  return 'smart-router'
}

export function buildExplanation(routeType: SmartSwapRouteType, hopCount: number, source: SmartSwapRouteSource): string {
  switch (routeType) {
    case 'DIRECT':
      return `Direct ${hopCount}-hop path via ${source}.`
    case 'MULTI_HOP':
      return `Multi-hop path (${hopCount} hops) via ${source}.`
    case 'NATIVE':
      return `Native / wrapped-native path via ${source}.`
    case 'STABLE':
      return `Stable-swap path via ${source}.`
    case 'UNSUPPORTED':
    default:
      return 'Unsupported or incomplete route.'
  }
}
