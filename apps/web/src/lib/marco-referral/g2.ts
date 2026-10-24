/** Review-only standard referral contract. Not wired into DEX checkout. */
export const MARCO_REFERRAL_G2_CONTRACT_VERSION = 'MARCO_REFERRAL_G2_V1' as const
export const MELEGA_DEX_REFERRAL_G2_CONSUMER_VERSION = 'melega-dex.referral.g2.v1' as const

export const MARCO_REFERRAL_G2_POLICY = Object.freeze({
  active: false,
  effectiveAt: null,
  basis: 'LISTED' as const,
  customerDiscountBps: 1_000,
  referralCommissionBps: 3_000,
  merchantShareBps: 6_000,
  claimMode: 'MANUAL' as const,
  claimWindowDays: 90,
})

export type MelegaDexReferralG2Quote = {
  quoteRef: string
  applicationRef: string
  referralCode: string
  currency: string
  listedMinor: bigint
  contractVersion: typeof MARCO_REFERRAL_G2_CONTRACT_VERSION
  consumer: 'MELEGA_DEX'
  consumerVersion: typeof MELEGA_DEX_REFERRAL_G2_CONSUMER_VERSION
  basis: 'LISTED'
  active: false
  customerDiscountMinor: bigint
  customerPayableMinor: bigint
  referralCommissionMinor: bigint
  merchantShareMinor: bigint
  claimMode: 'MANUAL'
  claimWindowDays: number
}

function shareOfListed(listedMinor: bigint, bps: number): bigint {
  return (listedMinor * BigInt(bps)) / 10_000n
}

/** Creates a versioned evidence quote; it cannot authorize payment or settlement. */
export function quoteMelegaDexReferralG2(input: {
  quoteRef: string
  applicationRef: string
  referralCode: string
  currency: string
  listedMinor: bigint
}): MelegaDexReferralG2Quote {
  if (input.listedMinor <= 0n) throw new RangeError('listedMinor must be positive')
  if (!input.quoteRef || !input.applicationRef || !input.referralCode || !input.currency) {
    throw new TypeError('quote identity, application, referral code and currency are required')
  }
  const customerDiscountMinor = shareOfListed(input.listedMinor, MARCO_REFERRAL_G2_POLICY.customerDiscountBps)
  const referralCommissionMinor = shareOfListed(input.listedMinor, MARCO_REFERRAL_G2_POLICY.referralCommissionBps)
  const merchantShareMinor = input.listedMinor - customerDiscountMinor - referralCommissionMinor

  return {
    ...input,
    contractVersion: MARCO_REFERRAL_G2_CONTRACT_VERSION,
    consumer: 'MELEGA_DEX',
    consumerVersion: MELEGA_DEX_REFERRAL_G2_CONSUMER_VERSION,
    basis: MARCO_REFERRAL_G2_POLICY.basis,
    active: false,
    customerDiscountMinor,
    customerPayableMinor: input.listedMinor - customerDiscountMinor,
    referralCommissionMinor,
    merchantShareMinor,
    claimMode: MARCO_REFERRAL_G2_POLICY.claimMode,
    claimWindowDays: MARCO_REFERRAL_G2_POLICY.claimWindowDays,
  }
}
