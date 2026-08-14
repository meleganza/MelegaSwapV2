import {
  evaluateTopPoolsAprEligibility,
  formatDisplayAprText,
  isForbiddenAprDisplay,
  normalizeAprForDisplay,
} from '../poolsAprRules'

describe('poolsAprRules — factual APR (no 50% hard cap)', () => {
  it('preserves factual APR above the former 50% display cap', () => {
    const result = normalizeAprForDisplay(85, 'Flexible')
    expect(result.normalized).toBe(85)
    expect(result.display).toBe('85.00%')
    expect(result.quality).toBe('factual')
  })

  it('preserves official pool runtime APR', () => {
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
    expect(isForbiddenAprDisplay('55.00%')).toBe(false)
    expect(isForbiddenAprDisplay('9474.57%')).toBe(false)
  })

  it('rejects non-numeric / zero APR strings', () => {
    expect(isForbiddenAprDisplay('130000000000%')).toBe(false) // factual extreme still parseable
    expect(isForbiddenAprDisplay('NaN')).toBe(true)
  })

  it('excludes near-zero TVL from Top Pools ranking', () => {
    const e = evaluateTopPoolsAprEligibility({
      rewarding: true,
      emissionActive: true,
      apr: 9474.57,
      tvlUsd: 0.5,
      rewardPriceUsd: 1,
      stakePriceUsd: 1,
    })
    expect(e.eligible).toBe(false)
    expect(e.reason).toBe('NEAR_ZERO_TVL')
  })

  it('admits active priced pools with trusted TVL', () => {
    const e = evaluateTopPoolsAprEligibility({
      rewarding: true,
      emissionActive: true,
      apr: 124.87,
      tvlUsd: 2500,
      rewardPriceUsd: 0.5,
      stakePriceUsd: 1,
    })
    expect(e.eligible).toBe(true)
  })
})
