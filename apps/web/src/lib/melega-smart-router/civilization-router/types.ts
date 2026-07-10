import type { ExecutionManifest } from '../execution-manifest/types'
import type { MelegaSmartRouterResult } from '../types'

export const CIVILIZATION_ROUTER_SCHEMA = 'melega.civilization-router.v1' as const
export const CIVILIZATION_ROUTER_VERSION = '1.0.0' as const

/** Canonical route types — Phase 9. */
export type CivilizationRouteType =
  | 'STANDARD_SWAP'
  | 'BUY_MARCO'
  | 'SELL_MARCO'
  | 'NARRATIVE_TRADE'
  | 'AI_SERVICE'
  | 'MARKETPLACE_SERVICE'
  | 'MARKETPLACE_SETTLEMENT'
  | 'TREASURY_TRANSFER'
  | 'INTERNAL_ROUTING'
  | 'REFERRAL'
  | 'PROPAGATION'

export type RouteAvailability = 'supported' | 'planned' | 'blocked'

export type CivilizationBlockCode =
  | 'BLOCKED_WRAPPER_NOT_DEPLOYED'
  | 'BLOCKED_TREASURY_COLLECTOR_MISSING'
  | 'BLOCKED_CONFIG_MARCO_TOKEN_MISSING'
  | 'BLOCKED_UNDERLYING_ROUTER_MISSING'
  | 'BLOCKED_CHAIN_NOT_INDEXED'
  | 'NARRATIVE_TRADE_BLOCKED_BY_MISSING_ROUTER_CONTRACT'
  | 'AI_SERVICE_BLOCKED_BY_MISSING_ROUTER_CONTRACT'
  | 'MARKETPLACE_SERVICE_BLOCKED_BY_MISSING_ROUTER_CONTRACT'
  | 'MARKETPLACE_SETTLEMENT_BLOCKED_BY_MISSING_ROUTER_CONTRACT'
  | 'TREASURY_TRANSFER_BLOCKED_BY_MISSING_RUNTIME'
  | 'REFERRAL_BLOCKED_BY_MISSING_RUNTIME'
  | 'PROPAGATION_BLOCKED_BY_MISSING_SCHEMA'
  | 'INTERNAL_ROUTING_BLOCKED_BY_MISSING_SCHEMA'
  | 'D90_SCHEMA_NOT_DEFINED'
  | 'D99_SCHEMA_NOT_DEFINED'
  | 'BNB_TESTNET_BLOCKED'
  | 'SMART_ROUTER_EXACT_OUTPUT_UNSUPPORTED'
  | 'SMART_ROUTER_FEE_ON_TRANSFER_UNSUPPORTED'

export interface RouteTypeDefinition {
  id: CivilizationRouteType
  supported: boolean
  planned: boolean
  blocked: boolean
  blockerReason: string
  requiredInputs: string[]
  requiredRegistries: string[]
  requiredSettlement: string
  machineSchema: string
}

export interface NarrativeTradeMetadata {
  narrativeId: string
  sourceOrgan: string
  initiator: string
  asset: string
  pricingRef: string
  feeRef: string
  settlementRef: string
  referralRef?: string
  treasuryRef: string
  D90Ref?: string
  D99Ref?: string
  KERLRef: string
  machineReadable: true
}

export interface AIServiceRouteMetadata {
  serviceId: string
  agentId: string
  buyer: string
  seller: string
  pricingRef: string
  policyRef: string
  treasuryRef: string
  settlementRef: string
  machineReadable: true
}

export interface CivilizationSwapRouteInput {
  routeType: 'STANDARD_SWAP' | 'BUY_MARCO' | 'SELL_MARCO'
  chainId: number
  user?: string
  tradeType: import('@pancakeswap/sdk').TradeType
  inputAmount: { currency: import('@pancakeswap/sdk').Currency; toSignificant: (decimals?: number) => string }
  outputAmount: { currency: import('@pancakeswap/sdk').Currency; toSignificant: (decimals?: number) => string }
  feeOnTransfer?: boolean
}

