import { describe, expect, it } from 'vitest'
import { resolveHolderMachinePayload } from '../resolveHolderMachinePayload'

describe('resolveHolderMachinePayload', () => {
  it('returns configured when BscScan returns a count', () => {
    const payload = resolveHolderMachinePayload({
      status: 'ready',
      count: 1000,
      source: 'bscscan',
      checkedAt: '2026-06-26T00:00:00.000Z',
    })
    expect(payload).toEqual({ holder_source: 'bscscan', holder_status: 'configured' })
  })

  it('returns not_configured with deployment instruction when API key is missing', () => {
    const prev = process.env.NEXT_PUBLIC_BSCSCAN_API_KEY
    delete process.env.NEXT_PUBLIC_BSCSCAN_API_KEY
    try {
      const payload = resolveHolderMachinePayload({
        status: 'unavailable',
        reason: 'Source not configured',
        source: 'unavailable',
        diagnostic: 'Set NEXT_PUBLIC_BSCSCAN_API_KEY',
        checkedAt: '2026-06-26T00:00:00.000Z',
      })
      expect(payload.holder_source).toBe('bscscan')
      expect(payload.holder_status).toBe('not_configured')
      expect(payload.holder_reason).toContain('NEXT_PUBLIC_BSCSCAN_API_KEY')
    } finally {
      if (prev !== undefined) process.env.NEXT_PUBLIC_BSCSCAN_API_KEY = prev
    }
  })
})
