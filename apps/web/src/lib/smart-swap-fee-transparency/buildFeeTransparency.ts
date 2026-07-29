/**
 * Build fee transparency display from proven quote facts only.
 * Does not claim external settlement-runtime authority, KERL rewards, or unproven fee collection.
 */

import {
  D87_PRICING_CODEX_ID,
  FSC_01_POLICY_REF,
  formatProtocolFeePercent,
  resolveSwapProtocolFeeContextFromFields,
} from 'lib/d87-pricing'
import {
  DEX_ECONOMIC_AUTHORITY,
  MELEGA_TREASURY_WALLET_ADDRESS,
  MELEGA_TREASURY_WALLET_LABEL,
} from 'config/dexEconomicAuthority'
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
  destination: SmartSwapFeeAttributionStatus
  forcedUnavailable?: boolean
}): SmartSwapFeeTransparencyState {
  if (input.notApplicable) return 'NOT_APPLICABLE'
  if (input.stale) return 'STALE'
  if (input.forcedUnavailable || (!input.hasFeeRate && !input.hasFeeAmount)) return 'UNAVAILABLE'
  const partial = !input.hasFeeAmount || input.destination !== 'factual' || !input.hasFeeRate
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
 * Fee destination is the canonical MELEGA TREASURY WALLET when disclosed.
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
      flowSteps: [
        { label: 'Protocol fee', value: 'Fee information unavailable' },
        { label: 'Fee destination', value: UNAVAILABLE },
        { label: 'Execution', value: DEX_ECONOMIC_AUTHORITY.executionModel },
      ],
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
      flowSteps: [
        { label: 'Protocol fee', value: 'Not applicable' },
        { label: 'Execution', value: DEX_ECONOMIC_AUTHORITY.executionModel },
      ],
    }
  }

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

  // Only surface a protocol fee when the caller marks collection as proven in the execution path.
  // Unproven D87 policy rates must not be presented as collected fees.
  const feeProven = input.feeCollectionProven === true
  const hasFeeRate = feeProven && Number.isFinite(ctx.protocolFeeBps) && ctx.protocolFeeBps > 0
  const feeAmount = feeProven && input.feeAmount && input.feeAmount !== '' ? input.feeAmount : null
  const hasFeeAmount = feeAmount != null
  const feeAsset = input.feeAsset ?? null
  const swapAmount = input.swapAmount ?? null

  const destinationStatus = attributionFromStatus(input.treasuryStatus ?? 'available')
  const treasuryDestination =
    destinationStatus === 'factual'
      ? `${MELEGA_TREASURY_WALLET_LABEL} (${MELEGA_TREASURY_WALLET_ADDRESS})`
      : null

  // KERL is not part of the current Smart Swap execution path — never claim attribution.
  const economicAttribution = null

  const feeRate = hasFeeRate
    ? `${ctx.protocolFeeBps} bps (${formatProtocolFeePercent(ctx.protocolFeeBps)})`
    : null

  const state = resolveState({
    notApplicable: input.notApplicable,
    stale: input.stale,
    hasFeeRate,
    hasFeeAmount,
    destination: destinationStatus,
    forcedUnavailable: !feeProven && !input.forceShowDestinationOnly,
  })

  let unavailableReason: string | null = null
  if (!feeProven) {
    unavailableReason =
      input.unavailableReason ??
      'Protocol fee not proven in current execution path (wrapper undeployed on mainnet)'
  } else if (state === 'UNAVAILABLE') {
    unavailableReason = input.unavailableReason ?? 'Fee information unavailable'
  } else if (state === 'STALE') {
    unavailableReason = input.unavailableReason ?? 'Fee data is stale — refresh the quote'
  } else if (state === 'PARTIAL') {
    const pending: string[] = []
    if (!hasFeeAmount) pending.push('fee amount pending')
    if (destinationStatus !== 'factual') pending.push('fee destination pending')
    unavailableReason = pending.length ? pending.join('; ') : null
  }

  const flowSteps: Array<{ label: string; value: string }> = []
  flowSteps.push({
    label: 'Protocol fee',
    value:
      hasFeeAmount && feeAsset
        ? `${feeAmount} ${feeAsset}`
        : hasFeeRate
          ? feeRate ?? UNAVAILABLE
          : UNAVAILABLE,
  })
  flowSteps.push({
    label: 'Fee destination',
    value:
      destinationStatus === 'factual' && treasuryDestination
        ? treasuryDestination
        : destinationStatus === 'pending'
          ? 'Fee destination pending'
          : UNAVAILABLE,
  })
  flowSteps.push({
    label: 'Execution',
    value: DEX_ECONOMIC_AUTHORITY.executionModel,
  })

  const explanationParts: string[] = []
  if (hasFeeRate || hasFeeAmount) {
    explanationParts.push('Protocol fee shown only when proven by the active execution path.')
  } else {
    explanationParts.push(
      'No separately identifiable protocol fee transfer in the current Smart Swap execution path.',
    )
  }
  if (destinationStatus === 'factual') {
    explanationParts.push(
      `Economic beneficiary: ${MELEGA_TREASURY_WALLET_LABEL} ${MELEGA_TREASURY_WALLET_ADDRESS}.`,
    )
  }
  explanationParts.push(`${DEX_ECONOMIC_AUTHORITY.executionModel}.`)

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
    allocationStatus: destinationStatus,
    economicAttribution,
    source: ctx.codexId,
    freshness: input.freshness ?? null,
    unavailableReason,
    state: feeProven ? state : destinationStatus === 'factual' ? 'PARTIAL' : 'UNAVAILABLE',
    explanation: explanationParts.join(' '),
    flowSteps,
  }
}