export interface CivilizationNarrativeRouteInput {
  routeType: 'NARRATIVE_TRADE'
  chainId: number
  metadata: NarrativeTradeMetadata
}

export interface CivilizationAIServiceRouteInput {
  routeType: 'AI_SERVICE' | 'MARKETPLACE_SERVICE' | 'MARKETPLACE_SETTLEMENT'
  chainId: number
  metadata: AIServiceRouteMetadata
}

export interface CivilizationGenericRouteInput {
  routeType: Exclude<
    CivilizationRouteType,
    'STANDARD_SWAP' | 'BUY_MARCO' | 'SELL_MARCO' | 'NARRATIVE_TRADE' | 'AI_SERVICE' | 'MARKETPLACE_SERVICE' | 'MARKETPLACE_SETTLEMENT'
  >
  chainId: number
  metadata?: Record<string, unknown>
}

export type CivilizationRouteInput =
  | CivilizationSwapRouteInput
  | CivilizationNarrativeRouteInput
  | CivilizationAIServiceRouteInput
  | CivilizationGenericRouteInput

export interface TreasuryHandoffPreparedEvent {
  routeType: CivilizationRouteType
  chainId: number
  executionId: string
  treasuryPolicyRef: 'FSC-01'
  pricingRef: 'D87_DEX_PRICING_RATIFIED'
  collectorAddress: string | null
  protocolFee: string | null
  handoffPath: '/api/treasury/settlement-events'
  settlementOwnedBy: 'Treasury Runtime'
  forbiddenLocalSplit: true
}

export interface CivilizationRoutePrepared {
  ok: true
  schema: typeof CIVILIZATION_ROUTER_SCHEMA
  routeType: CivilizationRouteType
  chainId: number
  architecture: 'ADAPTER' | 'WRAPPER'
  swapPlan?: MelegaSmartRouterResult
  executionManifest: ExecutionManifest
  treasuryHandoff?: TreasuryHandoffPreparedEvent
  events: {
    civilizationRouteSubmitted: {
      routeType: CivilizationRouteType
      chainId: number
      architecture: 'ADAPTER' | 'WRAPPER'
      machineReadable: true
    }
    treasuryHandoffPrepared?: TreasuryHandoffPreparedEvent
    narrativeTradeRouted?: { blocked: true; reason: string }
    aiServiceRouted?: { blocked: true; reason: string }
  }
}

export interface CivilizationRouteBlocked {
  ok: false
  schema: typeof CIVILIZATION_ROUTER_SCHEMA
  routeType: CivilizationRouteType
  chainId: number
  code: CivilizationBlockCode
  message: string
  executionManifest: ExecutionManifest
  events: {
    civilizationRouteSubmitted: {
      routeType: CivilizationRouteType
      chainId: number
      architecture: 'ADAPTER' | 'WRAPPER'
      blocked: true
      code: CivilizationBlockCode
      machineReadable: true
    }
  }
}

export type CivilizationRouteResult = CivilizationRoutePrepared | CivilizationRouteBlocked

export interface BlockerAuditRow {
  phase: string
  requirement: string
  status: 'READY' | 'PARTIAL' | 'BLOCKED'
  evidence: string
  nextRequiredAction: string
}

export interface ChainRegistryEntry {
  chainId: number
  chainName: string
  wrapperAddress: string | null
  wrapperStatus?: string
  wrapperVersion?: number
  validationStatus?: string
  validationCertificate?: string
  underlyingRouter: string | null
  MARCO: string | null
  treasuryCollector: string | null
  KERLRegistry: string
  TreasuryRuntime: string
  supportedAssets: string[]
  supportedRouteTypes: CivilizationRouteType[]
  executableRouteTypes?: CivilizationRouteType[]
  status: 'active' | 'active_testnet' | 'blocked' | 'planned' | 'partial'
  blockerReason: string | null
  lastVerifiedAt: string
  version: string
}
