const SUBSCRIPT_DIGITS: Record<string, string> = {
  '0': '₀',
  '1': '₁',
  '2': '₂',
  '3': '₃',
  '4': '₄',
  '5': '₅',
  '6': '₆',
  '7': '₇',
  '8': '₈',
  '9': '₉',
}

function toSubscript(value: number): string {
  return String(value)
    .split('')
    .map((digit) => SUBSCRIPT_DIGITS[digit] ?? digit)
    .join('')
}

function significantDigits(value: number, digits: number): string {
  return value
    .toExponential(Math.max(0, digits - 1))
    .split('e')[0]
    .replace('.', '')
    .replace(/0+$/, '')
}

/**
 * CoinGecko-style compact micro-price representation.
 *
 * Example: 0.0000003617 -> 0.0₆3617. The subscript is the factual count
 * of leading zeroes after the decimal point. Values remain readable without
 * either rounding to zero or expanding every market card to eighteen digits.
 */
export function formatCompactPriceNumber(
  value?: number | null,
  options: { significantDigits?: number; unavailable?: string } = {},
): string {
  const unavailable = options.unavailable ?? '—'
  if (value == null || !Number.isFinite(value) || value <= 0) return unavailable

  const digits = Math.max(2, Math.min(8, options.significantDigits ?? 5))
  const exponent = Math.floor(Math.log10(value))

  // Use the compact zero counter from five decimal places onward. Prices such
  // as MARCO (~0.0003 USD) remain familiar fixed-point values.
  if (exponent <= -5) {
    const zeroCount = Math.min(17, Math.max(1, -exponent - 1))
    const significant = significantDigits(value, digits)
    if (!significant) return unavailable
    return `0.0${toSubscript(zeroCount)}${significant}`
  }

  if (value >= 1_000) {
    return value.toLocaleString('en-US', { maximumFractionDigits: 2 })
  }

  return value.toLocaleString('en-US', {
    useGrouping: false,
    maximumSignificantDigits: digits,
    maximumFractionDigits: 18,
  })
}

export function formatCompactPriceUsd(
  value?: number | null,
  options: { significantDigits?: number; unavailable?: string } = {},
): string {
  const formatted = formatCompactPriceNumber(value, options)
  return formatted === (options.unavailable ?? '—') ? formatted : `$${formatted}`
}

/** Full fixed-point value for accessible titles/tooltips; never scientific. */
export function formatFullPriceNumber(value?: number | null): string | undefined {
  if (value == null || !Number.isFinite(value) || value <= 0) return undefined
  const fixed = value.toFixed(18).replace(/0+$/, '').replace(/\.$/, '')
  return fixed && fixed !== '0' ? fixed : undefined
}
