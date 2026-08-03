import type { CashbackState, FeaturedOrderState, FeaturedPackageId, FeaturedPayAsset } from './constants'

export type FeaturedOrder = {
  schema: 'melega.featured-home-order.v1'
  orderId: string
  state: FeaturedOrderState
  projectId: string
  projectSlug: string | null
  projectContract: string | null
  buyerWallet: string
  packageId?: FeaturedPackageId
  durationMs?: number
  paymentAsset: FeaturedPayAsset
  usdReferenceAmount: number
  tokenAmount: string | null
  tokenAmountRaw: string | null
  quoteSource: string | null
  quoteTimestamp: string | null
  quoteExpiration: string | null
  unitPriceUsd: number | null
  transactionHash: string | null
  paymentStatus: 'none' | 'submitted' | 'confirmed' | 'failed' | 'cancelled'
  eligibilityStatus: 'none' | 'pending' | 'eligible' | 'rejected'
  scheduledStart: string | null
  scheduledEnd: string | null
  rotationStatus: 'none' | 'candidate' | 'active' | 'completed' | 'expired'
  cashbackEligibility: CashbackState
  cashbackAmountMCredits: number | null
  cashbackFulfillmentStatus: CashbackState
  cashbackPct: number | null
  sourceFlow: 'claim-project' | 'create-project' | 'project-page' | 'other'
  treasuryWallet: string
  chainId: 56
  createdAt: string
  updatedAt: string
  lastError: string | null
  receiptVerified: boolean
}

export type FeaturedQuote = {
  orderId: string
  paymentAsset: FeaturedPayAsset
  usdReferenceAmount: number
  tokenAmount: string
  tokenAmountRaw: string
  unitPriceUsd: number
  quoteSource: string
  quoteTimestamp: string
  quoteExpiration: string
  treasuryWallet: string
  chainId: 56
  decimals: number
  tokenAddress: string | null
}

export type RotationCandidate = {
  orderId: string
  projectId: string
  projectSlug: string | null
  projectContract: string | null
  buyerWallet: string
  scheduledStart: string
  scheduledEnd: string
  paymentConfirmedAt: string
  state: FeaturedOrderState
}
