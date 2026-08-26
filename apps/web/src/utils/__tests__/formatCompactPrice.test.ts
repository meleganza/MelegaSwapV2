import { describe, expect, it } from 'vitest'
import { formatCompactPriceNumber, formatCompactPriceUsd, formatFullPriceNumber } from '../formatCompactPrice'

describe('compact micro-price formatting', () => {
  it('uses a factual subscript zero count and preserves significant digits', () => {
    expect(formatCompactPriceUsd(0.000000699751782187235)).toBe('$0.0₆699752')
    expect(formatCompactPriceUsd(0.000001)).toBe('$0.0₅1')
    expect(formatCompactPriceUsd(0.000000025899)).toBe('$0.0₇25899')
  })

  it('keeps ordinary small prices readable without compact notation', () => {
    expect(formatCompactPriceUsd(0.0003173)).toBe('$0.0003173')
  })

  it('provides a non-scientific full precision value', () => {
    expect(formatFullPriceNumber(0.000000699751782187235)).toBe('0.00000069975178218723')
    expect(formatCompactPriceNumber(1e-18)).toBe('0.0₁₇1')
  })

  it('fails closed for missing, zero and invalid prices', () => {
    expect(formatCompactPriceUsd(undefined)).toBe('—')
    expect(formatCompactPriceUsd(0)).toBe('—')
    expect(formatCompactPriceUsd(Number.NaN)).toBe('—')
  })
})
