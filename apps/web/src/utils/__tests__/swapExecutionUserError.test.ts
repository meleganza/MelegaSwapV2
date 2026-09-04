import { describe, expect, it } from 'vitest'
import { toUserFacingExecutionError } from 'lib/smart-swap-execution-handoff'
import { transactionErrorToUserReadableMessage } from '../transactionErrorToUserReadableMessage'
import {
  GENERIC_SWAP_EXECUTION_USER_MESSAGE,
  PRICE_MOVED_DETAIL,
  PRICE_MOVED_HEADLINE,
  PRICE_MOVED_USER_MESSAGE,
  extractSwapExecutionReason,
  isPriceMovedBeforeConfirmationMessage,
  mapSwapExecutionReasonToUserMessage,
  nextSwapStateAfterErrorDismiss,
  sanitizeSwapUserError,
} from '../swapExecutionUserError'

const t = (key: string) => key

const RAW_SAMPLES = [
  'DEXRouter: INSUFFICIENT_OUTPUT_AMOUNT',
  'PancakeRouter: INSUFFICIENT_OUTPUT_AMOUNT',
  'execution reverted: DEXRouter: INSUFFICIENT_OUTPUT_AMOUNT',
  'Unknown error: "DEXRouter: INSUFFICIENT_OUTPUT_AMOUNT". Try increasing your slippage tolerance.',
  'Swap failed: Unknown error: "DEXRouter: INSUFFICIENT_OUTPUT_AMOUNT". Try increasing your slippage tolerance.',
]

describe('swap execution user error mapping', () => {
  it('maps DEXRouter / PancakeRouter insufficient-output to Price moved before confirmation', () => {
    for (const raw of RAW_SAMPLES) {
      const mapped = sanitizeSwapUserError(raw)
      expect(mapped).toBe(PRICE_MOVED_USER_MESSAGE)
      expect(mapped).toContain(PRICE_MOVED_HEADLINE)
      expect(mapped).toContain(PRICE_MOVED_DETAIL)
      expect(mapped).not.toMatch(/Unknown error/i)
      expect(mapped).not.toMatch(/DEXRouter:/)
      expect(mapped).not.toMatch(/PancakeRouter:/)
    }
  })

  it('maps ethers-shaped revert objects through transactionErrorToUserReadableMessage', () => {
    const error = {
      reason: 'execution reverted: DEXRouter: INSUFFICIENT_OUTPUT_AMOUNT',
      message: 'execution reverted: DEXRouter: INSUFFICIENT_OUTPUT_AMOUNT',
    }
    expect(extractSwapExecutionReason(error)).toBe('DEXRouter: INSUFFICIENT_OUTPUT_AMOUNT')
    expect(transactionErrorToUserReadableMessage(error, t)).toBe(PRICE_MOVED_USER_MESSAGE)
    expect(mapSwapExecutionReasonToUserMessage('DEXRouter: INSUFFICIENT_OUTPUT_AMOUNT', t)).toBe(
      PRICE_MOVED_USER_MESSAGE,
    )
  })

  it('never renders Unknown error: or raw DEXRouter: for unknown reverts', () => {
    const mapped = transactionErrorToUserReadableMessage({ message: 'DEXRouter: SOME_NEW_CODE' }, t)
    expect(mapped).toBe(GENERIC_SWAP_EXECUTION_USER_MESSAGE)
    expect(mapped).not.toMatch(/Unknown error/)
    expect(mapped).not.toMatch(/DEXRouter:/)
    expect(sanitizeSwapUserError('Unknown error: "boom"')).not.toMatch(/Unknown error/)
    expect(sanitizeSwapUserError('Unknown error: "boom"')).not.toMatch(/DEXRouter:/)
  })

  it('preserves other known execution mappings', () => {
    expect(mapSwapExecutionReasonToUserMessage('DEXRouter: EXPIRED', t)).toMatch(/deadline has passed/)
    expect(mapSwapExecutionReasonToUserMessage('TransferHelper: TRANSFER_FROM_FAILED', t)).toMatch(
      /input token cannot be transferred/,
    )
    expect(mapSwapExecutionReasonToUserMessage('Pancake: TRANSFER_FAILED', t)).toMatch(
      /output token cannot be transferred/,
    )
    expect(mapSwapExecutionReasonToUserMessage('Pancake: K', t)).toMatch(/price movement or fee on transfer/)
  })

  it('refresh-quote dismiss clears stale execution error and does not retry or raise slippage', () => {
    const dismissed = nextSwapStateAfterErrorDismiss(PRICE_MOVED_USER_MESSAGE)
    expect(isPriceMovedBeforeConfirmationMessage(PRICE_MOVED_USER_MESSAGE)).toBe(true)
    expect(dismissed.swapErrorMessage).toBeUndefined()
    expect(dismissed.shouldRefreshQuote).toBe(true)
    expect(dismissed.autoRetry).toBe(false)
    expect(dismissed.slippageBipsDelta).toBe(0)

    const other = nextSwapStateAfterErrorDismiss('Wallet rejected the transaction.')
    expect(other.swapErrorMessage).toBe('Wallet rejected the transaction.')
    expect(other.shouldRefreshQuote).toBe(false)
    expect(other.autoRetry).toBe(false)
    expect(other.slippageBipsDelta).toBe(0)

    const fromRaw = nextSwapStateAfterErrorDismiss('DEXRouter: INSUFFICIENT_OUTPUT_AMOUNT')
    expect(fromRaw.shouldRefreshQuote).toBe(true)
    expect(fromRaw.swapErrorMessage).toBeUndefined()
    expect(fromRaw.autoRetry).toBe(false)
    expect(fromRaw.slippageBipsDelta).toBe(0)
  })

  it('toUserFacingExecutionError remaps raw router leaks without dropping known handoff copy', () => {
    expect(toUserFacingExecutionError('DEXRouter: INSUFFICIENT_OUTPUT_AMOUNT')).toBe(PRICE_MOVED_USER_MESSAGE)
    expect(toUserFacingExecutionError('Certified handoff is required before live execution')).toBe(
      'Execution preparation unavailable. Refresh quote.',
    )
  })
})
