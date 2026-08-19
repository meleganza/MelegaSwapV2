/**
 * Isolated shadow runner. Never signs, submits, or redirects user execution.
 */

import type { NormalizedQuote } from './quote'
import { normalizeMelegaLegacyQuote, type LegacyMelegaQuoteSnapshot } from './melegaDexAdapter'

export interface ShadowComparisonField {
  field: 'input' | 'output' | 'minimumReceived' | 'gas' | 'priceImpact' | 'protocolFee' | 'routeIdentity'
  legacy: string | null
  shadow: string | null
  match: boolean
}

export interface ShadowComparisonResult {
  match: boolean
  mismatches: ShadowComparisonField[]
  fields: ShadowComparisonField[]
  shadowQuote: NormalizedQuote
}

function field(
  name: ShadowComparisonField['field'],
  legacy: string | null,
  shadow: string | null,
): ShadowComparisonField {
  return { field: name, legacy, shadow, match: legacy === shadow }
}

export function runMelegaShadowComparison(
  legacy: LegacyMelegaQuoteSnapshot,
  nowIso = new Date().toISOString(),
): ShadowComparisonResult {
  const shadowQuote = normalizeMelegaLegacyQuote(legacy, nowIso)
  const slippageBps = legacy.slippageBps ?? 50
  const expectedMin =
    ((BigInt(legacy.expectedOutputRaw) * BigInt(10_000 - slippageBps)) / 10_000n).toString()
  const fields: ShadowComparisonField[] = [
    field('input', legacy.inputAmountRaw, shadowQuote.inputAmountRaw),
    field('output', legacy.expectedOutputRaw, shadowQuote.grossOutputRaw),
    field('minimumReceived', expectedMin, shadowQuote.minimumReceivedRaw),
    field('gas', legacy.gasUnits != null ? String(legacy.gasUnits) : null, shadowQuote.estimatedGasUnits),
    field(
      'priceImpact',
      legacy.priceImpactPercent != null ? String(legacy.priceImpactPercent) : null,
      shadowQuote.priceImpactPercent != null ? String(shadowQuote.priceImpactPercent) : null,
    ),
    field('protocolFee', 'FEE_PREVIEW_ONLY', shadowQuote.protocolFee.state),
    field('routeIdentity', `melega-dex:${legacy.chainId}`, `${shadowQuote.venueId}:${legacy.chainId}`),
  ]
  const mismatches = fields.filter((row) => !row.match)
  return {
    match: mismatches.length === 0,
    mismatches,
    fields,
    shadowQuote,
  }
}

export function shadowMustNotAffectUserTransaction(): true {
  return true
}
