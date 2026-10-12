import { afterEach, describe, expect, it } from 'vitest'
import { passportProEconomicsFromReferralQuote } from '../economics'
import { isAuthoritativeMarcoPaidStatus } from '../merchantRails'

describe('MARCO Pay multichain repair boundaries', () => {
  afterEach(() => {
    delete process.env.MARCO_PAY_EVM_CONSENTED_CHAIN_IDS
  })

  it('maps the Passport quote wire into the 10 percent and 30 percent economics', () => {
    const economics = passportProEconomicsFromReferralQuote({
      listed_price_minor: '2900',
      discount_minor: '290',
      net_paid_minor: '2610',
      commission_amount_minor: '783',
      commission_asset: 'MARCO',
    })
    expect(economics).toEqual({
      listedPriceMinor: '2900',
      discountMinor: '290',
      netPaidMinor: '2610',
      commissionAmountMinor: '783',
      commissionAsset: 'MARCO',
    })
    expect(BigInt(economics.netPaidMinor) + BigInt(economics.discountMinor)).toBe(BigInt(economics.listedPriceMinor))
  })

  it('does not treat a public PAID status or a missing receipt as fulfillment', () => {
    expect(isAuthoritativeMarcoPaidStatus('PAID')).toBe(false)
    expect(isAuthoritativeMarcoPaidStatus('PENDING')).toBe(false)
    expect(isAuthoritativeMarcoPaidStatus('COMPLETED')).toBe(true)
  })
})
