import { formatDisplayAprText, getAprRangeForVisual, isForbiddenAprDisplay, normalizeAprForDisplay } from '../poolsAprRules'

describe('poolsAprRules R703D', () => {
  it('normalizes flexible pool APR into 20–30% range', () => {
    const result = normalizeAprForDisplay(85, 'Flexible')
    expect(result.normalized).toBeGreaterThanOrEqual(20)
    expect(result.normalized).toBeLessThanOrEqual(30)
    expect(result.display).toBe('30.00%')
  })

  it('normalizes official pool APR into 8–12% range', () => {
    const result = normalizeAprForDisplay(120, 'Official', 'Official')
    expect(result.normalized).toBeGreaterThanOrEqual(8)
    expect(result.normalized).toBeLessThanOrEqual(12)
    expect(result.display).toBe('12.00%')
  })

  it('normalizes fixed 30-day pool APR into 30–40% range', () => {
    const { min, max } = getAprRangeForVisual('30 Days')
    const result = normalizeAprForDisplay(200, '30 Days')
    expect(result.normalized).toBeGreaterThanOrEqual(min)
    expect(result.normalized).toBeLessThanOrEqual(max)
  })

  it('never returns forbidden APR displays for live pools', () => {
    expect(formatDisplayAprText(0, 'Flexible', true).display).toBe('25.00%')
    expect(isForbiddenAprDisplay('0%')).toBe(true)
    expect(isForbiddenAprDisplay('Calculating...')).toBe(true)
    expect(isForbiddenAprDisplay('12.00%')).toBe(false)
  })

  it('caps absurd APR values as forbidden', () => {
    expect(isForbiddenAprDisplay('130000000000%')).toBe(true)
    expect(isForbiddenAprDisplay('55.00%')).toBe(true)
  })
})
