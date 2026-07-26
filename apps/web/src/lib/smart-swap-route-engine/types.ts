/**
 * SMART_SWAP_MODULE_002 — normalized route intelligence model.
 * Presentation / comparison only. Does not execute swaps or own settlement.
 */

export const SMART_SWAP_ROUTE_ENGINE_MODULE = 'SMART_SWAP_MODULE_002_ROUTE_ENGINE' as const

export type SmartSwapRouteType =
  | 'DIRECT'
  | 'MULTI_HOP'
  | 'NATIVE'
  | 'STABLE'
  | 'UNSUPPORTED'

export type SmartSwapRouteSource =
  | 'smart-router'
  | 'v2-router'
  | 'stable-swap'
  | 'mixed'
  | 'unknown'

export type SmartSwapMetricAvailability = 'available' | 'unavailable'

export interface SmartSwapTokenRef {
  chainId: number
  address: string
  symbol: string
  decimals: number
  /** Native gas token wrapped as WNATIVE path when true. */
  isNative?: boolean
}

export interface SmartSwapPoolRef {
  address: string
  kind: 'v2' | 'stable' | 'unknown'
  token0: string
  token1: string
}

export interface SmartSwapHop {
  index: number
  pool: SmartSwapPoolRef
  tokenIn: string
  tokenOut: string
}

export interface SmartSwapImpact {
  /** Percent number e.g. 1.25 for 1.25%. Null when unavailable. */
  percent: number | null
  availability: SmartSwapMetricAvailability
  source: 'trade-price-impact' | 'unavailable'
}

export interface SmartSwapGasEstimate {
  /** Estimated gas units when known. */
  units: number | null
  availability: SmartSwapMetricAvailability
  source: 'estimator' | 'unavailable'
}

export interface SmartSwapFeeEstimate {
  /** Display-only LP fee estimate in input token raw units when known. Not FSC-01. */
  lpFeeRaw: string | null
  lpFeeSymbol: string | null
  availability: SmartSwapMetricAvailability
  source: 'realized-lp-fee' | 'unavailable'
  note: 'LP fee display only — protocol fee settlement remains Treasury Runtime'
}

export interface SmartSwapRoute {
  routeId: string
  routeType: SmartSwapRouteType
  inputToken: SmartSwapTokenRef
  outputToken: SmartSwapTokenRef
  hops: SmartSwapHop[]
  pools: SmartSwapPoolRef[]
  /** Expected output in raw integer string (token decimals). */
  expectedOutputRaw: string
  expectedOutputFormatted: string | null
  priceImpact: SmartSwapImpact
  gasEstimate: SmartSwapGasEstimate
  feeEstimate: SmartSwapFeeEstimate
  /** 0–100 factual confidence from completeness + impact severity. Not a guarantee. */
  confidence: number
  source: SmartSwapRouteSource
  /** ISO timestamp or null when unknown. */
  freshness: string | null
  warnings: string[]
  explanation: string
}

/** Input snapshot for normalizing engine routes without importing React hooks. */
export interface SmartSwapTradeSnapshot {
  routeId?: string
  chainId: number
  input: SmartSwapTokenRef
  output: SmartSwapTokenRef
  /** Ordered path addresses (token hops). Length >= 2 for a valid route. */
  pathAddresses: string[]
  pathSymbols?: string[]
  pairs: Array<{
    address: string
    kind?: 'v2' | 'stable' | 'unknown'
    token0: string
    token1: string
  }>
  expectedOutputRaw: string
  expectedOutputFormatted?: string | null
  /** Price impact percent number, or null if unavailable. */
  priceImpactPercent?: number | null
  gasUnits?: number | null
  lpFeeRaw?: string | null
  lpFeeSymbol?: string | null
  source?: SmartSwapRouteSource
  /** smart-router RouteType discriminant when known */
  smartRouterRouteType?: 'V2' | 'STABLE_SWAP' | 'MIXED' | 'UNKNOWN'
  freshness?: string | null
  warnings?: string[]
  isNativeRoute?: boolean
  unsupported?: boolean
}
