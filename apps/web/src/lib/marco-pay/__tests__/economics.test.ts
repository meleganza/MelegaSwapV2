import { describe, expect, it } from 'vitest'
import {
  assertPassportProEconomics,
  passportProCommissionMinor,
  passportProDiscountMinor,
  payableMinorAfterReferral,
} from '../economics'

describe('Passport PRO checkout economics', () => {
  it('keeps historical V1 at 30% of net', () => {
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
    expect(economics.contractVersion).toBe('P0_2_REFERRAL_PRO_V1')
  })

  it('does not let M-Credits cashback reduce the payable amount or the commission', () => {
    const economics = assertPassportProEconomics({
      listedPriceMinor: '10000',
      discountMinor: '1000',
      netPaidMinor: '9000',
      commissionAmountMinor: '3000',
      contractVersion: 'MARCO_REFERRAL_LISTED_30_V2',
    })
    expect(payableMinorAfterReferral(economics)).toBe('9000')
    expect(payableMinorAfterReferral(economics)).not.toBe('8500')
    expect(economics.commissionAmountMinor).toBe('3000')
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
        contractVersion: 'P0_2_REFERRAL_PRO_V1',
      }),
    ).toThrow('COMMISSION_NOT_30_PERCENT_OF_NET')
  })

  it('enforces V2 listed-price conservation and deterministic floor rounding', () => {
    const economics = assertPassportProEconomics({
      listedPriceMinor: '101', discountMinor: '10', netPaidMinor: '91',
      commissionAmountMinor: '30', contractVersion: 'MARCO_REFERRAL_LISTED_30_V2',
    })
    expect(BigInt(economics.listedPriceMinor)).toBe(BigInt(economics.discountMinor) + BigInt(economics.netPaidMinor))
    expect(BigInt(economics.netPaidMinor)).toBe(BigInt(economics.commissionAmountMinor) + 61n)
  })
})
