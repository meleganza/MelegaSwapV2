import React from 'react'
import { SWRConfig } from 'swr'
import { cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { OhlcvCandle } from '../../types'
import { indexerCandlePayloadMatches, useIndexerCandles } from '../useIndexerCandles'

vi.mock('../fetchDurableIndexer', () => ({
  fetchIndexerCandles: vi.fn(),
}))

import { fetchIndexerCandles } from '../fetchDurableIndexer'

const fetchCandles = vi.mocked(fetchIndexerCandles)
const PAIR_A = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
const PAIR_B = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'

function candle(pair: string, interval: OhlcvCandle['interval'], bucket: number, close: number): OhlcvCandle {
  return {
    pairAddress: pair,
    interval,
    bucketTimestamp: bucket,
    open: close,
    high: close,
    low: close,
    close,
    baseVolume: 1,
    quoteVolume: 1,
    tradeCount: 1,
    startBlock: 1,
    endBlock: 2,
    lastUpdated: '2026-09-23T00:00:00.000Z',
  }
}

function payload(pair: string, interval: OhlcvCandle['interval'], close: number) {
  return {
    status: 'ready',
    pairAddress: pair,
    interval,
    candles: [candle(pair, interval, 1, close - 0.1), candle(pair, interval, 2, close)],
  }
}

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig value={{ provider: () => new Map(), keepPreviousData: true, dedupingInterval: 0 }}>
      {children}
    </SWRConfig>
  )
}

afterEach(() => {
  cleanup()
  fetchCandles.mockReset()
})

describe('indexer candle identity', () => {
  it('rejects a payload whose pair or interval is not the request', () => {
    const current = payload(PAIR_A, '1H', 1.5)
    expect(indexerCandlePayloadMatches(current, PAIR_A, '1H')).toBe(true)
    expect(indexerCandlePayloadMatches(current, PAIR_B, '1H')).toBe(false)
    expect(indexerCandlePayloadMatches(current, PAIR_A, '4H')).toBe(false)
    expect(
      indexerCandlePayloadMatches(
        { ...current, interval: '4H', candles: current.candles },
        PAIR_A,
        '4H',
      ),
    ).toBe(false)
  })

  it('does not expose pair A candles while pair B is still loading', async () => {
    let releaseB: () => void = () => {}
    fetchCandles.mockImplementation(async (pair, interval) => {
      if (pair === PAIR_B) {
        await new Promise<void>((resolve) => {
          releaseB = resolve
        })
      }
      return payload(pair, interval, pair === PAIR_A ? 1.5 : 9.9)
    })

    const { result, rerender, unmount } = renderHook(({ pair }) => useIndexerCandles(pair, '1H', true), {
      wrapper,
      initialProps: { pair: PAIR_A },
    })

    await waitFor(() => expect(result.current.chartEntries.at(-1)?.close).toBe(1.5))

    rerender({ pair: PAIR_B })

    expect(result.current.chartEntries.map((entry) => entry.close)).not.toContain(1.5)
    expect(result.current.status).toBe('loading')
    await waitFor(() => expect(fetchCandles).toHaveBeenCalledWith(PAIR_B, '1H'))

    releaseB()
    await waitFor(() => expect(result.current.chartEntries.at(-1)?.close).toBe(9.9))
    unmount()
  })

  it('does not keep the previous timeframe close unless the response interval matches', async () => {
    let release4h: () => void = () => {}
    fetchCandles.mockImplementation(async (pair, interval) => {
      if (interval === '4H') {
        await new Promise<void>((resolve) => {
          release4h = resolve
        })
      }
      return payload(pair, interval, interval === '1H' ? 1.5 : 7.5)
    })

    const { result, rerender, unmount } = renderHook(
      ({ interval }: { interval: OhlcvCandle['interval'] }) => useIndexerCandles(PAIR_A, interval, true),
      { wrapper, initialProps: { interval: '1H' } },
    )

    await waitFor(() => expect(result.current.chartEntries.at(-1)?.close).toBe(1.5))
    rerender({ interval: '4H' })

    expect(result.current.chartEntries.map((entry) => entry.close)).not.toContain(1.5)
    expect(result.current.status).toBe('loading')
    await waitFor(() => expect(fetchCandles).toHaveBeenCalledWith(PAIR_A, '4H'))

    release4h()
    await waitFor(() => expect(result.current.chartEntries.at(-1)?.close).toBe(7.5))
    unmount()
  })
})
