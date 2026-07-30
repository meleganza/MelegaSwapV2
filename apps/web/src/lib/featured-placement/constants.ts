import { MELEGA_TREASURY_WALLET_ADDRESS } from 'config/dexEconomicAuthority'
import { FEATURED_FEE_FROM_SCHEDULE } from 'config/constants/feeSchedule'

/** Founder-canon Featured Home commercial offer — aligned to fee-schedule.json. */
export const FEATURED_OFFER = {
  schema: 'melega.featured-home-offer.v1',
  title: 'Get Featured on the Melega DEX Home Page',
  usdPrice: FEATURED_FEE_FROM_SCHEDULE.usd,
  durationDays: FEATURED_FEE_FROM_SCHEDULE.durationDays,
  visibilityModel: 'Rotating set used by the four Featured Project cards on Home',
  acceptedAssets: ['BNB', 'USDT', 'USDC', 'MARCO'] as const, // must match fee-schedule.json
  marcoCashbackPct: FEATURED_FEE_FROM_SCHEDULE.marcoCashbackPercent,
  marcoCashbackMCredits: 4.95, // 99 * 5%
  treasuryWallet: MELEGA_TREASURY_WALLET_ADDRESS,
  feeScheduleRef: 'config/constants/fee-schedule.json#services.featuredProject',
  chainId: 56,
  quoteTtlMs: 10 * 60 * 1000,
  cardSlots: 4,
} as const

export type FeaturedPayAsset = (typeof FEATURED_OFFER.acceptedAssets)[number]

/** Canonical BSC token contracts for Featured payments. */
export const FEATURED_PAYMENT_TOKENS: Record<
  FeaturedPayAsset,
  { address: `0x${string}` | null; decimals: number; kind: 'native' | 'erc20' }
> = {
  BNB: { address: null, decimals: 18, kind: 'native' },
  USDT: { address: '0x55d398326f99059fF775485246999027B3197955', decimals: 18, kind: 'erc20' },
  USDC: { address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', decimals: 18, kind: 'erc20' },
  MARCO: { address: '0x963556de0eb8138E97A85F0A86eE0acD159D210b', decimals: 18, kind: 'erc20' },
}

export const FEATURED_ORDER_STATES = [
  'DRAFT',
  'QUOTED',
  'AWAITING_WALLET',
  'SUBMITTED',
  'PAYMENT_CONFIRMED',
  'ELIGIBILITY_PENDING',
  'SCHEDULED',
  'ACTIVE',
  'COMPLETED',
  'PAYMENT_FAILED',
  'CANCELLED',
  'REFUND_REVIEW',
] as const

export type FeaturedOrderState = (typeof FEATURED_ORDER_STATES)[number]

export const CASHBACK_STATES = [
  'NOT_ELIGIBLE',
  'ELIGIBLE_PENDING',
  'FULFILLMENT_SUBMITTED',
  'CREDITED',
  'REVERSAL_PENDING',
  'REVERSED',
] as const

export type CashbackState = (typeof CASHBACK_STATES)[number]
