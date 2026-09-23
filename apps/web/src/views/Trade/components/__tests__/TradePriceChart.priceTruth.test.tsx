import React from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { RUNTIME_LOADING_LABEL, RUNTIME_UNAVAILABLE_LABEL } from 'lib/runtime-truth'

type IndexerState = {
  chartEntries: Array<{ time: number; open: number; high: number; low: number; close: number }>
  status: string
}

type PublicState = {
  candles: Array<{ timestamp: number; open: number; high: number; low: number; close: number; volumeUsd: number }>
  status: string
  volume24hUsd: number | null
  source: string | null
}

const emptyIndexer = (): IndexerState => ({ chartEntries: [], status: 'unavailable' })
const emptyPublic = (): PublicState => ({ candles: [], status: 'unavailable', volume24hUsd: null, source: null })

const hooks: {
  indexerByInterval: Record<string, IndexerState>
  publicByTimeframe: Record<string, PublicState>
} = {
  indexerByInterval: {},
  publicByTimeframe: {},
}

vi.mock('hooks/useActiveChainId', () => ({
  useActiveChainId: () => ({ chainId: 56 }),
}))

vi.mock('lib/bsc-indexer/client/useIndexerCandles', () => ({
  useIndexerCandles: (_pair?: string, interval?: string) => {
    const state = (globalThis as unknown as { __tradeChartPriceHooks?: typeof hooks }).__tradeChartPriceHooks
    return state?.indexerByInterval[interval ?? '1H'] ?? { chartEntries: [], status: 'unavailable' }
  },
}))

vi.mock('lib/market-data/usePairOhlcv', () => ({
  usePairOhlcv: (_chain?: number, _pair?: string | null, _token?: string | null, timeframe?: string) => {
    const state = (globalThis as unknown as { __tradeChartPriceHooks?: typeof hooks }).__tradeChartPriceHooks
    return (
      state?.publicByTimeframe[timeframe ?? '1h'] ?? {
        candles: [],
        status: 'unavailable',
        volume24hUsd: null,
        source: null,
      }
    )
  },
  default: (_chain?: number, _pair?: string | null, _token?: string | null, timeframe?: string) => {
    const state = (globalThis as unknown as { __tradeChartPriceHooks?: typeof hooks }).__tradeChartPriceHooks
    return (
      state?.publicByTimeframe[timeframe ?? '1h'] ?? {
        candles: [],
        status: 'unavailable',
        volume24hUsd: null,
        source: null,
      }
    )
  },
}))

;(globalThis as unknown as { __tradeChartPriceHooks?: typeof hooks }).__tradeChartPriceHooks = hooks

import TradePriceChart from '../TradePriceChart'

const PAIR_A = '0x1111111111111111111111111111111111111111'
const PAIR_B = '0x2222222222222222222222222222222222222222'

function publicCandle(close: number, timestamp: number) {
  return { timestamp, open: close, high: close, low: close, close, volumeUsd: 1 }
}

function indexerCandle(close: number, time: number) {
  return { time, open: close, high: close, low: close, close }
}

function resetHooks() {
  hooks.indexerByInterval = {}
  hooks.publicByTimeframe = {}
}

function renderChart(props: Partial<React.ComponentProps<typeof TradePriceChart>> = {}) {
  return render(
    <TradePriceChart
      inputSymbol="MARCO"
      outputSymbol="AARON"
      inputCurrencyId="0x963556de0eb8138E97A85F0A86eE0acD159D210b"
      outputCurrencyId="0x31B5BE085aF875B675392f5B37a1d0B8c3860222"
      pairAddress={PAIR_A}
      {...props}
    />,
  )
}

afterEach(() => {
  cleanup()
  resetHooks()
})

