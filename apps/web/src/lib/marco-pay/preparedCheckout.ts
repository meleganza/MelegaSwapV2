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

export const MARCO_PAY_WALLET_COPY = {
  cancelled: 'Payment cancelled — you can continue.',
  insufficientMarco: 'This wallet does not hold enough MARCO on BNB Smart Chain for this order. MARCO Pay was not charged.',
  insufficientGas: 'This wallet does not hold enough BNB to pay the network fee. MARCO Pay was not charged.',
  reverted: 'The MARCO transfer would fail on BNB Smart Chain. MARCO Pay was not charged.',
  rpcUnavailable: 'BNB Smart Chain did not respond. Check your wallet activity before paying again.',
  notSent: 'The wallet did not confirm the MARCO transfer. Check your wallet activity before paying again.',
} as const

function walletErrorText(cause: unknown): { code: unknown; text: string } {
  if (cause && typeof cause === 'object') {
    const record = cause as { code?: unknown; message?: unknown; reason?: unknown; error?: { message?: unknown } }
    const parts = [record.message, record.reason, record.error?.message].filter(
      (part): part is string => typeof part === 'string',
    )
    return { code: record.code, text: parts.join(' ') }
  }
  return { code: undefined, text: typeof cause === 'string' ? cause : '' }
}

/**
 * Wallet-side failures while sending the MARCO transfer. None of these is a
 * MARCO Pay outage. Only failures that happen before broadcast (rejection,
 * balance, gas, simulated revert) state that nothing was charged.
 */
export function marcoPayWalletErrorMessage(cause: unknown): {
  kind: keyof typeof MARCO_PAY_WALLET_COPY | 'other'
  message: string
} {
  const { code, text } = walletErrorText(cause)
  if (code === 4001 || code === 'ACTION_REJECTED' || /reject|denied|cancel/i.test(text)) {
    return { kind: 'cancelled', message: MARCO_PAY_WALLET_COPY.cancelled }
  }
  if (/transfer amount exceeds balance|exceeds balance|insufficient balance/i.test(text)) {
    return { kind: 'insufficientMarco', message: MARCO_PAY_WALLET_COPY.insufficientMarco }
  }
  if (code === 'INSUFFICIENT_FUNDS' || /insufficient funds/i.test(text)) {
    return { kind: 'insufficientGas', message: MARCO_PAY_WALLET_COPY.insufficientGas }
  }
  if (code === 'UNPREDICTABLE_GAS_LIMIT' || code === 'CALL_EXCEPTION' || /execution reverted/i.test(text)) {
    return { kind: 'reverted', message: MARCO_PAY_WALLET_COPY.reverted }
  }
  if (code === 'TIMEOUT' || code === 'NETWORK_ERROR' || code === 'SERVER_ERROR' || /timeout|timed out|failed to fetch|network error/i.test(text)) {
    return { kind: 'rpcUnavailable', message: MARCO_PAY_WALLET_COPY.rpcUnavailable }
  }
  const firstSentence = text.split(/\s\[\s*See:|\s\(reason=|\s\(error=/)[0].trim()
  return { kind: 'other', message: firstSentence || MARCO_PAY_WALLET_COPY.notSent }
}
