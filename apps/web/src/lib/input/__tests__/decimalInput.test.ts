import { describe, expect, it } from 'vitest'
import { parseDecimalInput, sanitizeDecimalInput } from '../decimalInput'

describe('sanitizeDecimalInput', () => {
  it('keeps editable intermediate states', () => {
    expect(sanitizeDecimalInput('')).toBe('')
    expect(sanitizeDecimalInput('.')).toBe('.')
    expect(sanitizeDecimalInput('0.')).toBe('0.')
    expect(sanitizeDecimalInput('1.')).toBe('1.')
    expect(sanitizeDecimalInput('1.0')).toBe('1.0')
    expect(sanitizeDecimalInput('0.0001')).toBe('0.0001')
  })

  it('accepts normal decimals and tiny fractions', () => {
    expect(sanitizeDecimalInput('1.2')).toBe('1.2')
    expect(sanitizeDecimalInput('0.000001')).toBe('0.000001')
  })

  it('collapses multiple dots and strips invalid chars', () => {
    expect(sanitizeDecimalInput('1.2.3')).toBe('1.23')
    expect(sanitizeDecimalInput('12a.3b')).toBe('12.3')
    expect(sanitizeDecimalInput('abc')).toBe('')
    expect(sanitizeDecimalInput('1,5')).toBe('1.5')
  })

  it('honors maxDecimals', () => {
    expect(sanitizeDecimalInput('1.234567', 4)).toBe('1.2345')
    expect(sanitizeDecimalInput('0.00000189', 6)).toBe('0.000001')
  })

  it('prefixes fractional-only input with a leading zero', () => {
    expect(sanitizeDecimalInput('.5')).toBe('0.5')
  })
})

describe('parseDecimalInput', () => {
  it('returns null for incomplete intermediate states', () => {
    expect(parseDecimalInput('')).toBeNull()
    expect(parseDecimalInput('.')).toBeNull()
    expect(parseDecimalInput('1.')).toBeNull()
    expect(parseDecimalInput('0.')).toBeNull()
  })

  it('parses complete numbers', () => {
    expect(parseDecimalInput('1.2')).toBe(1.2)
    expect(parseDecimalInput('0.000001')).toBe(0.000001)
    expect(parseDecimalInput('0')).toBe(0)
  })
})
