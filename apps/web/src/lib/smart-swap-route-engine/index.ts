export { SMART_SWAP_ROUTE_ENGINE_MODULE } from './types'
export type {
  SmartSwapFeeEstimate,
  SmartSwapGasEstimate,
  SmartSwapHop,
  SmartSwapImpact,
  SmartSwapPoolRef,
  SmartSwapRoute,
  SmartSwapRouteSource,
  SmartSwapRouteType,
  SmartSwapTokenRef,
  SmartSwapTradeSnapshot,
} from './types'

export {
  SMART_SWAP_ROUTE_FAILURES,
  isRouteFailure,
  routeFailure,
  type SmartSwapRouteFailure,
  type SmartSwapRouteFailureResult,
} from './failure'

export { classifyRouteType, resolveRouteSource, buildExplanation } from './classifyRoute'
export { scoreRouteConfidence, highImpactWarning, assertConfidenceNotGuarantee } from './confidence'
export { normalizeSmartSwapRoute } from './normalizeRoute'
export { rankSmartSwapRoutes, type SmartSwapRouteRanking } from './rankRoutes'
export {
  buildSmartSwapRouteEngineResult,
  type BuildRouteEngineInput,
  type SmartSwapRouteEngineResult,
  type SmartSwapRouteSuccessResult,
} from './buildRouteEngineResult'
export { SMART_SWAP_ROUTE_ENGINE_OWNERSHIP } from './ownership'
