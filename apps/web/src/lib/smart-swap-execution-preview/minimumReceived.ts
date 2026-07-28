/**
 * Minimum received from existing slippage bips — not a second slippage model.
 * amountOut * (10000 - slippageBips) / 10000
 */
export function computeMinimumReceivedRaw(expectedOutputRaw: string, slippageBips: number): string | null {
  if (!expectedOutputRaw || expectedOutputRaw === '0') return null
  if (!Number.isFinite(slippageBips) || slippageBips < 0 || slippageBips > 10000) return null
  try {
    const out = BigInt(expectedOutputRaw)
    const min = (out * BigInt(10000 - slippageBips)) / 10000n
    return min.toString()
  } catch {
    return null
  }
}

export function formatRawAmount(raw: string | null, decimals: number, maxFrac = 6): string | null {
  if (raw == null) return null
  try {
    const neg = raw.startsWith('-')
    const digits = neg ? raw.slice(1) : raw
    if (!/^\d+$/.test(digits)) return null
    const padded = digits.padStart(decimals + 1, '0')
    const whole = padded.slice(0, padded.length - decimals) || '0'
    let frac = padded.slice(padded.length - decimals).replace(/0+$/, '')
    if (frac.length > maxFrac) frac = frac.slice(0, maxFrac)
    const body = frac ? `${whole}.${frac}` : whole
    return neg ? `-${body}` : body
  } catch {
    return null
  }
}
