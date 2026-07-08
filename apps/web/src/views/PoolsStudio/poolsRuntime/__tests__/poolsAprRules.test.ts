import { formatDisplayAprText, isForbiddenAprDisplay, normalizeAprForDisplay } from '../poolsAprRules'

describe('poolsAprRules R726A runtime APR', () => {
  it('displays recoverable runtime APR without visual-band estimation', () => {
    const result = normalizeAprForDisplay(85, 'Flexible')
    expect(result.normalized).toBe(50)
    expect(result.display).toBe('50.00%')
  })

  it('preserves official pool runtime APR within display cap', () => {
    const result = normalizeAprForDisplay(9.5, 'Official', 'Official')
    expect(result.normalized).toBe(9.5)
    expect(result.display).toBe('9.50%')
  })

  it('returns undefined display when runtime APR is missing', () => {
    expect(formatDisplayAprText(0, 'Flexible', true).display).toBeUndefined()
    expect(formatDisplayAprText(0, 'Flexible', true).reason).toBe('INVALID_RAW_APR')
  })

  it('never returns forbidden APR displays for live pools', () => {
    expect(isForbiddenAprDisplay('0%')).toBe(true)
    expect(isForbiddenAprDisplay('Calculating...')).toBe(true)
    expect(isForbiddenAprDisplay('12.00%')).toBe(false)
  })

  it('caps absurd APR values as forbidden', () => {
    expect(isForbiddenAprDisplay('130000000000%')).toBe(true)
    expect(isForbiddenAprDisplay('55.00%')).toBe(true)
  })
})
