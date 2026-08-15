import { describe, expect, it } from 'vitest'
import { formatCompactPriceNumber, formatCompactPriceUsd, formatFullPriceNumber } from '../formatCompactPrice'

describe('CoinGecko-style compact price formatter', () => {
  it('keeps MARCO-scale prices as readable fixed point', () => {
    expect(formatCompactPriceUsd(0.0003173)).toBe('$0.0003173')
  })

  it('compresses leading zeroes without rounding a real price to zero', () => {
    expect(formatCompactPriceUsd(0.0000003617)).toBe('$0.0₆3617')
    expect(formatCompactPriceUsd(0.000000025899)).toBe('$0.0₇25899')
  })

  it('supports the visible zero count through eighteen decimal places', () => {
    expect(formatCompactPriceNumber(1e-18)).toBe('0.0₁₇1')
    expect(formatFullPriceNumber(1e-18)).toBe('0.000000000000000001')
  })

  it('returns an honest unavailable state for invalid values', () => {
    expect(formatCompactPriceUsd(undefined)).toBe('—')
    expect(formatCompactPriceUsd(0)).toBe('—')
  })
})
