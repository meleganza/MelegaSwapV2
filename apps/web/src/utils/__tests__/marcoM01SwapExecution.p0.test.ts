/**
 * P0 MARCO→M01: quote/execution consistency + user-facing error mapping.
 * Reproduction uses a frozen production-like reserve snapshot (BSC read-only).
 */
import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { computeMinimumReceivedRaw } from 'lib/smart-swap-execution-preview'
import { lastSwapEstimateError, selectSuccessfulSwapEstimate } from '../selectSuccessfulSwapEstimate'
import {
  PRICE_MOVED_HEADLINE,
  PRICE_MOVED_USER_MESSAGE,
  mapSwapExecutionReasonToUserMessage,
  nextSwapStateAfterErrorDismiss,
  sanitizeSwapUserError,
} from '../swapExecutionUserError'
import { transactionErrorToUserReadableMessage } from '../transactionErrorToUserReadableMessage'

const WEB = path.resolve(__dirname, '../..')
const t = (key: string) => key

/** Frozen production-like BSC state from read-only eth_call (no broadcast). */
const MARCO = '0x963556de0eb8138E97A85F0A86eE0acD159D210b'
const M01 = '0x4034875250F797D00b819e9011c5BB9c2e799631'
const LUCK = '0xeE86B71B787f6DCF83a9856D181dda2b7b8398B0'
const PAIR_MARCO_M01 = '0xF04c6Ce1E2d50911dC6858f7e75b0dB4E054905e'
const ROUTER = '0xc25033218D181b27D4a2944Fbb04FC055da4EAB3'

const SNAPSHOT = {
  marcoDecimals: 18,
  m01Decimals: 9,
  luckDecimals: 18,
  reserveM01: 240279536278343371548066n,
  reserveMarco: 766514013537742427165291n,
  amountInWei: 10n ** 18n,
  routerAmountsOut: 312686423600706194n,
  feeNumerator: 9975n,
  feeDenominator: 10000n,
  slippageBips: 50,
}

function getAmountOut(amountIn: bigint, reserveIn: bigint, reserveOut: bigint): bigint {
  const amountInWithFee = amountIn * SNAPSHOT.feeNumerator
  const numerator = amountInWithFee * reserveOut
  const denominator = reserveIn * SNAPSHOT.feeDenominator + amountInWithFee
  return numerator / denominator
}

/** SDK Trade.minimumAmountOut: out / (1 + bips/10000) */
function sdkMinimumAmountOut(amountOut: bigint, slippageBips: number): bigint {
  return (amountOut * 10000n) / (10000n + BigInt(slippageBips))
}

function toHex(value: bigint): string {
  return `0x${value.toString(16)}`
}

