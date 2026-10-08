/**
 * Client binding for a prepared MARCO Pay review.
 * A cached session is reused only while the referral, package, account, chain
 * and quote age still match. It never decides that MARCO Pay is ready.
 */

export const MARCO_PAY_PREPARED_QUOTE_TTL_MS = 10 * 60 * 1000

export const MARCO_PAY_PROVIDER_UNAVAILABLE = 'MARCO Pay is temporarily unavailable.'

export type MarcoPayPreparedBinding = {
  referralCode: string | null
  packageId: string
  serviceId: string
  buyerWallet: string
  targetKey: string
  quotedAt: number
}

export type MarcoPayPreparedRequest = Omit<MarcoPayPreparedBinding, 'quotedAt'> & {
  now: number
}

export function isMarcoPayPreparedOrderCurrent(
  order: MarcoPayPreparedBinding,
  requested: MarcoPayPreparedRequest,
  ttlMs = MARCO_PAY_PREPARED_QUOTE_TTL_MS,
): boolean {
  if (!requested.buyerWallet || !requested.targetKey || !requested.packageId || !requested.serviceId) return false
  if (order.referralCode !== requested.referralCode) return false
  if (order.packageId !== requested.packageId) return false
  if (order.serviceId !== requested.serviceId) return false
  if (order.buyerWallet.toLowerCase() !== requested.buyerWallet.toLowerCase()) return false
  if (order.targetKey !== requested.targetKey) return false
  if (!Number.isFinite(order.quotedAt) || !Number.isFinite(requested.now)) return false
  const age = requested.now - order.quotedAt
  return age >= 0 && age < ttlMs
}

const REFERRAL_REVIEW_MESSAGES: Record<string, string> = {
  REFERRAL_CODE_INVALID: 'This referral code cannot be used.',
  REFERRAL_CATALOG_UNAVAILABLE: 'This package is not in the Passport PRO catalogue.',
  REFERRAL_NOT_VERIFIED: 'This Passport PRO referral could not be verified. MARCO Pay was not charged.',
}

/** Referral verification failures are not a MARCO Pay outage. */
export function marcoPayReviewErrorMessage(payload: { error?: unknown; message?: unknown } | null | undefined): string {
  const code = typeof payload?.error === 'string' ? payload.error : ''
  const message = typeof payload?.message === 'string' ? payload.message.trim() : ''
  if (REFERRAL_REVIEW_MESSAGES[code]) return message || REFERRAL_REVIEW_MESSAGES[code]
  if (message) return message
  return MARCO_PAY_PROVIDER_UNAVAILABLE
}
