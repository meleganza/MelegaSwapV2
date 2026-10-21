/**
 * Passport PRO checkout economics for Melega DEX.
 *
 * Published Passport basis, read 2026-10-21 from referral resolve and the
 * signed webhook contract: 10% off the listed price, referrer commission 30%
 * of the net actually paid, same asset (MARCO). On a listed 100 that is
 * discount 10, paid 90, referrer 27, merchant remainder 63. A 30-of-listed
 * and merchant-60 split is not what Passport publishes. M-Credits cashback
 * stays a separate ledger.
 */

export const PASSPORT_PRO_CUSTOMER_DISCOUNT_BPS = 1_000
export const PASSPORT_PRO_COMMISSION_BPS = 3_000
export const PASSPORT_PRO_COMMISSION_ASSET = 'MARCO' as const

const MINOR = /^\d+$/

export type PassportProEconomics = {
  listedPriceMinor: string
  discountMinor: string
  netPaidMinor: string
  commissionAmountMinor: string
  commissionAsset: typeof PASSPORT_PRO_COMMISSION_ASSET
}

export function bpsOfMinor(amountMinor: string, bps: number): string {
  if (!MINOR.test(amountMinor)) throw new Error('AMOUNT_INVALID')
  return ((BigInt(amountMinor) * BigInt(bps)) / 10_000n).toString()
}

export function passportProDiscountMinor(listedPriceMinor: string): string {
  return bpsOfMinor(listedPriceMinor, PASSPORT_PRO_CUSTOMER_DISCOUNT_BPS)
}

export function passportProNetMinor(listedPriceMinor: string): string {
  if (!MINOR.test(listedPriceMinor)) throw new Error('AMOUNT_INVALID')
  return (BigInt(listedPriceMinor) - BigInt(passportProDiscountMinor(listedPriceMinor))).toString()
}

export function passportProCommissionMinor(netPaidMinor: string): string {
  return bpsOfMinor(netPaidMinor, PASSPORT_PRO_COMMISSION_BPS)
}

/** M-Credits, USD, or any other asset is not the PRO commission asset. */
export function isSameAssetProCommission(asset: string | null | undefined): boolean {
  if (asset == null || asset.trim() === '') return true
  return asset.trim().toUpperCase() === PASSPORT_PRO_COMMISSION_ASSET
}

/** Passport quote wire fields. Mapped here so callers do not pass the quote object through. */
export type ReferralQuoteWire = {
  listed_price_minor: string
  discount_minor: string
  net_paid_minor: string
  commission_amount_minor: string
  commission_asset?: string | null
}

export function passportProEconomicsFromReferralQuote(quote: ReferralQuoteWire): PassportProEconomics {
  return assertPassportProEconomics({
    listedPriceMinor: quote.listed_price_minor,
    discountMinor: quote.discount_minor,
    netPaidMinor: quote.net_paid_minor,
    commissionAmountMinor: quote.commission_amount_minor,
    commissionAsset: quote.commission_asset,
  })
}

export function assertPassportProEconomics(input: {
  listedPriceMinor: string
  discountMinor: string
  netPaidMinor: string
  commissionAmountMinor: string
  commissionAsset?: string | null
}): PassportProEconomics {
  const listedPriceMinor = input.listedPriceMinor.trim()
  const discountMinor = input.discountMinor.trim()
  const netPaidMinor = input.netPaidMinor.trim()
  const commissionAmountMinor = input.commissionAmountMinor.trim()
  if (![listedPriceMinor, discountMinor, netPaidMinor, commissionAmountMinor].every((value) => MINOR.test(value))) {
    throw new Error('REFERRAL_ECONOMICS_INVALID')
  }
  if (discountMinor !== passportProDiscountMinor(listedPriceMinor)) throw new Error('DISCOUNT_NOT_10_PERCENT')
  if (netPaidMinor !== (BigInt(listedPriceMinor) - BigInt(discountMinor)).toString()) throw new Error('NET_MISMATCH')
  if (commissionAmountMinor !== passportProCommissionMinor(netPaidMinor)) {
    throw new Error('COMMISSION_NOT_30_PERCENT_OF_NET')
  }
  if (!isSameAssetProCommission(input.commissionAsset)) throw new Error('COMMISSION_ASSET_MISMATCH')
  return {
    listedPriceMinor,
    discountMinor,
    netPaidMinor,
    commissionAmountMinor,
    commissionAsset: PASSPORT_PRO_COMMISSION_ASSET,
  }
}

/**
 * Payable amount is the net only. Cashback and commission are not subtracted
 * again: cashback is M-Credits, and commission is recorded against the net.
 */
export function payableMinorAfterReferral(economics: PassportProEconomics): string {
  return economics.netPaidMinor
}
