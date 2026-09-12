import { describe, expect, it } from 'vitest'
import { lastSwapEstimateError, selectSuccessfulSwapEstimate } from '../selectSuccessfulSwapEstimate'

describe('selectSuccessfulSwapEstimate', () => {
  it('uses the standard estimate when FOT fails (M01 reflection / output tax)', () => {
    const standard = { call: { method: 'swapExactTokensForTokens' }, gasEstimate: 180000n }
    const fot = {
      call: { method: 'swapExactTokensForTokensSupportingFeeOnTransferTokens' },
      error: 'DEXRouter: INSUFFICIENT_OUTPUT_AMOUNT',
    }
    const selected = selectSuccessfulSwapEstimate([standard, fot])
    expect(selected).toBe(standard)
    expect((selected as typeof standard).call.method).toBe('swapExactTokensForTokens')
  })

  it('preserves fee-on-transfer fallback when only the FOT estimate succeeds', () => {
    const standard = { call: { method: 'swapExactTokensForTokens' }, error: 'DEXRouter: K' }
    const fot = {
      call: { method: 'swapExactTokensForTokensSupportingFeeOnTransferTokens' },
      gasEstimate: 210000n,
    }
    expect(selectSuccessfulSwapEstimate([standard, fot])).toBe(fot)
  })

  it('prefers the first successful estimate when both succeed (no method switch, no retry)', () => {
    const standard = { call: { method: 'swapExactTokensForTokens' }, gasEstimate: 180000n }
    const fot = {
      call: { method: 'swapExactTokensForTokensSupportingFeeOnTransferTokens' },
      gasEstimate: 210000n,
    }
    expect(selectSuccessfulSwapEstimate([standard, fot])).toBe(standard)
  })

  it('returns undefined when every estimate fails and exposes the last error', () => {
    const calls = [
      { error: 'DEXRouter: EXPIRED' },
      { error: 'DEXRouter: INSUFFICIENT_OUTPUT_AMOUNT' },
    ]
    expect(selectSuccessfulSwapEstimate(calls)).toBeUndefined()
    expect(lastSwapEstimateError(calls)).toBe('DEXRouter: INSUFFICIENT_OUTPUT_AMOUNT')
  })

  it('does not invent a looser slippage or a third retry estimate', () => {
    const standard = { call: { method: 'swapExactTokensForTokens' }, gasEstimate: 1n, allowedSlippageBps: 50 }
    const fot = { error: 'DEXRouter: INSUFFICIENT_OUTPUT_AMOUNT', allowedSlippageBps: 50 }
    const selected = selectSuccessfulSwapEstimate([standard, fot]) as typeof standard
    expect(selected.allowedSlippageBps).toBe(50)
    expect([standard, fot]).toHaveLength(2)
  })
})
