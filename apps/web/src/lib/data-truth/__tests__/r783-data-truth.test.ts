import { describe, expect, it } from 'vitest'
import { computeValid24hPriceChange } from 'lib/data-truth/compute24hPriceChange'

describe('R783 data truth', () => {
  it('G-TRENDING-CHANGE-HISTORY: rejects 24H change without two candles in window', () => {
    const now = Math.floor(Date.now() / 1000)
    const candles = [
      { bucketTimestamp: now - 200_000, open: 1, close: 0.5, quoteVolume: 0, tradeCount: 0 },
      { bucketTimestamp: now - 1000, open: 0.5, close: 0.48, quoteVolume: 0, tradeCount: 0 },
    ]
    expect(computeValid24hPriceChange(candles as never)).toBeUndefined()
  })

  it('G-TRENDING-CHANGE-HISTORY: accepts valid 24H window', () => {
    const now = Math.floor(Date.now() / 1000)
    const candles = [
      { bucketTimestamp: now - 20_000, open: 1, close: 1.02, quoteVolume: 1, tradeCount: 1 },
      { bucketTimestamp: now - 10_000, open: 1.02, close: 1.05, quoteVolume: 1, tradeCount: 1 },
    ]
    const change = computeValid24hPriceChange(candles as never)
    expect(change?.pct).toBeGreaterThan(0)
  })
})
