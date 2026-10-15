import type { ShadowCandidate } from './shadowCandidate'

export const RAW_QUOTE_NOT_SEALED_CANDIDATE = 'RAW_QUOTE_NOT_SEALED_CANDIDATE' as const

/**
 * Refuse a router quote that was never sealed by the revenue policy.
 * This does not invent fee bps, a beneficiary, or calldata.
 */
export function assertSealedShadowCandidate(value: unknown): asserts value is ShadowCandidate {
  if (value == null || typeof value !== 'object') throw new Error(RAW_QUOTE_NOT_SEALED_CANDIDATE)
  const row = value as Partial<ShadowCandidate>
  if (
    row.sealedFee == null ||
    row.netVenueInputRaw == null ||
    row.originalInputAmountRaw == null ||
    row.smartSwapFeeBps == null ||
    row.structuralRouteCostBps == null
  ) {
    throw new Error(RAW_QUOTE_NOT_SEALED_CANDIDATE)
  }
}
