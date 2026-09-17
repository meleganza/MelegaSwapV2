import { describe, expect, it } from 'vitest'
import { clearMCreditsReceiptsForTests, loadMCreditsReceipt, saveMCreditsReceipt } from '../receipt'

describe('M-Credits receipt restore', () => {
  it('restores a fulfilled receipt and ignores replay of a different payload', () => {
    clearMCreditsReceiptsForTests()
    saveMCreditsReceipt({
      orderId: 'mc_one',
      state: 'FULFILLED',
      serviceId: 'trend-boost',
      packageId: 'trend_24h',
      projectId: 'mm72',
    })
    expect(loadMCreditsReceipt({ projectId: 'mm72', serviceId: 'trend-boost', packageId: 'trend_24h' })?.orderId).toBe('mc_one')
    expect(loadMCreditsReceipt({ projectId: 'mm72', serviceId: 'featured', packageId: 'featured_24h' })).toBeNull()
    clearMCreditsReceiptsForTests()
  })
})
