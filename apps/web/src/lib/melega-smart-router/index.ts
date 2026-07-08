export {
  MELEGA_SMART_ROUTER_ARCHITECTURE,
  MELEGA_SMART_ROUTER_PHASE,
  D87_PRICING_REF,
  FSC_01_POLICY_REF,
} from './types'

export type {
  MarcoRegistryEntry,
  TreasuryCollectorEntry,
  MelegaSmartRouterResult,
  MelegaSmartRouterSwapPlan,
  MelegaSmartRouterBlocked,
  SmartRouterBlockCode,
  ProtocolFeeCollectedEvent,
  SmartRouterSwapRoutedEvent,
} from './types'

export {
  getMarcoRegistryEntry,
  isBuyMarcoByAddress,
  isSellMarcoByAddress,
  isChainMarcoToken,
  normalizeTokenAddress,
} from './marcoRegistry'

export { getTreasuryCollectorEntry } from './treasuryCollectorRegistry'
export { getUnderlyingRouterEntry } from './underlyingRouterRegistry'
export { resolveProtocolFeeBps, computeProtocolFeeAmounts } from './protocolFee'

export {
  prepareMelegaSmartRouterSwap,
  buildProtocolFeeCollectedEvent,
  buildSmartRouterSwapRoutedEvent,
} from './smartRouterAdapter'

export { getSmartRouterReadiness, getMultiChainArchitectureNotes } from './readiness'
export { buildMainnetReadinessMatrix, getPhase2Verdict } from './mainnetReadiness'
export {
  resolveTreasuryCollector,
  resolveMarcoToken,
  readSmartRouterChainProfile,
} from './registry'
export * from './wrapper/spec'