describe('TradePriceChart price truth', () => {
  it('shows the latest public close and renders the public series when priceUsd is missing', () => {
    hooks.indexerByInterval['1H'] = emptyIndexer()
    hooks.publicByTimeframe['1h'] = {
      candles: [publicCandle(1.1, 1), publicCandle(1.25, 2)],
      status: 'ready',
      volume24hUsd: 2,
      source: 'geckoterminal-public-ohlcv',
    }

    renderChart()

    expect(screen.getByText('Market candles · Public pair OHLCV')).toBeTruthy()
    expect(screen.getByLabelText('Price USD 1.25')).toHaveTextContent('1.25')
    expect(screen.getByText('USD $1.25')).toBeTruthy()
    expect(screen.queryByText(RUNTIME_UNAVAILABLE_LABEL)).toBeNull()
    expect(screen.queryByText(/24H/)).toBeNull()
  })

  it('shows the latest durable close when indexer candles are the rendered series', () => {
    hooks.indexerByInterval['1H'] = {
      chartEntries: [indexerCandle(2.5, 1), indexerCandle(3.75, 2)],
      status: 'ready',
    }
    hooks.publicByTimeframe['1h'] = {
      candles: [publicCandle(9.1, 1), publicCandle(9.9, 2)],
      status: 'ready',
      volume24hUsd: 2,
      source: 'geckoterminal-public-ohlcv',
    }

    renderChart()

    expect(screen.getByText('Market candles · Melega durable indexer')).toBeTruthy()
    expect(screen.getByLabelText('Price USD 3.75')).toHaveTextContent('3.75')
    expect(screen.queryByText('9.9')).toBeNull()
    expect(screen.queryByText(RUNTIME_UNAVAILABLE_LABEL)).toBeNull()
  })

  it('keeps explicit priceUsd authoritative when candles are also valid', () => {
    hooks.indexerByInterval['1H'] = emptyIndexer()
    hooks.publicByTimeframe['1h'] = {
      candles: [publicCandle(1.1, 1), publicCandle(1.25, 2)],
      status: 'ready',
      volume24hUsd: 2,
      source: 'geckoterminal-public-ohlcv',
    }

    renderChart({ priceUsd: 8.5, change24h: 1.2 })

    expect(screen.getByText('Market candles · Public pair OHLCV')).toBeTruthy()
    expect(screen.getByLabelText('Price USD 8.5')).toHaveTextContent('8.5')
    expect(screen.queryByLabelText('Price USD 1.25')).toBeNull()
    expect(screen.getByText('+1.20% (24H)')).toBeTruthy()
  })

  it('shows Unavailable when the current identity has no price and no valid candles', () => {
    hooks.indexerByInterval['1H'] = emptyIndexer()
    hooks.publicByTimeframe['1h'] = emptyPublic()

    renderChart()

    expect(screen.getByText(RUNTIME_UNAVAILABLE_LABEL)).toBeTruthy()
    expect(screen.queryByText(/Market candles/)).toBeNull()
    expect(screen.queryByText(RUNTIME_LOADING_LABEL)).toBeNull()
  })

  it('shows Loading for the current identity and does not keep a prior price', () => {
    hooks.indexerByInterval['1H'] = emptyIndexer()
    hooks.publicByTimeframe['1h'] = {
      candles: [publicCandle(1.1, 1), publicCandle(1.25, 2)],
      status: 'ready',
      volume24hUsd: 2,
      source: 'geckoterminal-public-ohlcv',
    }
    const view = renderChart()
    expect(screen.getByLabelText('Price USD 1.25')).toBeTruthy()

    hooks.indexerByInterval['1H'] = { chartEntries: [], status: 'loading' }
    hooks.publicByTimeframe['1h'] = { ...emptyPublic(), status: 'loading' }
    view.rerender(
      <TradePriceChart
        inputSymbol="MARCO"
        outputSymbol="AARON"
        inputCurrencyId="0x963556de0eb8138E97A85F0A86eE0acD159D210b"
        outputCurrencyId="0x31B5BE085aF875B675392f5B37a1d0B8c3860222"
        pairAddress={PAIR_A}
      />,
    )

    expect(screen.getByText(RUNTIME_LOADING_LABEL)).toBeTruthy()
    expect(screen.queryByText('1.25')).toBeNull()
    expect(screen.queryByText(RUNTIME_UNAVAILABLE_LABEL)).toBeNull()
    expect(screen.queryByText(/Market candles/)).toBeNull()
  })

  it('does not show pair A price or series after switching to pair B before B arrives', () => {
    hooks.indexerByInterval['1H'] = emptyIndexer()
    hooks.publicByTimeframe['1h'] = {
      candles: [publicCandle(1.1, 1), publicCandle(1.25, 2)],
      status: 'ready',
      volume24hUsd: 2,
      source: 'geckoterminal-public-ohlcv',
    }
    const view = renderChart({ pairAddress: PAIR_A })
    expect(screen.getByLabelText('Price USD 1.25')).toBeTruthy()

    hooks.indexerByInterval['1H'] = { chartEntries: [], status: 'loading' }
    hooks.publicByTimeframe['1h'] = { ...emptyPublic(), status: 'loading' }
    view.rerender(
      <TradePriceChart
        inputSymbol="TOKEN"
        outputSymbol="WBNB"
        inputCurrencyId="0x3333333333333333333333333333333333333333"
        outputCurrencyId="0x4444444444444444444444444444444444444444"
        pairAddress={PAIR_B}
      />,
    )

    expect(screen.getByText('TOKEN / WBNB')).toBeTruthy()
    expect(screen.getByText(RUNTIME_LOADING_LABEL)).toBeTruthy()
    expect(screen.queryByText('1.25')).toBeNull()
    expect(screen.queryByText(/Market candles/)).toBeNull()
  })

  it('does not use the previous timeframe close unless the new timeframe series is rendered', () => {
    hooks.indexerByInterval['1H'] = emptyIndexer()
    hooks.publicByTimeframe['1h'] = {
      candles: [publicCandle(1.1, 1), publicCandle(1.25, 2)],
      status: 'ready',
      volume24hUsd: 2,
      source: 'geckoterminal-public-ohlcv',
    }
    hooks.indexerByInterval['4H'] = { chartEntries: [], status: 'loading' }
    hooks.publicByTimeframe['4h'] = { ...emptyPublic(), status: 'loading' }

    renderChart()
    expect(screen.getByLabelText('Price USD 1.25')).toBeTruthy()

    fireEvent.click(screen.getByRole('tab', { name: '4H' }))

    expect(screen.getByText(RUNTIME_LOADING_LABEL)).toBeTruthy()
    expect(screen.queryByText('1.25')).toBeNull()
    expect(screen.queryByText(/Market candles/)).toBeNull()

    hooks.publicByTimeframe['4h'] = {
      candles: [publicCandle(7.1, 10), publicCandle(7.5, 11)],
      status: 'ready',
      volume24hUsd: 4,
      source: 'geckoterminal-public-ohlcv',
    }
    hooks.indexerByInterval['4H'] = emptyIndexer()
    fireEvent.click(screen.getByRole('tab', { name: '1H' }))
    fireEvent.click(screen.getByRole('tab', { name: '4H' }))

    expect(screen.getByText('Market candles · Public pair OHLCV')).toBeTruthy()
    expect(screen.getByLabelText('Price USD 7.5')).toHaveTextContent('7.5')
    expect(screen.queryByText('1.25')).toBeNull()
  })

  it('never displays an invalid candle close', () => {
    hooks.indexerByInterval['1H'] = {
      chartEntries: [
        indexerCandle(Number.NaN, 1),
        indexerCandle(Number.POSITIVE_INFINITY, 2),
        indexerCandle(0, 3),
        indexerCandle(-4, 4),
        indexerCandle(4, 5),
        indexerCandle(6, 6),
      ],
      status: 'ready',
    }
    hooks.publicByTimeframe['1h'] = {
      candles: [publicCandle(99, 1), publicCandle(98, 2)],
      status: 'ready',
      volume24hUsd: 1,
      source: 'geckoterminal-public-ohlcv',
    }

    renderChart({ priceUsd: Number.NaN })

    expect(screen.getByText('Market candles · Melega durable indexer')).toBeTruthy()
    expect(screen.getByLabelText('Price USD 6')).toHaveTextContent('6')
    expect(screen.queryByText('99')).toBeNull()
    expect(screen.queryByText(RUNTIME_UNAVAILABLE_LABEL)).toBeNull()
  })
})
