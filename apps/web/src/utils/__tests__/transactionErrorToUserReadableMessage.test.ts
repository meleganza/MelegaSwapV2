import { describe, expect, it } from 'vitest'
import {
  isTransactionDeadlineExpiredReason,
  transactionErrorToUserReadableMessage,
} from '../transactionErrorToUserReadableMessage'

const translate = ((message: string) => message) as never

describe('transaction deadline error classification', () => {
  it('recognizes Melega DEXRouter expiry including encoded provider suffixes', () => {
    expect(isTransactionDeadlineExpiredReason('DEXRouter: EXPIRED')).toBe(true)
    expect(isTransactionDeadlineExpiredReason('DEXRouter: EXPIRED: 0x08c379a0')).toBe(true)

    const message = transactionErrorToUserReadableMessage(
      { reason: 'DEXRouter: EXPIRED: 0x08c379a0' },
      translate,
    )
    expect(message).toContain('deadline has passed')
    expect(message).not.toContain('slippage tolerance')
  })

  it('keeps Pancake expiry support without classifying slippage failures as expiry', () => {
    expect(isTransactionDeadlineExpiredReason('PancakeRouter: EXPIRED')).toBe(true)
    expect(isTransactionDeadlineExpiredReason('DEXRouter: INSUFFICIENT_A_AMOUNT')).toBe(false)
  })
})
