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

/** CoinMarketCap/CoinGecko-style compact representation for micro-prices. */
export function formatCompactPriceNumber(
  value?: number | null,
  options: { significantDigits?: number; unavailable?: string } = {},
): string {
  const unavailable = options.unavailable ?? '—'
  if (value == null || !Number.isFinite(value) || value <= 0) return unavailable

  const digits = Math.max(2, Math.min(10, options.significantDigits ?? 6))
  const exponent = Math.floor(Math.log10(value))

  // 0.0000006997 => 0.0₆6997. The subscript is the exact number of
  // consecutive zeroes after the decimal point, not an approximation.
  if (exponent <= -5) {
    const zeroCount = Math.max(1, -exponent - 1)
    const significant = significantDigits(value, digits)
    return significant ? `0.0${toSubscript(zeroCount)}${significant}` : unavailable
  }

  if (value >= 1_000) {
    return value.toLocaleString('en-US', { maximumFractionDigits: 2 })
  }

  return value.toLocaleString('en-US', {
    useGrouping: false,
    maximumSignificantDigits: digits,
    maximumFractionDigits: 20,
  })
}

export function formatCompactPriceUsd(
  value?: number | null,
  options: { significantDigits?: number; unavailable?: string } = {},
): string {
  const unavailable = options.unavailable ?? '—'
  const formatted = formatCompactPriceNumber(value, options)
  return formatted === unavailable ? formatted : `$${formatted}`
}

/** Full fixed-point value for titles, assistive technology and copy/paste. */
export function formatFullPriceNumber(value?: number | null): string | undefined {
  if (value == null || !Number.isFinite(value) || value <= 0) return undefined
  const fixed = value.toFixed(20).replace(/0+$/, '').replace(/\.$/, '')
  return fixed && fixed !== '0' ? fixed : undefined
}
