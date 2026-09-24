import { describe, expect, it } from 'vitest'
import {
  latestFactualClose,
  resolveTradeHeaderPrice,
  selectTradeChartSeries,
} from '../tradeChartPrice'

const point = (value: number, time = 1) => ({ time, value })

describe('trade chart header price', () => {
  it('uses the latest public close when priceUsd is missing and the series renders', () => {
    const series = selectTradeChartSeries([], [point(1.1, 1), point(1.25, 2)])
    expect(series.source).toBe('public')
    expect(series.pairPrices).toHaveLength(2)
    const price = resolveTradeHeaderPrice({ priceUsd: undefined, pairPrices: series.pairPrices, chartRendersSeries: true })
    expect(price).toBe(1.25)
  })

  it('uses the latest durable indexer close, not the public close, when indexer candles render', () => {
    const series = selectTradeChartSeries(
      [point(2.5, 1), point(3.75, 2)],
      [point(9.1, 1), point(9.9, 2)],
    )
    expect(series.source).toBe('indexer')
    expect(resolveTradeHeaderPrice({ pairPrices: series.pairPrices, chartRendersSeries: true })).toBe(3.75)
  })

  it('keeps a positive finite priceUsd authoritative over candle closes', () => {
    const series = selectTradeChartSeries([], [point(1.25, 1), point(1.4, 2)])
    expect(resolveTradeHeaderPrice({ priceUsd: 8.5, pairPrices: series.pairPrices, chartRendersSeries: true })).toBe(8.5)
  })

  it('returns no price when priceUsd and factual candles are both missing', () => {
    const series = selectTradeChartSeries([], [])
    expect(series.source).toBe('none')
    expect(resolveTradeHeaderPrice({ priceUsd: undefined, pairPrices: series.pairPrices, chartRendersSeries: false })).toBeUndefined()
  })

  it('does not use a close while the current series is not rendered', () => {
    const series = selectTradeChartSeries([], [point(1.25, 1), point(4.5, 2)])
    expect(
      resolveTradeHeaderPrice({ priceUsd: undefined, pairPrices: series.pairPrices, chartRendersSeries: false }),
    ).toBeUndefined()
  })

  it('does not reuse another series close as the rendered fallback', () => {
    const previous = selectTradeChartSeries([], [point(1.25, 1), point(1.5, 2)])
    const current = selectTradeChartSeries([], [])
    expect(latestFactualClose(previous.pairPrices)).toBe(1.5)
    expect(resolveTradeHeaderPrice({ pairPrices: current.pairPrices, chartRendersSeries: false })).toBeUndefined()
    expect(resolveTradeHeaderPrice({ pairPrices: current.pairPrices, chartRendersSeries: true })).toBeUndefined()
  })

  it('uses only the series whose identity is the current timeframe', () => {
    const previousTimeframe = [point(1.25, 1), point(1.5, 2)]
    const currentTimeframe = [point(7.1, 10), point(7.5, 11)]
    const rendered = selectTradeChartSeries([], currentTimeframe)
    expect(resolveTradeHeaderPrice({ pairPrices: rendered.pairPrices, chartRendersSeries: true })).toBe(7.5)
    expect(resolveTradeHeaderPrice({ pairPrices: rendered.pairPrices, chartRendersSeries: true })).not.toBe(
      latestFactualClose(previousTimeframe),
    )
  })

  it('never uses NaN, Infinity, zero, or negative closes as the display price', () => {
    const series = selectTradeChartSeries(
      [point(Number.NaN, 1), point(Number.POSITIVE_INFINITY, 2), point(0, 3), point(-4, 4), point(4, 5), point(6, 6)],
      [point(99, 1), point(98, 2)],
    )
    expect(series.source).toBe('indexer')
    expect(series.pairPrices.map((row) => row.value)).toEqual([4, 6])
    expect(resolveTradeHeaderPrice({ pairPrices: series.pairPrices, chartRendersSeries: true })).toBe(6)
    expect(
      resolveTradeHeaderPrice({
        priceUsd: Number.NaN,
        pairPrices: series.pairPrices,
        chartRendersSeries: true,
      }),
    ).toBe(6)
    expect(
      resolveTradeHeaderPrice({ priceUsd: 0, pairPrices: series.pairPrices, chartRendersSeries: true }),
    ).toBe(6)
    expect(
      resolveTradeHeaderPrice({ priceUsd: -1, pairPrices: series.pairPrices, chartRendersSeries: true }),
    ).toBe(6)
    expect(
      resolveTradeHeaderPrice({
        priceUsd: Number.POSITIVE_INFINITY,
        pairPrices: series.pairPrices,
        chartRendersSeries: true,
      }),
    ).toBe(6)
  })

  it('does not treat a single factual candle as a rendered header price', () => {
    const series = selectTradeChartSeries([point(3.5, 1)], [point(8, 1), point(9, 2)])
    expect(series.source).toBe('indexer')
    expect(series.pairPrices).toHaveLength(1)
    expect(resolveTradeHeaderPrice({ pairPrices: series.pairPrices, chartRendersSeries: false })).toBeUndefined()
  })
})
