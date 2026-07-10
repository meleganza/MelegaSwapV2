import { describe, expect, it } from 'vitest'
import { resolveHolderMetric } from '../resolveHolderMetric'

describe('resolveHolderMetric', () => {
  it('formats ready holder counts without em dash fallback', () => {
    const metric = resolveHolderMetric({
      status: 'ready',
      count: 4200,
      source: 'bscscan',
      checkedAt: '2026-06-26T00:00:00.000Z',
    })
    expect(metric.display).toBe('4.2K')
    expect(metric.reasonCode).toBeUndefined()
  })

  it('returns explicit diagnostics when explorer source is unavailable', () => {
    const metric = resolveHolderMetric({
      status: 'unavailable',
      reason: 'Source not configured',
      source: 'unavailable',
      diagnostic: 'Set NEXT_PUBLIC_BSCSCAN_API_KEY to recover holder count from BscScan',
      checkedAt: '2026-06-26T00:00:00.000Z',
    })
    expect(metric.display).toBe('Unavailable')
    expect(metric.display).not.toBe('—')
    expect(metric.reason).toBe('Source not configured')
    expect(metric.reasonCode).toBe('EXPLORER_SOURCE_MISSING')
  })

  it('shows loading label while holder count is loading', () => {
    const metric = resolveHolderMetric(undefined, true)
    expect(metric.display).toBe('Loading')
    expect(metric.display).not.toBe('—')
  })

  it('shows unavailable when holder result is absent and not loading', () => {
    const metric = resolveHolderMetric(undefined)
    expect(metric.display).toBe('Unavailable')
    expect(metric.reasonCode).toBe('EXPLORER_SOURCE_MISSING')
  })
})
