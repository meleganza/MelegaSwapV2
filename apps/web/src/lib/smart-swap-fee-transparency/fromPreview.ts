/**
 * Adapt Module 003 execution preview + optional canonical fee amount into Module 004 input.
 */

import type { SmartSwapExecutionPreview } from 'lib/smart-swap-execution-preview'
import type { SmartSwapFeeTransparencyInput } from './types'

export function feeTransparencyInputFromPreview(params: {
  preview: SmartSwapExecutionPreview | null | undefined
  /** Amount from canonical `computeGrossProtocolFeeAmount` when available. */
  feeAmount?: string | null
  treasuryStatus?: SmartSwapFeeTransparencyInput['treasuryStatus']
  kerlStatus?: SmartSwapFeeTransparencyInput['kerlStatus']
  stale?: boolean
}): SmartSwapFeeTransparencyInput | null {
  const { preview } = params
  if (!preview) return null

  const bps =
    preview.protocolFee.availability === 'available' ? preview.protocolFee.bps : null

  return {
    swapAmount: preview.inputAmount,
    feeAmount: params.feeAmount ?? null,
    feeAsset: preview.inputToken.symbol,
    chainId: preview.inputToken.chainId,
    inputAddress: preview.inputToken.isNative ? null : preview.inputToken.address,
    outputAddress: preview.outputToken.isNative ? null : preview.outputToken.address,
    outputSymbol: preview.outputToken.symbol,
    protocolFeeBps: bps,
    buyMarcoApplied: preview.protocolFee.rule === 'buy-marco' ? true : preview.protocolFee.rule === 'standard' ? false : null,
    pricingSourceId: 'D87_DEX_PRICING_RATIFIED',
    feeSplitPolicyRef: 'codex://FSC-01',
    treasuryStatus: params.treasuryStatus ?? 'available',
    kerlStatus: params.kerlStatus ?? 'pending',
    freshness: preview.freshness,
    stale: params.stale,
  }
}
