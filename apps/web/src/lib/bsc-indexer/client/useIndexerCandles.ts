import useSWR from 'swr'
import { fetchIndexerCandles } from './fetchDurableIndexer'
import type { OhlcvCandle } from '../types'
import type { PriceChartEntry } from 'state/info/types'

function candlesToChartEntries(candles: OhlcvCandle[]): PriceChartEntry[] {
  return candles
    .filter((c) => Number.isFinite(c.open) && c.open > 0)
    .map((c) => ({
      time: c.bucketTimestamp,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }))
}

/** Pair + interval identity. Global SWR keepPreviousData must not leak another series. */
export function indexerCandlePayloadMatches(
  data: { pairAddress?: string; interval?: string; candles?: Array<{ interval?: string }> } | null | undefined,
  pair: string | undefined,
  interval: string,
): boolean {
  if (!data || !pair || data.pairAddress !== pair || data.interval !== interval) return false
  return (data.candles ?? []).every((candle) => candle.interval == null || candle.interval === interval)
}

export function useIndexerCandles(
  pairAddress?: string,
  interval: OhlcvCandle['interval'] = '1H',
  enabled = true,
) {
  const pair = pairAddress?.toLowerCase()
  const shouldFetch = Boolean(enabled && pair)
  const { data, error, isValidating } = useSWR(
    shouldFetch ? ['indexer-candles', pair, interval] : null,
    () => fetchIndexerCandles(pair!, interval),
    // Providers sets keepPreviousData globally. A pair or timeframe change must
    // not keep the previous series while the next identity is in flight.
    { refreshInterval: 60_000, revalidateOnFocus: false, keepPreviousData: false },
  )
  const currentData = indexerCandlePayloadMatches(data, pair, interval) ? data : undefined

  const chartEntries = candlesToChartEntries(currentData?.candles ?? [])
  const status = !shouldFetch
    ? 'disabled'
    : currentData?.status ?? (isValidating || (!error && !data) ? 'loading' : 'unavailable')

  return {
    chartEntries,
    candles: currentData?.candles ?? [],
    status,
    reason: currentData?.reason ?? (error instanceof Error ? error.message : undefined),
    isValidating,
  }
}
