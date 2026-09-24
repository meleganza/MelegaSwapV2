/** Finite price strictly greater than zero. NaN, Infinity, 0, and negatives are not prices. */
export function isFactualPrice(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

export type ChartPricePoint = { time: string; value: number }

export function factualChartPoints(points: Array<{ time: string | number; value: number }>): ChartPricePoint[] {
  return points
    .filter((point) => isFactualPrice(point.value))
    .map((point) => ({ time: String(point.time), value: point.value }))
}

export type TradeChartSeriesSource = 'indexer' | 'public' | 'none'

/**
 * Series passed to TradeChartPanel.
 * Durable indexer closes win when any factual close exists, including a single candle.
 * Public pair OHLCV is used only when the indexer series has no factual close.
 */
export function selectTradeChartSeries(
  indexerPoints: Array<{ time: string | number; value: number }>,
  publicPoints: Array<{ time: string | number; value: number }>,
): { pairPrices: ChartPricePoint[]; source: TradeChartSeriesSource } {
  const indexer = factualChartPoints(indexerPoints)
  if (indexer.length >= 1) return { pairPrices: indexer, source: 'indexer' }
  const pub = factualChartPoints(publicPoints)
  if (pub.length > 0) return { pairPrices: pub, source: 'public' }
  return { pairPrices: [], source: 'none' }
}

/** Last factual close in render order. That is the rightmost point TradeChartPanel draws. */
export function latestFactualClose(points: Array<{ value: number }>): number | undefined {
  for (let index = points.length - 1; index >= 0; index -= 1) {
    if (isFactualPrice(points[index]?.value)) return points[index].value
  }
  return undefined
}

/**
 * Header price for the series TradeChartPanel is actually drawing.
 * The panel draws a line only when it is not loading and has at least two points.
 * A single candle stays on the insufficient-history state and is not a header price.
 */
export function resolveTradeHeaderPrice(input: {
  priceUsd?: number | null
  pairPrices: Array<{ value: number }>
  chartRendersSeries: boolean
}): number | undefined {
  if (isFactualPrice(input.priceUsd)) return input.priceUsd
  if (!input.chartRendersSeries) return undefined
  return latestFactualClose(input.pairPrices)
}
