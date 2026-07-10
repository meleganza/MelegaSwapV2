import { describe, expect, it } from 'vitest'
import { buildCandlesFromSwaps, swapPriceFromEvent } from '../indexer/candles'
import type { NormalizedIndexerEvent } from '../types'

const swap = (overrides: Partial<NormalizedIndexerEvent>): NormalizedIndexerEvent => ({
  chainId: 56,
  protocol: 'amm',
  eventType: 'Swap',
  contractAddress: '0xpair',
  pairAddress: '0xpair',
  token0: '0xt0',
  token1: '0xt1',
  amount0: '100',
  amount1: '200',
  txHash: '0xabc',
  logIndex: 0,
  blockNumber: 100,
  blockTimestamp: 3600,
  explorerUrl: 'https://bscscan.com/tx/0xabc',
  sourceStatus: 'incremental',
  ...overrides,
})

describe('buildCandlesFromSwaps', () => {
  it('aggregates OHLCV without NaN', () => {
    const candles = buildCandlesFromSwaps([swap({}), swap({ amount0: '50', amount1: '80', blockTimestamp: 3700 })], '0xpair', ['1H'])
    expect(candles.length).toBeGreaterThan(0)
    for (const c of candles) {
      expect(Number.isFinite(c.open)).toBe(true)
      expect(Number.isFinite(c.close)).toBe(true)
      expect(c.open).toBeGreaterThan(0)
    }
  })

  it('returns undefined price for zero amounts', () => {
    expect(swapPriceFromEvent(swap({ amount0: '0', amount1: '0' }))).toBeUndefined()
  })

  it('handles inverted token order via explicit amounts', () => {
    const price = swapPriceFromEvent(swap({ amount0: '200', amount1: '100' }))
    expect(price).toBeCloseTo(0.5)
  })
})
