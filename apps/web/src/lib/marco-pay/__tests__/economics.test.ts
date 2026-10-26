import { describe, expect, it } from 'vitest'
import {
  assertPassportProEconomics,
  passportProCommissionMinor,
  passportProDiscountMinor,
  payableMinorAfterReferral,
} from '../economics'

describe('Passport PRO checkout economics', () => {
  it('keeps a 10% customer discount and a 30% commission of the net in MARCO', () => {
    const economics = assertPassportProEconomics({
      listedPriceMinor: '2900',
      discountMinor: '290',
      netPaidMinor: '2610',
      commissionAmountMinor: '783',
      commissionAsset: 'MARCO',
    })
    expect(passportProDiscountMinor('2900')).toBe('290')
    expect(passportProCommissionMinor('2610')).toBe('783')
    expect(payableMinorAfterReferral(economics)).toBe('2610')
    expect(economics.commissionAsset).toBe('MARCO')
  })

  it('does not let M-Credits cashback reduce the payable amount or the commission', () => {
    const economics = assertPassportProEconomics({
      listedPriceMinor: '10000',
      discountMinor: '1000',
      netPaidMinor: '9000',
      commissionAmountMinor: '2700',
    })
    expect(payableMinorAfterReferral(economics)).toBe('9000')
    expect(payableMinorAfterReferral(economics)).not.toBe('8500')
    expect(economics.commissionAmountMinor).toBe('2700')
  })

  it('rejects a discount, net, or commission that is not the published rule', () => {
    expect(() =>
      assertPassportProEconomics({
        listedPriceMinor: '2900',
        discountMinor: '289',
        netPaidMinor: '2611',
        commissionAmountMinor: '783',
      }),
    ).toThrow('DISCOUNT_NOT_10_PERCENT')
    expect(() =>
      assertPassportProEconomics({
        listedPriceMinor: '10000',
        discountMinor: '1000',
        netPaidMinor: '9000',
        commissionAmountMinor: '2701',
      }),
    ).toThrow('COMMISSION_NOT_30_PERCENT_OF_NET')
    expect(() =>
      assertPassportProEconomics({
        listedPriceMinor: '10000',
        discountMinor: '1000',
        netPaidMinor: '9000',
        commissionAmountMinor: '2700',
        commissionAsset: 'M-CREDITS',
      }),
    ).toThrow('COMMISSION_ASSET_MISMATCH')
    expect(() =>
      assertPassportProEconomics({
        listedPriceMinor: '10000',
        discountMinor: '1000',
        netPaidMinor: '9000',
        commissionAmountMinor: '3000',
      }),
    ).toThrow('COMMISSION_NOT_30_PERCENT_OF_NET')
  })
})
