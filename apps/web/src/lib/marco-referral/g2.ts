/** Review-only standard referral contract. Not wired into DEX checkout. */
export const MARCO_REFERRAL_G2_CONTRACT_VERSION = 'MARCO_REFERRAL_G2_V1' as const
export const MELEGA_DEX_REFERRAL_G2_CONSUMER_VERSION = 'melega-dex.referral.g2.v1' as const
export const MELEGA_DEX_REFERRAL_G2_CONSUMER = 'MELEGASWAP' as const
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

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
  consumer: typeof MELEGA_DEX_REFERRAL_G2_CONSUMER
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
    consumer: MELEGA_DEX_REFERRAL_G2_CONSUMER,
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

export type MelegaDexReferralG2SettlementEvidence = {
  contract_version: typeof MARCO_REFERRAL_G2_CONTRACT_VERSION
  consumer: typeof MELEGA_DEX_REFERRAL_G2_CONSUMER
  consumer_version: typeof MELEGA_DEX_REFERRAL_G2_CONSUMER_VERSION
  application_id: string
  order_id: string
  referral_code: string
  currency: string
  listed_minor: string
  customer_paid_minor: string
  settlement_reference: string
}

/** Builds review-only Passport evidence; it never submits or activates it. */
export function melegaDexReferralG2SettlementEvidence(input: {
  applicationId: string
  orderId: string
  referralCode: string
  currency: string
  listedMinor: bigint
  customerPaidMinor: bigint
  settlementReference: string
}): MelegaDexReferralG2SettlementEvidence {
  const quote = quoteMelegaDexReferralG2({
    quoteRef: input.orderId,
    applicationRef: input.applicationId,
    referralCode: input.referralCode,
    currency: input.currency,
    listedMinor: input.listedMinor,
  })
  if (!UUID.test(input.applicationId.trim())) throw new TypeError('applicationId must be the canonical UUID')
  if (!input.orderId.trim() || !input.settlementReference.trim()) throw new TypeError('order and settlement references are required')
  if (input.customerPaidMinor !== quote.customerPayableMinor) {
    throw new RangeError('customerPaidMinor does not match the authority quote')
  }
  return {
    contract_version: MARCO_REFERRAL_G2_CONTRACT_VERSION,
    consumer: MELEGA_DEX_REFERRAL_G2_CONSUMER,
    consumer_version: MELEGA_DEX_REFERRAL_G2_CONSUMER_VERSION,
    application_id: input.applicationId.trim().toLowerCase(),
    order_id: input.orderId.trim(),
    referral_code: input.referralCode.trim().toUpperCase(),
    currency: input.currency.trim().toUpperCase(),
    listed_minor: quote.listedMinor.toString(),
    customer_paid_minor: quote.customerPayableMinor.toString(),
    settlement_reference: input.settlementReference.trim(),
  }
}
