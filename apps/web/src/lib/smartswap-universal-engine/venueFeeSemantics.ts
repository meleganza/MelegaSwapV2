/**
 * Venue fee semantics for M3 shadow economics.
 * Avoid double-counting LP fees already deducted from getAmountsOut / Melega quotes.
 */

export const VENUE_FEE_SEMANTICS = {
  EMBEDDED_IN_QUOTED_OUTPUT: 'EMBEDDED_IN_QUOTED_OUTPUT',
  EXPLICIT: 'EXPLICIT',
  INFORMATIONAL_ONLY: 'INFORMATIONAL_ONLY',
} as const

export type VenueFeeSemantics = (typeof VENUE_FEE_SEMANTICS)[keyof typeof VENUE_FEE_SEMANTICS]

export const VENUE_STRUCTURAL_FEE_BPS: Record<string, number> = {
  'melega-dex': 25,
  pancakeswap: 25,
  uniswap: 30,
}

export const VENUE_FEE_SEMANTICS_BY_ID: Record<string, VenueFeeSemantics> = {
  'melega-dex': VENUE_FEE_SEMANTICS.EMBEDDED_IN_QUOTED_OUTPUT,
  pancakeswap: VENUE_FEE_SEMANTICS.EMBEDDED_IN_QUOTED_OUTPUT,
  uniswap: VENUE_FEE_SEMANTICS.EMBEDDED_IN_QUOTED_OUTPUT,
}
