/**
 * SMART_SWAP_MODULE_006 — AI assistance (explanation layer only).
 * No execution, routing, fee, Treasury, or KERL authority.
 */

export const SMART_SWAP_AI_ASSISTANCE_MODULE = 'SMART_SWAP_MODULE_006_AI_ASSISTANCE' as const

export type SmartSwapAIContextType =
  | 'ROUTE_EXPLANATION'
  | 'PRICE_IMPACT_EXPLANATION'
  | 'LIQUIDITY_EXPLANATION'
  | 'FEE_EXPLANATION'
  | 'ERROR_EXPLANATION'

export type SmartSwapAIConfidence = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNAVAILABLE'

export type SmartSwapAIFailure =
  | 'AI_UNAVAILABLE'
  | 'CONTEXT_UNAVAILABLE'
  | 'INSUFFICIENT_DATA'
  | 'TIMEOUT'
  | 'PARTIAL_CONTEXT'

export interface SmartSwapAIAssistance {
  contextType: SmartSwapAIContextType
  explanation: string
  source: string
  confidence: SmartSwapAIConfidence
  /** Explainable confidence rationale — never an opaque score. */
  confidenceReason: string
  generatedAt: string
  freshness: string | null
  relatedRoute: string | null
  relatedToken: string | null
  warnings: string[]
}

export interface SmartSwapAIAssistanceSuccess {
  status: 'ok'
  assistance: SmartSwapAIAssistance
  optional: true
}

export interface SmartSwapAIAssistanceFailureResult {
  status: 'failure'
  failure: SmartSwapAIFailure
  message: string
  assistance: null
  optional: true
}

export type SmartSwapAIAssistanceResult = SmartSwapAIAssistanceSuccess | SmartSwapAIAssistanceFailureResult

/**
 * Public/runtime context only — never private keys or wallet secrets.
 */
export interface SmartSwapAIAssistanceContext {
  preferredType?: SmartSwapAIContextType
  hopCount?: number | null
  pathSymbols?: string[] | null
  routeId?: string | null
  priceImpactPercent?: number | null
  priceImpactSeverity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNAVAILABLE' | null
  liquidityAvailable?: boolean | null
  feeAvailable?: boolean | null
  feeLabel?: string | null
  noRoute?: boolean
  previewFailureCode?: string | null
  inputSymbol?: string | null
  outputSymbol?: string | null
  freshness?: string | null
  generatedAt?: string
  /** Test/runtime injectables for failure paths. */
  forceFailure?: SmartSwapAIFailure
  timedOut?: boolean
  aiEnabled?: boolean
}
