/**
 * Build fee transparency display from authoritative snapshots.
 * Consumes canonical fee context getters — does not duplicate D87/FSC-01 math.
 */

import {
  D87_PRICING_CODEX_ID,
  FSC_01_POLICY_REF,
  formatProtocolFeePercent,
  getFsc01Constitution,
  resolveSwapProtocolFeeContextFromFields,
} from 'lib/d87-pricing'
import type {
  SmartSwapFeeTransparency,
  SmartSwapFeeTransparencyInput,
  SmartSwapFeeTransparencyState,
  SmartSwapFeeAttributionStatus,
} from './types'

const UNAVAILABLE = '—'

function resolveState(input: {
  notApplicable?: boolean
  stale?: boolean
  hasFeeRate: boolean
  hasFeeAmount: boolean
  treasury: SmartSwapFeeAttributionStatus
  kerl: SmartSwapFeeAttributionStatus
  forcedUnavailable?: boolean
}): SmartSwapFeeTransparencyState {
  if (input.notApplicable) return 'NOT_APPLICABLE'
  if (input.stale) return 'STALE'
  if (input.forcedUnavailable || (!input.hasFeeRate && !input.hasFeeAmount)) return 'UNAVAILABLE'
  const partial =
    !input.hasFeeAmount ||
    input.treasury !== 'factual' ||
    input.kerl !== 'factual' ||
    !input.hasFeeRate
  return partial ? 'PARTIAL' : 'AVAILABLE'
}

function attributionFromStatus(
  status: 'available' | 'unavailable' | 'pending' | undefined,
): SmartSwapFeeAttributionStatus {
  if (status === 'available') return 'factual'
  if (status === 'pending') return 'pending'
  return 'unavailable'
}

/**
 * Presentation builder. Never invents fee amounts or KERL rewards.
 */
