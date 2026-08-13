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

  it('reports the keyless BNB holder index as the active source', () => {
    const payload = resolveHolderMachinePayload({
      status: 'ready',
      count: 3_991_907,
      source: 'binplorer',
      checkedAt: '2026-08-11T00:00:00.000Z',
    })
    expect(payload).toEqual({ holder_source: 'binplorer', holder_status: 'configured' })
  })

  it('keeps provider diagnostics when the holder index fails', () => {
    const payload = resolveHolderMachinePayload({
      status: 'unavailable',
      reason: 'Holder index request failed',
      source: 'unavailable',
      diagnostic: 'request timeout',
      checkedAt: '2026-08-11T00:00:00.000Z',
    })
    expect(payload.holder_source).toBe('binplorer')
    expect(payload.holder_status).toBe('error')
    expect(payload.holder_reason).toBe('request timeout')
  })
})
