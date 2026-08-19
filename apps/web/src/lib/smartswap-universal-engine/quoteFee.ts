/**
 * Sealed SmartSwap fee on a quote. Immutable for the quote validity period.
 */

import type { CanonicalAssetId } from './assetIdentity'
import type { FeeBandId } from './revenuePolicy'
import type { RevenuePolicyAssessment } from './evaluateRevenuePolicy'
import { computeFeeAmountRaw } from './evaluateRevenuePolicy'

export const FEE_ASSET_SOURCE = {
  INPUT: 'INPUT',
  OUTPUT: 'OUTPUT',
  NATIVE_GAS: 'NATIVE_GAS',
  SETTLEMENT: 'SETTLEMENT',
} as const

export type FeeAssetSource = (typeof FEE_ASSET_SOURCE)[keyof typeof FEE_ASSET_SOURCE]

export interface SealedSmartSwapFee {
  policyVersion: string
  policyId: string
  feeBand: FeeBandId
  feeBps: number
  feeAmountRaw: string
  feeAssetSource: FeeAssetSource
  feeAsset: CanonicalAssetId | null
  quoteTimestamp: string
  quoteExpiry: string
}

export const QUOTE_FEE_CHANGED = 'QUOTE_FEE_CHANGED' as const
export const QUOTE_FEE_EXPIRED = 'QUOTE_FEE_EXPIRED' as const
export const QUOTE_FEE_NOT_SEALED = 'QUOTE_FEE_NOT_SEALED' as const

export function sealSmartSwapFee(input: {
  assessment: RevenuePolicyAssessment
  baseAmountRaw: string
  feeAssetSource: FeeAssetSource
  feeAsset: CanonicalAssetId | null
  quoteTimestamp: string
  quoteExpiry: string
}): SealedSmartSwapFee {
  if (input.assessment.feeBand == null || input.assessment.feeBps == null) {
    throw new Error(QUOTE_FEE_NOT_SEALED)
  }
  return {
    policyVersion: input.assessment.policyVersion,
    policyId: input.assessment.policyId,
    feeBand: input.assessment.feeBand,
    feeBps: input.assessment.feeBps,
    feeAmountRaw: computeFeeAmountRaw(input.baseAmountRaw, input.assessment.feeBps),
    feeAssetSource: input.feeAssetSource,
    feeAsset: input.feeAsset,
    quoteTimestamp: input.quoteTimestamp,
    quoteExpiry: input.quoteExpiry,
  }
}

function feeKey(fee: SealedSmartSwapFee): string {
  return [
    fee.policyId,
    fee.policyVersion,
    fee.feeBand,
    String(fee.feeBps),
    fee.feeAmountRaw,
    fee.feeAssetSource,
  ].join('|')
}

export function assertQuoteFeeImmutable(sealed: SealedSmartSwapFee, candidate: SealedSmartSwapFee, nowIso: string): void {
  const now = Date.parse(nowIso)
  const expiry = Date.parse(sealed.quoteExpiry)
  if (!Number.isFinite(now) || !Number.isFinite(expiry) || now > expiry) {
    throw new Error(QUOTE_FEE_EXPIRED)
  }
  if (feeKey(sealed) !== feeKey(candidate)) {
    throw new Error(QUOTE_FEE_CHANGED)
  }
}

export function isQuoteFeeValid(sealed: SealedSmartSwapFee, nowIso: string): boolean {
  const now = Date.parse(nowIso)
  const expiry = Date.parse(sealed.quoteExpiry)
  return Number.isFinite(now) && Number.isFinite(expiry) && now <= expiry
}
