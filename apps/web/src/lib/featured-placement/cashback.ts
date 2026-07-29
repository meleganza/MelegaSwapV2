import { FEATURED_OFFER, type CashbackState, type FeaturedPayAsset } from './constants'

export function marcoCashbackAmount(usd = FEATURED_OFFER.usdPrice): number {
  return Math.round(usd * (FEATURED_OFFER.marcoCashbackPct / 100) * 100) / 100
}

export function resolveCashbackState(asset: FeaturedPayAsset): CashbackState {
  return asset === 'MARCO' ? 'ELIGIBLE_PENDING' : 'NOT_ELIGIBLE'
}

export function cashbackUserMessage(state: CashbackState): string {
  switch (state) {
    case 'NOT_ELIGIBLE':
      return 'M-Credits cashback applies only when paying with MARCO.'
    case 'ELIGIBLE_PENDING':
      return `${FEATURED_OFFER.marcoCashbackMCredits} M-Credits promotional cashback is recorded as pending. It is not credited until the M-Credits fulfillment service confirms.`
    case 'FULFILLMENT_SUBMITTED':
      return 'Cashback fulfillment submitted — awaiting confirmation.'
    case 'CREDITED':
      return 'M-Credits cashback has been credited.'
    case 'REVERSAL_PENDING':
      return 'Cashback reversal pending.'
    case 'REVERSED':
      return 'Cashback was reversed.'
    default:
      return 'Cashback status unavailable.'
  }
}
