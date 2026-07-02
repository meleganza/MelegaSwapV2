import { describe, expect, it } from 'vitest'
import { formatCompactDisplay, formatCompactMagnitude, formatCompactNumber } from '../utils/formatCompactNumber'

describe('formatCompactNumber', () => {
  it('formats canonical magnitudes', () => {
    expect(formatCompactMagnitude(842)).toBe('842')
    expect(formatCompactMagnitude(8420)).toBe('8.42K')
    expect(formatCompactMagnitude(84200)).toBe('84.2K')
    expect(formatCompactMagnitude(842000)).toBe('842K')
    expect(formatCompactMagnitude(8420000)).toBe('8.42M')
    expect(formatCompactMagnitude(84200000)).toBe('84.2M')
    expect(formatCompactMagnitude(8420000000)).toBe('8.42B')
  })

  it('formats with prefix and suffix', () => {
    expect(formatCompactNumber(24560000, { prefix: '$' })).toBe('$24.56M')
    expect(formatCompactNumber(184200, { suffix: ' MARCO' })).toBe('184.2K MARCO')
  })

  it('normalizes comma-separated display values', () => {
    expect(formatCompactDisplay('184,200')).toBe('184.2K')
    expect(formatCompactDisplay('18,420')).toBe('18.42K')
    expect(formatCompactDisplay('184,200 MARCO')).toBe('184.2K MARCO')
    expect(formatCompactDisplay('$24.56M')).toBe('$24.56M')
  })
})