describe('P0 MARCO→M01 quote → minOut → execution', () => {
  const amountOut = getAmountOut(SNAPSHOT.amountInWei, SNAPSHOT.reserveMarco, SNAPSHOT.reserveM01)
  const minOutSdk = sdkMinimumAmountOut(amountOut, SNAPSHOT.slippageBips)
  const minOutPreview = BigInt(computeMinimumReceivedRaw(amountOut.toString(), SNAPSHOT.slippageBips) ?? '0')

  it('A: production-like quote matches router getAmountsOut at 0.25% (9975) and 9-dec M01', () => {
    expect(amountOut).toBe(SNAPSHOT.routerAmountsOut)
    expect(SNAPSHOT.m01Decimals).toBe(9)
    expect(SNAPSHOT.marcoDecimals).toBe(18)
    expect(Number(amountOut) / 10 ** SNAPSHOT.m01Decimals).toBeCloseTo(312686423.6007062, 5)
  })

  it('B: exact-in execution args stay bound to the same route, input, decimals, and SDK minOut', () => {
    const args = {
      methodName: 'swapExactTokensForTokens',
      amountIn: toHex(SNAPSHOT.amountInWei),
      amountOutMin: toHex(minOutSdk),
      path: [MARCO, M01],
      router: ROUTER,
      pair: PAIR_MARCO_M01,
      allowedSlippageBps: SNAPSHOT.slippageBips,
    }
    expect(args.path).toEqual([MARCO, M01])
    expect(args.amountIn).toBe(toHex(SNAPSHOT.amountInWei))
    expect(BigInt(args.amountOutMin)).toBe(minOutSdk)
    expect(minOutSdk).toBeGreaterThan(0n)
    expect(minOutSdk).toBeLessThan(amountOut)
    expect(args.allowedSlippageBps).toBe(50)
    expect(minOutPreview).toBeGreaterThan(0n)
  })

  it('C: stale quote / reserve move that fails both estimates is fail-closed with Price moved copy', () => {
    const staleMinOut = minOutSdk
    const liveOut = minOutSdk - 1n
    expect(liveOut < staleMinOut).toBe(true)
    const estimated = [
      { error: 'DEXRouter: INSUFFICIENT_OUTPUT_AMOUNT' },
      { error: 'DEXRouter: INSUFFICIENT_OUTPUT_AMOUNT' },
    ]
    expect(selectSuccessfulSwapEstimate(estimated)).toBeUndefined()
    const thrown = lastSwapEstimateError(estimated)
    const user = sanitizeSwapUserError(thrown)
    expect(user).toBe(PRICE_MOVED_USER_MESSAGE)
    expect(user).toContain(PRICE_MOVED_HEADLINE)
    expect(user).not.toMatch(/DEXRouter:|Unknown error/)
  })

  it('D: refresh-quote dismiss clears stale execution state so minOut can be recomputed', () => {
    const dismissed = nextSwapStateAfterErrorDismiss(PRICE_MOVED_USER_MESSAGE)
    expect(dismissed.swapErrorMessage).toBeUndefined()
    expect(dismissed.shouldRefreshQuote).toBe(true)
    const freshOut = getAmountOut(
      SNAPSHOT.amountInWei,
      SNAPSHOT.reserveMarco + SNAPSHOT.amountInWei * 100n,
      SNAPSHOT.reserveM01 - SNAPSHOT.routerAmountsOut,
    )
    const freshMin = sdkMinimumAmountOut(freshOut, SNAPSHOT.slippageBips)
    expect(freshMin).not.toBe(minOutSdk)
    expect(freshMin).toBeGreaterThan(0n)
    expect(dismissed.autoRetry).toBe(false)
  })

  it('E: no automatic retry and no silent slippage increase', () => {
    const dismissed = nextSwapStateAfterErrorDismiss(PRICE_MOVED_USER_MESSAGE)
    expect(dismissed.autoRetry).toBe(false)
    expect(dismissed.slippageBipsDelta).toBe(0)
    const v2Calls = readFileSync(path.join(WEB, 'hooks/useSwapCallArguments.ts'), 'utf8')
    expect(v2Calls).toMatch(/feeOnTransfer:\s*false/)
    expect(v2Calls).toMatch(/feeOnTransfer:\s*true/)
    expect(v2Calls).not.toMatch(/allowedSlippage\s*\+\s*|slippageBips\s*\+\s*|minAmountOut\s*=\s*0/)
    const dismissSrc = readFileSync(path.join(WEB, 'views/Swap/components/SwapCommitButton.tsx'), 'utf8')
    const dismissFn = dismissSrc.slice(
      dismissSrc.indexOf('const handleConfirmDismiss'),
      dismissSrc.indexOf('// End Handlers'),
    )
    expect(dismissFn).toContain('nextSwapStateAfterErrorDismiss')
    expect(dismissFn).toContain('refreshBlockNumber')
    expect(dismissFn).not.toMatch(/handleSwap\(|swapCallback\(/)
  })

  it('F: raw DEXRouter / Unknown error never reach the user surface', () => {
    const rendered = [
      transactionErrorToUserReadableMessage({ reason: 'DEXRouter: INSUFFICIENT_OUTPUT_AMOUNT' }, t),
      sanitizeSwapUserError('Unknown error: "DEXRouter: INSUFFICIENT_OUTPUT_AMOUNT". Try increasing your slippage tolerance.'),
      mapSwapExecutionReasonToUserMessage('DEXRouter: INSUFFICIENT_OUTPUT_AMOUNT', t),
    ]
    for (const text of rendered) {
      expect(text).toBe(PRICE_MOVED_USER_MESSAGE)
      expect(text).not.toMatch(/Unknown error/)
      expect(text).not.toMatch(/DEXRouter:/)
    }
    const styled = readFileSync(path.join(WEB, 'views/Swap/components/styleds.tsx'), 'utf8')
    expect(styled).toContain('sanitizeSwapUserError')
  })

  it('G: fee-on-transfer execution method remains available when standard estimate fails', () => {
    const selected = selectSuccessfulSwapEstimate([
      { call: { method: 'swapExactTokensForTokens' }, error: 'DEXRouter: K' },
      { call: { method: 'swapExactTokensForTokensSupportingFeeOnTransferTokens' }, gasEstimate: 200000n },
    ])
    expect((selected as { call: { method: string } }).call.method).toBe(
      'swapExactTokensForTokensSupportingFeeOnTransferTokens',
    )
    const v2Calls = readFileSync(path.join(WEB, 'hooks/useSwapCallArguments.ts'), 'utf8')
    expect(v2Calls).toContain('feeOnTransfer: true')
    expect(v2Calls).toContain('feeOnTransfer: false')
  })

  it('root cause: M01 reflection FOT revert must not discard a successful standard estimate', () => {
    const selected = selectSuccessfulSwapEstimate([
      { call: { method: 'swapExactTokensForTokens' }, gasEstimate: 185000n },
      {
        call: { method: 'swapExactTokensForTokensSupportingFeeOnTransferTokens' },
        error: 'DEXRouter: INSUFFICIENT_OUTPUT_AMOUNT',
      },
    ])
    expect((selected as { call: { method: string } }).call.method).toBe('swapExactTokensForTokens')
    const callback = readFileSync(path.join(WEB, 'hooks/useSwapCallback.ts'), 'utf8')
    expect(callback).toContain('selectSuccessfulSwapEstimate')
    expect(callback).not.toMatch(/ix === list\.length - 1 \|\| 'gasEstimate' in list\[ix \+ 1\]/)
  })

  it('J: MARCO→LUCK stays on the same V2 exact-in code path (no pair-specific branch)', () => {
    const callback = readFileSync(path.join(WEB, 'hooks/useSwapCallback.ts'), 'utf8')
    const calls = readFileSync(path.join(WEB, 'hooks/useSwapCallArguments.ts'), 'utf8')
    expect(callback).not.toContain(M01)
    expect(callback).not.toContain(LUCK)
    expect(calls).not.toContain(M01)
    expect(calls).not.toContain(LUCK)
    expect(calls).toContain('Router.swapCallParameters')
    const luckSelected = selectSuccessfulSwapEstimate([
      { call: { method: 'swapExactTokensForTokens' }, gasEstimate: 170000n },
      { call: { method: 'swapExactTokensForTokensSupportingFeeOnTransferTokens' }, gasEstimate: 190000n },
    ])
    expect((luckSelected as { call: { method: string } }).call.method).toBe('swapExactTokensForTokens')
  })
})
