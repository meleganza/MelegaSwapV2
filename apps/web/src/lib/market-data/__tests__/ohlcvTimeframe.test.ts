import { describe, expect, it } from 'vitest'
import { resolveOhlcvTimeframe } from '../ohlcvTimeframe'

describe('public OHLCV timeframe mapping', () => {
  it('maps minute buttons to factual minute candles', () => {
    expect(resolveOhlcvTimeframe('1m')).toEqual({ path: 'minute', aggregate: '1', limit: '60' })
    expect(resolveOhlcvTimeframe('5m')).toEqual({ path: 'minute', aggregate: '5', limit: '60' })
    expect(resolveOhlcvTimeframe('15m')).toEqual({ path: 'minute', aggregate: '15', limit: '60' })
  })

  it('maps longer windows without relabelling hourly data', () => {
    expect(resolveOhlcvTimeframe('1h')).toEqual({ path: 'hour', aggregate: '1', limit: '24' })
    expect(resolveOhlcvTimeframe('4h')).toEqual({ path: 'hour', aggregate: '4', limit: '60' })
    expect(resolveOhlcvTimeframe('1d')).toEqual({ path: 'day', aggregate: '1', limit: '60' })
  })

  it('fails closed for unsupported labels', () => {
    expect(resolveOhlcvTimeframe('2h')).toBeNull()
  })
})
