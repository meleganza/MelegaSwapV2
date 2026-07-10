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

export {
  POLICY_ENGINE_VERSION,
  POLICY_ENGINE_SCHEMA,
  resolvePricingPolicy,
  resolveTreasuryPolicy,
  resolveRegistryPolicies,
  resolveExecutionPolicy,
  resolveCompliancePolicy,
  resolveChainPolicy,
  resolveSmartRouterPolicies,
} from './policy-engine'
export type { SmartRouterPolicyBundle } from './policy-engine'

export {
  EXECUTION_MANIFEST_SCHEMA,
  MELEGA_SMART_ROUTER_ADAPTER_VERSION,
  buildExecutionManifestFromPlan,
  buildExecutionManifestFromBlocked,
  computeReceiptHash,
} from './execution-manifest'
export type { ExecutionManifest } from './execution-manifest'

export { CAPABILITY_MANIFEST_SCHEMA, buildCapabilityManifest } from './capability-manifest'
export type { CapabilityManifest, CapabilityEntry } from './capability-manifest'

export {
  describeSmartRouterCapabilities,
  describeExecution,
  explainFeeCharge,
  explainTreasurySelection,
} from './aiReadability'

export {
  EXECUTION_ADAPTER_SCHEMA,
  resolveExecutionAdapter,
  resolveExecutionAdapterForSwap,
  buildExecutionPlan,
  resolveRequiredAdapterType,
  EXECUTION_ADAPTER_MATRIX,
  EXECUTION_ADAPTER_COMPATIBILITY,
  getAdapterMatrixForChain,
  V2ExecutionAdapter,
  SmartRouterExecutionAdapter,
  AdapterResolutionError,
} from './execution-adapter'
export type {
  ExecutionPlan,
  ExecutionAdapterType,
  IExecutionAdapter,
  ResolvedExecutionAdapter,
} from './execution-adapter'

export {
  CIVILIZATION_ROUTER_SCHEMA,
  CIVILIZATION_ROUTER_VERSION,
  CIVILIZATION_ROUTER_CONTRACT_SCHEMA,
  buildBlockerAuditTable,
  buildChainRegistry,
  buildRouteTypeMatrix,
  buildCivilizationRouterContract,
  getCivilizationRouterVerdict,
  prepareCivilizationRoute,
  prepareCivilizationSwapRoute,
  classifySwapRouteType,
  getTreasuryRuntimeIntegrationStatus,
  getNarrativeTradeStatus,
  getBnbTestnetReadiness,
  getBnbMainnetReadiness,
} from './civilization-router'
export type {
  CivilizationRouteType,
  CivilizationRouteResult,
  BlockerAuditRow,
  ChainRegistryEntry,
  RouteTypeDefinition,
} from './civilization-router'
