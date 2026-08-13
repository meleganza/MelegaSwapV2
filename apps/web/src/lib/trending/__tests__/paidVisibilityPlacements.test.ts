import { describe, expect, it } from 'vitest'
import {
  formatPaidPlacementRemaining,
  mergeTickerWithPaidPlacements,
  tickerItemIsEligible,
} from '../paidTickerPlacements'

describe('paid visibility ticker placements', () => {
  const now = Date.parse('2026-08-11T10:00:00.000Z')

  it('formats the purchased residual window as minutes or hours', () => {
    expect(formatPaidPlacementRemaining('2026-08-11T10:58:00.000Z', now)).toBe('58m')
    expect(formatPaidPlacementRemaining('2026-08-11T11:31:00.000Z', now)).toBe('2h')
    expect(formatPaidPlacementRemaining('2026-08-11T09:59:00.000Z', now)).toBeNull()
  })

  it('injects only active Boosts with rocket, disclosure, and countdown', () => {
    const items = mergeTickerWithPaidPlacements({
      organic: [],
      nowMs: now,
      boosted: [
        {
          id: 'active',
          kind: 'boosted',
          symbol: 'MARCO',
          chainId: 56,
          address: '0x1111111111111111111111111111111111111111',
          startsAt: '2026-08-11T09:00:00.000Z',
          endsAt: '2026-08-11T10:58:00.000Z',
        },
        {
          id: 'expired',
          kind: 'boosted',
          symbol: 'OLD',
          chainId: 56,
          address: null,
          endsAt: '2026-08-11T09:00:00.000Z',
        },
      ],
    })
    expect(items).toHaveLength(1)
    expect(items[0]).toMatchObject({ primary: '🚀 MARCO', secondary: 'Boosted', accent: '58m' })
    expect(tickerItemIsEligible(items[0])).toBe(true)
  })
})
