import type { Currency, TradeType } from '@pancakeswap/sdk'
import type { RouteType, TradeWithStableSwap } from '@pancakeswap/smart-router/evm'

/**
 * Internal routing output — produced only by the existing routing pipeline.
 * Not a public API. Not wired to KERL runtime.
 */
export type RoutingDomain = 'swap-smart' | 'swap-v2' | 'bridge'

export interface SwapRoutingPlanBase {
  domain: 'swap-smart' | 'swap-v2'
  allowedSlippageBps: number
  recipient: string | null
  fallbackV2: boolean
  routerAddress?: string
  routeType?: RouteType
}

export interface SmartSwapRoutingPlan extends SwapRoutingPlanBase {
  domain: 'swap-smart'
  trade: TradeWithStableSwap<Currency, Currency, TradeType>
}

export interface V2SwapRoutingPlan extends SwapRoutingPlanBase {
  domain: 'swap-v2'
  // V2 trade is passed opaquely to execution adapters — routing layer does not encode calldata.
  trade: unknown
}

export type SwapRoutingPlan = SmartSwapRoutingPlan | V2SwapRoutingPlan

export interface BridgeRoutingPlan {
  domain: 'bridge'
  pid: number
  isNative: boolean
  amount: string
}

export type RoutingPlan = SwapRoutingPlan | BridgeRoutingPlan
