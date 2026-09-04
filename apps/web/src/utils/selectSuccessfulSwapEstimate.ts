/**
 * Choose a swap estimate that can actually be sent.
 *
 * V2 exact-in builds two calls: standard, then supportingFeeOnTransferTokens.
 * Output-tax / reflection tokens (e.g. M01) often succeed on the standard method
 * and revert on the fee-on-transfer variant with INSUFFICIENT_OUTPUT_AMOUNT.
 * Requiring the *next* estimate to also succeed discarded the working standard
 * call and surfaced the FOT revert. Use the first successful estimate instead.
 *
 * Does not retry, does not change slippage, does not alter calldata.
 */
export function selectSuccessfulSwapEstimate<T extends object>(estimatedCalls: T[]): T | undefined {
  return estimatedCalls.find((el) => {
    if (!('gasEstimate' in el)) return false
    return (el as { gasEstimate?: unknown }).gasEstimate != null
  })
}

export function lastSwapEstimateError<T extends { error?: string }>(estimatedCalls: T[]): string | undefined {
  const errorCalls = estimatedCalls.filter((call) => typeof call.error === 'string' && call.error.length > 0)
  if (errorCalls.length === 0) return undefined
  return errorCalls[errorCalls.length - 1].error
}
