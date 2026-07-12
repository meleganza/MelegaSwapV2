import { describe, expect, it } from 'vitest'
import { reconcileTradeSurface } from 'lib/data-truth/tradeReconciliation'

const baseCandle = {
  pairAddress: '0x7286c16c3c05d4c17b689be7948ec4fa4e861d1e',
  interval: '1H' as const,
  open: 1,
  high: 1,
  low: 1,
  close: 1,
  quoteVolume: 0.1,
  tradeCount: 1,
}

describe('R786 G2 trade reconciliation', () => {
  it('fails when volume without events', () => {
    const result = reconcileTradeSurface({
      tradeCount24h: 0,
      volume24h: 12,
      swapEventCount24h: 0,
      recentSwaps: [],
      candles: [],
      reserveLiquidityUsd: 1000,
      liquidityDisplayed: true,
    })
    expect(result.status).toBe('inconsistent')
  })

  it('fails when events without candles', () => {
    const result = reconcileTradeSurface({
      tradeCount24h: 3,
      volume24h: 5,
      swapEventCount24h: 3,
      recentSwaps: [{ id: '1' } as never],
      candles: [],
      reserveLiquidityUsd: 1000,
      liquidityDisplayed: true,
    })
    expect(result.status).toBe('inconsistent')
  })

  it('fails when candles without Recent Swaps', () => {
    const result = reconcileTradeSurface({
      tradeCount24h: 2,
      volume24h: 1,
      swapEventCount24h: 2,
      recentSwaps: [],
      candles: [{ ...baseCandle, bucketTimestamp: Math.floor(Date.now() / 1000) }],
      reserveLiquidityUsd: 1000,
      liquidityDisplayed: true,
    })
    expect(result.status).toBe('inconsistent')
  })

  it('passes fully reconciled state', () => {
    const now = Math.floor(Date.now() / 1000)
    const result = reconcileTradeSurface({
      tradeCount24h: 2,
      volume24h: 1.5,
      swapEventCount24h: 2,
      recentSwaps: [{ id: 'a' } as never, { id: 'b' } as never],
      candles: [
        { ...baseCandle, bucketTimestamp: now - 7200 },
        { ...baseCandle, bucketTimestamp: now - 3600 },
        { ...baseCandle, bucketTimestamp: now },
      ],
      reserveLiquidityUsd: 2500,
      liquidityDisplayed: true,
      indexerPhase: 'incremental',
      indexerLag: 12,
    })
    expect(result.status).toBe('ready')
  })

  it('reports insufficient history for sparse candles', () => {
    const result = reconcileTradeSurface({
      tradeCount24h: 0,
      volume24h: 0,
      swapEventCount24h: 0,
      recentSwaps: [],
      candles: [{ ...baseCandle, bucketTimestamp: Math.floor(Date.now() / 1000) }],
      reserveLiquidityUsd: 1000,
      liquidityDisplayed: true,
    })
    expect(result.status).toBe('insufficient_history')
  })
})
