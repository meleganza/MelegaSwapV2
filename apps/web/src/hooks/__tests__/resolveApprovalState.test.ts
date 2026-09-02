import { describe, expect, it } from 'vitest'
import { CurrencyAmount, Token } from '@pancakeswap/sdk'
import { ApprovalState, resolveApprovalState } from '../useApproveCallback'

const token = new Token(56, '0x1Fd991fb35D39182dE128c2b374A6Ca78b2e21D6', 18, 'MARCO')
const required = CurrencyAmount.fromRawAmount(token, '1000000000000000000')
const insufficient = CurrencyAmount.fromRawAmount(token, '1')
const sufficient = CurrencyAmount.fromRawAmount(token, '1000000000000000000')

describe('resolveApprovalState — Enabling must not latch after a settled approval', () => {
  it('stays Enabling only while a pending approval is still open and allowance is insufficient', () => {
    expect(
      resolveApprovalState({
        amountToApprove: required,
        spender: '0xrouter',
        currentAllowance: insufficient,
        effectivePendingApproval: true,
        unknownAllowanceTimedOut: false,
      }),
    ).toBe(ApprovalState.PENDING)
  })

  it('C/E: receipt success + refreshed sufficient allowance becomes APPROVED', () => {
    expect(
      resolveApprovalState({
        amountToApprove: required,
        spender: '0xrouter',
        currentAllowance: sufficient,
        effectivePendingApproval: false,
        unknownAllowanceTimedOut: false,
      }),
    ).toBe(ApprovalState.APPROVED)
  })

  it('D: failed/rejected/timed-out pending with insufficient allowance returns NOT_APPROVED', () => {
    expect(
      resolveApprovalState({
        amountToApprove: required,
        spender: '0xrouter',
        currentAllowance: insufficient,
        effectivePendingApproval: false,
        unknownAllowanceTimedOut: false,
      }),
    ).toBe(ApprovalState.NOT_APPROVED)
  })

  it('E: stale cache after receipt (pending cleared, allowance still low) does not stay PENDING', () => {
    const state = resolveApprovalState({
      amountToApprove: required,
      spender: '0xrouter',
      currentAllowance: insufficient,
      effectivePendingApproval: false,
      unknownAllowanceTimedOut: true,
    })
    expect(state).toBe(ApprovalState.NOT_APPROVED)
    expect(state).not.toBe(ApprovalState.PENDING)
  })

  it('unknown allowance without timeout stays UNKNOWN; timeout without pending becomes NOT_APPROVED', () => {
    expect(
      resolveApprovalState({
        amountToApprove: required,
        spender: '0xrouter',
        currentAllowance: null,
        effectivePendingApproval: false,
        unknownAllowanceTimedOut: false,
      }),
    ).toBe(ApprovalState.UNKNOWN)
    expect(
      resolveApprovalState({
        amountToApprove: required,
        spender: '0xrouter',
        currentAllowance: null,
        effectivePendingApproval: false,
        unknownAllowanceTimedOut: true,
      }),
    ).toBe(ApprovalState.NOT_APPROVED)
  })
})
