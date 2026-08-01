/**
 * Safe BigInt helpers — string-based to avoid @vercel/nft BigInt binary analysis crashes.
 */
export type WeiLike =
  | bigint
  | number
  | string
  | { toString(): string; _isBigNumber?: boolean; toBigInt?: () => bigint }
  | null
  | undefined

function toPlainString(value: WeiLike): string | null {
  if (value == null) return null
  if (typeof value === 'bigint') return value.toString()
  if (typeof value === 'number') {
    if (!Number.isFinite(value) || !Number.isInteger(value)) return null
    return String(Math.trunc(value))
  }
  if (typeof value === 'string') {
    const t = value.trim()
    return t || null
  }
  if (typeof value === 'object') {
    try {
      if (typeof value.toBigInt === 'function') return value.toBigInt().toString()
      return value.toString()
    } catch {
      return null
    }
  }
  return null
}

export function toSafeBigInt(value: WeiLike): bigint | null {
  const s = toPlainString(value)
  if (s == null) return null
  try {
    return BigInt(s)
  } catch {
    return null
  }
}

/** Compare as decimal integer strings (no bigint operators for NFT). */
export function weiLte(left: WeiLike, right: WeiLike): boolean {
  const a = toPlainString(left)
  const b = toPlainString(right)
  if (a == null || b == null) return false
  try {
    // lexicographic compare after equalizing length
    const negA = a.startsWith('-')
    const negB = b.startsWith('-')
    if (negA !== negB) return negA
    const aa = negA ? a.slice(1) : a
    const bb = negB ? b.slice(1) : b
    if (!/^\d+$/.test(aa) || !/^\d+$/.test(bb)) return false
    if (aa.length !== bb.length) {
      const shorter = aa.length < bb.length
      return negA ? !shorter : shorter
    }
    return negA ? aa >= bb : aa <= bb
  } catch {
    return false
  }
}

export function formatWeiToDecimal(wei: WeiLike, displayDecimals = 6): string {
  const s = toPlainString(wei)
  if (s == null) return '0'
  const neg = s.startsWith('-')
  const digits = (neg ? s.slice(1) : s).replace(/^0+/, '') || '0'
  if (!/^\d+$/.test(digits)) return '0'
  const padded = digits.padStart(19, '0')
  const whole = padded.slice(0, -18).replace(/^0+/, '') || '0'
  const frac = padded.slice(-18)
  const decimals = displayDecimals > 0 ? displayDecimals : 0
  const trimmed = frac.slice(0, decimals).replace(/0+$/, '')
  const body = trimmed.length ? `${whole}.${trimmed}` : whole
  return neg ? `-${body}` : body
}
