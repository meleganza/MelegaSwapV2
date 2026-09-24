import React from 'react'
import { SWRConfig } from 'swr'
import { cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { PublicOhlcvTimeframe } from '../ohlcvTimeframe'
import { publicPairOhlcvMatchesRequest, usePairOhlcv } from '../usePairOhlcv'

const PAIR_A = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
const PAIR_B = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
const TOKEN = '0xcccccccccccccccccccccccccccccccccccccccc'

function response(pair: string, timeframe: string, close: number) {
  return {
    status: 'ready' as const,
    chainId: 56,
    pairAddress: pair,
    tokenAddress: TOKEN,
    timeframe,
    candles: [
      { timestamp: 1, open: close - 0.1, high: close, low: close - 0.1, close: close - 0.1, volumeUsd: 1 },
      { timestamp: 2, open: close, high: close, low: close, close, volumeUsd: 1 },
    ],
    volume24hUsd: 2,
    source: 'geckoterminal-public-ohlcv',
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
  vi.unstubAllGlobals()
})

describe('public pair OHLCV identity', () => {
  it('requires the response timeframe when candles are present', () => {
    const current = response(PAIR_A, '1h', 1.25)
    expect(publicPairOhlcvMatchesRequest(current, 56, PAIR_A, TOKEN, '1h')).toBe(true)
    expect(publicPairOhlcvMatchesRequest(current, 56, PAIR_A, TOKEN, '4h')).toBe(false)
    expect(publicPairOhlcvMatchesRequest(current, 56, PAIR_B, TOKEN, '1h')).toBe(false)
    expect(publicPairOhlcvMatchesRequest({ ...current, timeframe: undefined, candles: [] }, 56, PAIR_A, TOKEN, '4h')).toBe(
      true,
    )
  })

  it('does not expose pair A candles while pair B is loading under global keepPreviousData', async () => {
    let releaseB: () => void = () => {}
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        const parsed = new URL(url, 'http://localhost')
        const pair = parsed.searchParams.get('pairAddress')
        const timeframe = parsed.searchParams.get('timeframe') || '1h'
        if (pair === PAIR_B) {
          await new Promise<void>((resolve) => {
            releaseB = resolve
          })
        }
        return {
          ok: true,
          json: async () => response(pair || PAIR_A, timeframe, pair === PAIR_A ? 1.25 : 4.5),
        }
      }),
    )

    const { result, rerender, unmount } = renderHook(
      ({ pair }) => usePairOhlcv(56, pair, TOKEN, '1h'),
      { wrapper, initialProps: { pair: PAIR_A } },
    )

    await waitFor(() => expect(result.current.candles.at(-1)?.close).toBe(1.25))
    rerender({ pair: PAIR_B })

    expect(result.current.candles.map((candle) => candle.close)).not.toContain(1.25)
    expect(result.current.status).toBe('loading')
    await waitFor(() =>
      expect(vi.mocked(fetch).mock.calls.some(([url]) => String(url).includes(PAIR_B))).toBe(true),
    )

    releaseB()
    await waitFor(() => expect(result.current.candles.at(-1)?.close).toBe(4.5))
    unmount()
  })

  it('does not keep the previous timeframe close unless that response timeframe matches', async () => {
    let release4h: () => void = () => {}
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        const parsed = new URL(url, 'http://localhost')
        const timeframe = parsed.searchParams.get('timeframe') || '1h'
        if (timeframe === '4h') {
          await new Promise<void>((resolve) => {
            release4h = resolve
          })
        }
        return {
          ok: true,
          json: async () => response(PAIR_A, timeframe, timeframe === '1h' ? 1.25 : 7.5),
        }
      }),
    )

    const { result, rerender, unmount } = renderHook(
      ({ timeframe }: { timeframe: PublicOhlcvTimeframe }) => usePairOhlcv(56, PAIR_A, TOKEN, timeframe),
      { wrapper, initialProps: { timeframe: '1h' } },
    )

    await waitFor(() => expect(result.current.candles.at(-1)?.close).toBe(1.25))
    rerender({ timeframe: '4h' })

    expect(result.current.candles.map((candle) => candle.close)).not.toContain(1.25)
    expect(result.current.status).toBe('loading')
    await waitFor(() =>
      expect(vi.mocked(fetch).mock.calls.some(([url]) => String(url).includes('timeframe=4h'))).toBe(true),
    )

    release4h()
    await waitFor(() => expect(result.current.candles.at(-1)?.close).toBe(7.5))
    unmount()
  })
})
