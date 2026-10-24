import { describe, expect, it } from 'vitest'
import {
  MARCO_REFERRAL_G2_CONTRACT_VERSION,
  MARCO_REFERRAL_G2_POLICY,
  MELEGA_DEX_REFERRAL_G2_CONSUMER_VERSION,
  quoteMelegaDexReferralG2,
} from '../g2'

const quote = (listedMinor: bigint) => quoteMelegaDexReferralG2({
  quoteRef: 'dex_quote_1',
  applicationRef: 'melega-dex',
  referralCode: 'marco-001',
  currency: 'USD',
  listedMinor,
})

describe('Melega DEX standard referral G2 review contract', () => {
  it('is versioned and remains inactive with no effective date', () => {
    expect(quote(100n)).toMatchObject({
      contractVersion: MARCO_REFERRAL_G2_CONTRACT_VERSION,
      consumer: 'MELEGA_DEX',
      consumerVersion: MELEGA_DEX_REFERRAL_G2_CONSUMER_VERSION,
      basis: 'LISTED',
      active: false,
      claimMode: 'MANUAL',
      claimWindowDays: 90,
    })
    expect(MARCO_REFERRAL_G2_POLICY.effectiveAt).toBeNull()
  })

  it('uses LISTED 100 = customer 90, referral 30, merchant 60', () => {
    expect(quote(100n)).toMatchObject({
      customerDiscountMinor: 10n,
      customerPayableMinor: 90n,
      referralCommissionMinor: 30n,
      merchantShareMinor: 60n,
    })
  })

  it('rounds down and leaves the residual with the merchant', () => {
    const result = quote(101n)
    expect(result.customerDiscountMinor).toBe(10n)
    expect(result.referralCommissionMinor).toBe(30n)
    expect(result.merchantShareMinor).toBe(61n)
    expect(result.customerDiscountMinor + result.referralCommissionMinor + result.merchantShareMinor).toBe(101n)
  })

  it.each([0n, -1n])('refuses invalid listed amount %s', (listedMinor) => {
    expect(() => quote(listedMinor)).toThrow(RangeError)
  })
})
