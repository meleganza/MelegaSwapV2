/**
 * SMART_SWAP_MODULE_003 — execution preview model.
 * Transparency only. Does not execute, settle, or modify fees.
 */

import type {
  SmartSwapHop,
  SmartSwapMetricAvailability,
  SmartSwapPoolRef,
  SmartSwapTokenRef,
} from 'lib/smart-swap-route-engine'

export const SMART_SWAP_EXECUTION_PREVIEW_MODULE = 'SMART_SWAP_MODULE_003_EXECUTION_PREVIEW' as const

export type SmartSwapImpactSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'UNAVAILABLE'

export type SmartSwapPreviewWarningCode =
  | 'HIGH_PRICE_IMPACT'
  | 'INSUFFICIENT_LIQUIDITY'
  | 'ROUTE_UNAVAILABLE'
  | 'GAS_ESTIMATION_UNAVAILABLE'
  | 'PARTIAL_ROUTE_DATA'
  | 'UNSUPPORTED_TOKEN'
  | 'STALE_DATA'

export interface SmartSwapPreviewWarning {
  code: SmartSwapPreviewWarningCode
  message: string
  /** Factual source identifier — never generic. */
  source: string
}

export interface SmartSwapRouteHopDisplay {
  kind: 'token' | 'pool'
  label: string
  detail?: string
  /** Exact token address for logo resolution — never inherit another hop. */
  address?: string
  /** Pool legs: exact pair token addresses for DoubleCurrencyLogo. */
  token0Address?: string
  token1Address?: string
  chainId?: number
}

export interface SmartSwapProtocolFeeDisplay {
  /** Policy bps from D87 — display only. */
  bps: number | null
  availability: SmartSwapMetricAvailability
  label: string
  note: 'Display only — beneficiary is MELEGA TREASURY WALLET per FSC-01 policy'
  rule: 'standard' | 'buy-marco' | 'unavailable'
}

export interface SmartSwapExecutionPreview {
  routeId: string
  inputAmount: string
  inputToken: SmartSwapTokenRef
  outputToken: SmartSwapTokenRef
  expectedOutput: string
  expectedOutputFormatted: string | null
  minimumReceived: string | null
  minimumReceivedFormatted: string | null
  slippageBips: number
  priceImpactPercent: number | null
  priceImpactSeverity: SmartSwapImpactSeverity
  priceImpactAvailability: SmartSwapMetricAvailability
  gasEstimateUnits: number | null
  gasEstimateAvailability: SmartSwapMetricAvailability
  protocolFee: SmartSwapProtocolFeeDisplay
  routeHops: SmartSwapHop[]
  liquiditySources: SmartSwapPoolRef[]
  hopVisualization: SmartSwapRouteHopDisplay[]
  warnings: SmartSwapPreviewWarning[]
  confidence: number
  confidenceFactors: string[]
  explanation: string
  timestamp: string
  freshness: string | null
}

export interface SmartSwapExecutionPreviewInput {
  routeId: string
  inputAmount: string
  inputToken: SmartSwapTokenRef
  outputToken: SmartSwapTokenRef
  expectedOutputRaw: string
  expectedOutputFormatted?: string | null
  /** Existing user slippage tolerance in bips (same as swap settings). */
  slippageBips: number
  priceImpactPercent?: number | null
  gasUnits?: number | null
  hops: SmartSwapHop[]
  pools: SmartSwapPoolRef[]
  pathSymbols?: string[]
  /** Parallel to pathSymbols — used for per-hop logo address mapping. */
  pathAddresses?: string[]
  freshness?: string | null
  /** Output token is MARCO → D87 buy-marco fee rule for display. */
  isBuyMarco?: boolean
  unsupportedToken?: boolean
  stale?: boolean
  routeUnavailable?: boolean
  insufficientLiquidity?: boolean
  partialData?: boolean
  nowIso?: string
}
