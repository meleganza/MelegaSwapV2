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
    { refreshInterval: 60_000, revalidateOnFocus: false },
  )
  const currentData = data?.pairAddress === pair ? data : undefined

  const chartEntries = candlesToChartEntries(currentData?.candles ?? [])
  const status = shouldFetch ? currentData?.status ?? (isValidating ? 'loading' : 'unavailable') : 'disabled'

  return {
    chartEntries,
    candles: currentData?.candles ?? [],
    status,
    reason: currentData?.reason ?? (error instanceof Error ? error.message : undefined),
    isValidating,
  }
}