export function buildSmartSwapFeeTransparency(
  input: SmartSwapFeeTransparencyInput | null | undefined,
): SmartSwapFeeTransparency {
  if (!input) {
    return {
      swapAmount: null,
      feeAmount: null,
      feeAsset: null,
      feeRate: null,
      protocolFee: { bps: null, label: UNAVAILABLE, buyMarcoApplied: null },
      treasuryDestination: null,
      allocationStatus: 'unavailable',
      economicAttribution: null,
      source: D87_PRICING_CODEX_ID,
      freshness: null,
      unavailableReason: 'Fee information unavailable',
      state: 'UNAVAILABLE',
      explanation: 'Fee information unavailable.',
      flowSteps: [{ label: 'Protocol fee', value: 'Fee information unavailable' }],
    }
  }

  if (input.notApplicable) {
    return {
      swapAmount: input.swapAmount ?? null,
      feeAmount: null,
      feeAsset: input.feeAsset ?? null,
      feeRate: null,
      protocolFee: { bps: null, label: UNAVAILABLE, buyMarcoApplied: null },
      treasuryDestination: null,
      allocationStatus: 'unavailable',
      economicAttribution: null,
      source: input.pricingSourceId ?? D87_PRICING_CODEX_ID,
      freshness: input.freshness ?? null,
      unavailableReason: input.unavailableReason ?? 'Not applicable for this trade',
      state: 'NOT_APPLICABLE',
      explanation: 'Fee transparency is not applicable for this trade.',
      flowSteps: [{ label: 'Protocol fee', value: 'Not applicable' }],
    }
  }

  // Consume canonical fee engine — do not hardcode bps.
  const ctx =
    input.protocolFeeBps != null
      ? {
          codexId: (input.pricingSourceId ?? D87_PRICING_CODEX_ID) as typeof D87_PRICING_CODEX_ID,
          feeSplitPolicyRef: (input.feeSplitPolicyRef ?? FSC_01_POLICY_REF) as typeof FSC_01_POLICY_REF,
          protocolFeeBps: input.protocolFeeBps,
          protocolFeeRate: input.protocolFeeBps / 10_000,
          buyMarcoApplied: Boolean(input.buyMarcoApplied),
        }
      : resolveSwapProtocolFeeContextFromFields({
          chainId: input.chainId,
          inputAddress: input.inputAddress,
          outputAddress: input.outputAddress,
          outputSymbol: input.outputSymbol,
        })

  const hasFeeRate = Number.isFinite(ctx.protocolFeeBps) && ctx.protocolFeeBps > 0
  const feeAmount = input.feeAmount && input.feeAmount !== '' ? input.feeAmount : null
  const hasFeeAmount = feeAmount != null
  const feeAsset = input.feeAsset ?? null
  const swapAmount = input.swapAmount ?? null

  const fsc = getFsc01Constitution()
  const allocationStatus = attributionFromStatus(input.treasuryStatus)
  // Destination owner from ratified constitution — not a local split calculation.
  const treasuryDestination =
    allocationStatus === 'factual'
      ? fsc.owner
      : allocationStatus === 'pending'
        ? null
        : null

  const kerlStatus = attributionFromStatus(input.kerlStatus)
  const economicAttribution = kerlStatus === 'factual' ? 'KERL' : null

  const feeRate = hasFeeRate
    ? `${ctx.protocolFeeBps} bps (${formatProtocolFeePercent(ctx.protocolFeeBps)})`
    : null

  const state = resolveState({
    notApplicable: input.notApplicable,
    stale: input.stale,
    hasFeeRate,
    hasFeeAmount,
    treasury: allocationStatus,
    kerl: kerlStatus,
  })

  let unavailableReason: string | null = null
  if (state === 'UNAVAILABLE') {
    unavailableReason = input.unavailableReason ?? 'Fee information unavailable'
  } else if (state === 'STALE') {
    unavailableReason = input.unavailableReason ?? 'Fee data is stale — refresh the quote'
  } else if (state === 'PARTIAL') {
    const pending: string[] = []
    if (!hasFeeAmount) pending.push('fee amount pending')
    if (allocationStatus !== 'factual') pending.push('Treasury attribution pending')
    if (kerlStatus !== 'factual') pending.push('economic attribution pending')
    unavailableReason = pending.length ? pending.join('; ') : null
  }

  const flowSteps: Array<{ label: string; value: string }> = []
  flowSteps.push({
    label: 'Swap',
    value: swapAmount && feeAsset ? `${swapAmount} ${feeAsset}` : swapAmount ?? UNAVAILABLE,
  })
  flowSteps.push({
    label: 'Protocol fee',
    value:
      hasFeeAmount && feeAsset
        ? `${feeAmount} ${feeAsset}`
        : hasFeeRate
          ? feeRate ?? UNAVAILABLE
          : 'Fee information unavailable',
  })
  if (allocationStatus === 'factual' && treasuryDestination) {
    flowSteps.push({
      label: 'Economic destination',
      value: `Allocated through ${treasuryDestination}`,
    })
  } else if (allocationStatus === 'pending') {
    flowSteps.push({
      label: 'Economic destination',
      value: 'Economic attribution pending',
    })
  } else if (hasFeeRate || hasFeeAmount) {
    flowSteps.push({
      label: 'Economic destination',
      value: 'Treasury attribution unavailable',
    })
  }
  if (economicAttribution) {
    flowSteps.push({ label: 'Economic attribution', value: economicAttribution })
  } else if (kerlStatus === 'pending' && (hasFeeRate || hasFeeAmount)) {
    flowSteps.push({ label: 'Economic attribution', value: 'Economic attribution pending' })
  }

  const explanationParts: string[] = []
  if (hasFeeRate || hasFeeAmount) {
    explanationParts.push('Protocol fee shown from the canonical fee engine (display only).')
  }
  if (allocationStatus === 'factual') {
    explanationParts.push(
      'Protocol fees contribute to ecosystem economic flows via Treasury Runtime settlement (FSC-01).',
    )
  } else if (hasFeeRate || hasFeeAmount) {
    explanationParts.push('Protocol fee available. Economic attribution pending.')
  } else {
    explanationParts.push('Fee information unavailable.')
  }

  return {
    swapAmount,
    feeAmount,
    feeAsset,
    feeRate,
    protocolFee: {
      bps: hasFeeRate ? ctx.protocolFeeBps : null,
      label: feeRate ?? UNAVAILABLE,
      buyMarcoApplied: hasFeeRate ? ctx.buyMarcoApplied : null,
    },
    treasuryDestination,
    allocationStatus,
    economicAttribution,
    source: ctx.codexId,
    freshness: input.freshness ?? null,
    unavailableReason,
    state,
    explanation: explanationParts.join(' '),
    flowSteps,
  }
}
