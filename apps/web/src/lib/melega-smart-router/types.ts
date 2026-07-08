import type { Currency } from '@pancakeswap/sdk'
import { TradeType } from '@pancakeswap/sdk'

export const MELEGA_SMART_ROUTER_ARCHITECTURE = 'ADAPTER' as const

export const D87_PRICING_REF = 'D87_DEX_PRICING_RATIFIED' as const
export const FSC_01_POLICY_REF = 'FSC-01' as const

export type SmartRouterBlockCode =
  | 'BLOCKED_CONFIG_MARCO_TOKEN_MISSING'
  | 'BLOCKED_TREASURY_COLLECTOR_MISSING'
  | 'BLOCKED_UNDERLYING_ROUTER_MISSING'
  | 'SMART_ROUTER_EXACT_OUTPUT_UNSUPPORTED'
  | 'SMART_ROUTER_FEE_ON_TRANSFER_UNSUPPORTED'

export type RegistryStatus = 'active' | 'planned' | 'missing'

export type RegistrySource =
  | 'treasury-runtime'
  | 'kerl'
  | 'env'
  | 'static-dev'
  | 'config'

export const MELEGA_SMART_ROUTER_PHASE = {
  current: 'ADAPTER',
  target: 'WRAPPER',
} as const

export interface MarcoRegistryEntry {
  chainId: number
  chainName: string
  marcoTokenAddress?: string
  status: RegistryStatus
  source: RegistrySource
  lastVerifiedAt: string
  registryVersion?: string
}

export interface TreasuryCollectorEntry {
  chainId: number
  collectorAddress?: string
  status: RegistryStatus
  source: RegistrySource
  policyRef: typeof FSC_01_POLICY_REF
  lastVerifiedAt: string
  registryVersion?: string
  collectorVersion?: string | null
}

export interface UnderlyingRouterEntry {
  chainId: number
  routerAddress?: string
  status: RegistryStatus
  source: 'config'
}

export interface ProtocolFeeCollectedEvent {
  user: string
  chainId: number
  inputToken: string
  outputToken: string
  feeToken: string
  grossAmountIn: string
  netAmountIn: string
  feeAmount: string
  protocolFeeBps: number
  buyMarcoIncentiveApplied: boolean
  underlyingRouter: string
  treasuryCollector: string
  pricingRef: typeof D87_PRICING_REF
  treasuryPolicyRef: typeof FSC_01_POLICY_REF
  timestamp: string
}

export interface SmartRouterSwapRoutedEvent {
  user: string
  inputToken: string
  outputToken: string
  grossAmountIn: string
  netAmountIn: string
  amountOut: string
  underlyingRouter: string
  routeHash: string
  pricingRef: typeof D87_PRICING_REF
}

export interface MelegaSmartRouterSwapPlan {
  ok: true
  architecture: typeof MELEGA_SMART_ROUTER_ARCHITECTURE
  chainId: number
  protocolFeeBps: number
  buyMarcoIncentiveApplied: boolean
  grossAmountIn: string
  netAmountIn: string
  feeAmount: string
  feeToken: string
  inputToken: string
  outputToken: string
  underlyingRouter: string
  treasuryCollector: string
  marcoRegistry: MarcoRegistryEntry
  collectorRegistry: TreasuryCollectorEntry
  events: {
    protocolFeeCollected: Omit<ProtocolFeeCollectedEvent, 'user' | 'timestamp'>
    smartRouterSwapRouted: Omit<SmartRouterSwapRoutedEvent, 'user'>
  }
}

export interface MelegaSmartRouterBlocked {
  ok: false
  architecture: typeof MELEGA_SMART_ROUTER_ARCHITECTURE
  code: SmartRouterBlockCode
  message: string
  chainId: number
}

export type MelegaSmartRouterResult = MelegaSmartRouterSwapPlan | MelegaSmartRouterBlocked

export interface PrepareSmartRouterSwapInput {
  chainId: number
  user?: string
  tradeType: TradeType
  inputAmount: { currency: Currency; toSignificant: (decimals?: number) => string }
  outputAmount: { currency: Currency; toSignificant: (decimals?: number) => string }
  feeOnTransfer?: boolean
}
