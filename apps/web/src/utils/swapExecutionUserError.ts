/**
 * User-facing swap execution errors.
 * Technical revert strings stay in console/telemetry only.
 */

export const PRICE_MOVED_HEADLINE = 'Price moved before confirmation'
export const PRICE_MOVED_DETAIL =
  'The live price changed and the minimum output can no longer be guaranteed. Refresh the quote and try again.'
export const PRICE_MOVED_USER_MESSAGE = `${PRICE_MOVED_HEADLINE}. ${PRICE_MOVED_DETAIL}`

export const GENERIC_SWAP_EXECUTION_USER_MESSAGE =
  'The swap could not be completed. Refresh the quote and try again.'

const INSUFFICIENT_OUTPUT = 'INSUFFICIENT_OUTPUT_AMOUNT'
const ROUTER_PREFIX = /^(DEXRouter|PancakeRouter|Pancake):\s*/i
const EXECUTION_REVERTED = /^execution reverted:\s*/i

type Translate = (key: string, data?: Record<string, string>) => string

const identityTranslate: Translate = (key) => key

export function extractSwapExecutionReason(error: unknown): string | undefined {
  let reason: string | undefined
  let current: any = error
  while (current) {
    reason = current.reason ?? current.data?.message ?? current.message ?? reason
    current = current.error ?? current.data?.originalError
  }
  if (reason?.indexOf('execution reverted: ') === 0) {
    reason = reason.substring('execution reverted: '.length)
  }
  return reason
}

export function stripRouterErrorPrefix(reason: string | undefined): string {
  if (!reason) return ''
  const embedded = reason.match(/(?:DEXRouter|PancakeRouter|Pancake):\s*([A-Z0-9_]+)/i)
  if (embedded?.[1]) return embedded[1]
  return reason.replace(EXECUTION_REVERTED, '').replace(ROUTER_PREFIX, '').trim()
}

export function isInsufficientOutputAmountReason(reason: string | undefined | null): boolean {
  if (!reason) return false
  return stripRouterErrorPrefix(reason).toUpperCase().includes(INSUFFICIENT_OUTPUT)
}

export function isPriceMovedBeforeConfirmationMessage(message: string | undefined | null): boolean {
  if (!message) return false
  return message.includes(PRICE_MOVED_HEADLINE)
}

export function looksLikeRawRouterOrUnknownError(message: string | undefined | null): boolean {
  if (!message) return false
  return /Unknown error/i.test(message) || /DEXRouter:/i.test(message) || /PancakeRouter:/i.test(message)
}

/**
 * Map a revert reason / already-formatted callback error to product copy.
 * Never returns `Unknown error:` or raw `DEXRouter:` / `PancakeRouter:` strings.
 */
export function mapSwapExecutionReasonToUserMessage(
  reason: string | undefined,
  t: Translate = identityTranslate,
): string {
  const normalized = stripRouterErrorPrefix(reason)

  if (normalized === INSUFFICIENT_OUTPUT || isInsufficientOutputAmountReason(reason)) {
    return PRICE_MOVED_USER_MESSAGE
  }

  switch (normalized) {
    case 'EXPIRED':
      return t(
        'The transaction could not be sent because the deadline has passed. Please check that your transaction deadline is not too low.',
      )
    case 'EXCESSIVE_INPUT_AMOUNT':
    case 'INSUFFICIENT_A_AMOUNT':
    case 'INSUFFICIENT_B_AMOUNT':
    case 'K':
      return t(
        'This transaction will not succeed either due to price movement or fee on transfer. Try increasing your slippage tolerance.',
      )
    default:
      break
  }

  if (normalized === 'incorrect user balance' || reason === 'swapMulti: incorrect user balance') {
    return t(
      'This transaction will not succeed either due to price movement or fee on transfer. Try increasing your slippage tolerance.',
    )
  }

  if (normalized === 'TRANSFER_FROM_FAILED' || reason === 'TransferHelper: TRANSFER_FROM_FAILED') {
    return t('The input token cannot be transferred. There may be an issue with the input token.')
  }

  if (normalized === 'TRANSFER_FAILED') {
    return t('The output token cannot be transferred. There may be an issue with the output token.')
  }

  if (reason?.indexOf('undefined is not an object') !== -1) {
    return t(
      'An error occurred when trying to execute this operation. You may need to increase your slippage tolerance. If that does not work, there may be an incompatibility with the token you are trading.',
    )
  }

  if (isPriceMovedBeforeConfirmationMessage(reason)) {
    return PRICE_MOVED_USER_MESSAGE
  }

  return t(GENERIC_SWAP_EXECUTION_USER_MESSAGE)
}

/**
 * Display-boundary sanitizer. Safe to run on already-mapped strings.
 */
export function nextSwapStateAfterErrorDismiss(swapErrorMessage: string | undefined): {
  swapErrorMessage: string | undefined
  shouldRefreshQuote: boolean
  autoRetry: false
  slippageBipsDelta: 0
} {
  if (!swapErrorMessage) {
    return { swapErrorMessage: undefined, shouldRefreshQuote: false, autoRetry: false, slippageBipsDelta: 0 }
  }
  const sanitized = sanitizeSwapUserError(swapErrorMessage)
  const priceMoved = isPriceMovedBeforeConfirmationMessage(sanitized)
  return {
    swapErrorMessage: priceMoved ? undefined : sanitized,
    shouldRefreshQuote: priceMoved,
    autoRetry: false,
    slippageBipsDelta: 0,
  }
}

export function sanitizeSwapUserError(message: string | undefined | null): string {
  if (!message) return GENERIC_SWAP_EXECUTION_USER_MESSAGE
  if (isPriceMovedBeforeConfirmationMessage(message)) return PRICE_MOVED_USER_MESSAGE
  if (isInsufficientOutputAmountReason(message)) return PRICE_MOVED_USER_MESSAGE
  if (/stale (quote|price)|price moved|minimum output/i.test(message) && /slippage|INSUFFICIENT_OUTPUT/i.test(message)) {
    return PRICE_MOVED_USER_MESSAGE
  }
  if (looksLikeRawRouterOrUnknownError(message)) {
    if (isInsufficientOutputAmountReason(message)) return PRICE_MOVED_USER_MESSAGE
    return mapSwapExecutionReasonToUserMessage(extractSwapExecutionReason({ message }) ?? message)
  }
  return message
}
