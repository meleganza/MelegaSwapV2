import type { RevenuePolicyAssessment } from './evaluateRevenuePolicy'
import type { NetExecutionResult } from './netExecution'
import type { NormalizedQuote } from './quote'
import type { SealedSmartSwapFee } from './quoteFee'
import type { VenueFeeSemantics } from './venueFeeSemantics'

/**
 * Sealed shadow winner. Produced by the existing competition, which quotes
 * the net venue input and seals the fee. A raw getAmountsOut result is not one of these.
 */
export interface ShadowCandidate {
  venueId: string
  status: 'ok' | 'timeout' | 'error' | 'no_route' | 'unsupported' | 'stale' | 'skipped'
  quote: NormalizedQuote | null
  durationMs: number
  originalInputAmountRaw: string | null
  netVenueInputRaw: string | null
  structuralRouteCostBps: number | null
  smartSwapFeeBps: number | null
  feeBand: string | null
  feeEnforcementState: string
  venueFeeSemantics: VenueFeeSemantics | null
  sealedFee: SealedSmartSwapFee | null
  net: NetExecutionResult | null
  assessment: RevenuePolicyAssessment | null
  error: string | null
  kind: 'SYNTHETIC' | 'FACTUAL' | 'LEGACY_MELEGA' | null
}
