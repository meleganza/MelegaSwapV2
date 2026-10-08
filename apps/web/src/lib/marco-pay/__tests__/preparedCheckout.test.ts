import { describe, expect, it } from 'vitest'
import {
  MARCO_PAY_PREPARED_QUOTE_TTL_MS,
  MARCO_PAY_PROVIDER_UNAVAILABLE,
  isMarcoPayPreparedOrderCurrent,
  marcoPayReviewErrorMessage,
  type MarcoPayPreparedBinding,
} from '../preparedCheckout'

const order: MarcoPayPreparedBinding = {
  referralCode: '2mjywytuw5',
  packageId: 'trend_6h',
  serviceId: 'trend-boost',
  buyerWallet: '0xdf9e1a85db4f985d5bb5644ad07d9d7ee5673b5e',
  targetKey: '56:0xdf9e1a85db4f985d5bb5644ad07d9d7ee5673b5e',
  quotedAt: 1_000_000,
}

const requested = {
  referralCode: order.referralCode,
  packageId: order.packageId,
  serviceId: order.serviceId,
  buyerWallet: order.buyerWallet,
  targetKey: order.targetKey,
  now: order.quotedAt + 1_000,
}

describe('MARCO Pay prepared checkout binding', () => {
  it('keeps a fresh referral quote and a fresh non-referral quote', () => {
    expect(isMarcoPayPreparedOrderCurrent(order, requested)).toBe(true)
    expect(
      isMarcoPayPreparedOrderCurrent(
        { ...order, referralCode: null },
        { ...requested, referralCode: null },
      ),
    ).toBe(true)
  })

  it('drops the cached session when the referral changes', () => {
    expect(isMarcoPayPreparedOrderCurrent(order, { ...requested, referralCode: null })).toBe(false)
    expect(isMarcoPayPreparedOrderCurrent({ ...order, referralCode: null }, requested)).toBe(false)
  })

  it('drops a stale quote once the commercial quote window has passed', () => {
    expect(
      isMarcoPayPreparedOrderCurrent(order, {
        ...requested,
        now: order.quotedAt + MARCO_PAY_PREPARED_QUOTE_TTL_MS,
      }),
    ).toBe(false)
    expect(
      isMarcoPayPreparedOrderCurrent(order, {
        ...requested,
        now: order.quotedAt + MARCO_PAY_PREPARED_QUOTE_TTL_MS - 1,
      }),
    ).toBe(true)
  })

  it('drops the cached session when the account or chain changes', () => {
    expect(
      isMarcoPayPreparedOrderCurrent(order, {
        ...requested,
        buyerWallet: '0x1111111111111111111111111111111111111111',
      }),
    ).toBe(false)
    expect(
      isMarcoPayPreparedOrderCurrent(order, {
        ...requested,
        targetKey: '1:0xdf9e1a85db4f985d5bb5644ad07d9d7ee5673b5e',
      }),
    ).toBe(false)
    expect(
      isMarcoPayPreparedOrderCurrent(order, {
        ...requested,
        buyerWallet: order.buyerWallet.toUpperCase(),
      }),
    ).toBe(true)
  })

  it('does not describe a referral verification failure as a provider outage', () => {
    expect(marcoPayReviewErrorMessage({ error: 'REFERRAL_NOT_VERIFIED' })).toBe(
      'This Passport PRO referral could not be verified. MARCO Pay was not charged.',
    )
    expect(marcoPayReviewErrorMessage({ error: 'REFERRAL_NOT_VERIFIED', message: '' })).not.toBe(
      MARCO_PAY_PROVIDER_UNAVAILABLE,
    )
    expect(marcoPayReviewErrorMessage({ error: 'MARCO_CONVERSION_INVALID', message: 'Quote rejected.' })).toBe(
      'Quote rejected.',
    )
    expect(marcoPayReviewErrorMessage({})).toBe(MARCO_PAY_PROVIDER_UNAVAILABLE)
  })
})
