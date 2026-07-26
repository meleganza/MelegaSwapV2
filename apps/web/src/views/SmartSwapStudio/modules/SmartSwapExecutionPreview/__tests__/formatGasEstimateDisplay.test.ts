import { describe, expect, it } from 'vitest'
import { formatGasEstimateDisplay } from '../formatGasEstimateDisplay'

describe('formatGasEstimateDisplay', () => {
  it('shows available gas without error tone', () => {
    const r = formatGasEstimateDisplay({ availability: 'available', units: 120000, amountLabel: '0.0004 BNB' })
    expect(r.state).toBe('available')
    expect(r.title).toBe('Estimated gas')
    expect(r.detail).toContain('0.0004')
    expect(r.tone).toBe('ok')
  })

  it('shows estimating state', () => {
    const r = formatGasEstimateDisplay({ availability: 'unavailable', units: null, estimating: true })
    expect(r.state).toBe('estimating')
    expect(r.title).toMatch(/Estimating gas/)
  })

  it('softens unavailable — not a hard error', () => {
    const r = formatGasEstimateDisplay({ availability: 'unavailable', units: null })
    expect(r.state).toBe('unavailable')
    expect(r.tone).toBe('muted')
    expect(r.detail).toMatch(/simulated by wallet/i)
    expect(r.title).not.toMatch(/error/i)
  })
})
