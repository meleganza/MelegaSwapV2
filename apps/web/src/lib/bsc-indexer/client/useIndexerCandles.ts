import useSWR from 'swr'
import { MARCO_WBNB_PAIR_BSC } from '../constants'
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

export function useIndexerCandles(pairAddress?: string, interval: OhlcvCandle['interval'] = '1H') {
  const pair = pairAddress?.toLowerCase() ?? MARCO_WBNB_PAIR_BSC.toLowerCase()
  const { data, error, isValidating } = useSWR(
    ['indexer-candles', pair, interval],
    () => fetchIndexerCandles(pair, interval),
    { refreshInterval: 60_000, revalidateOnFocus: false },
  )

  const chartEntries = candlesToChartEntries(data?.candles ?? [])
  const status = data?.status ?? (isValidating ? 'loading' : 'unavailable')

  return {
    chartEntries,
    candles: data?.candles ?? [],
    status,
    reason: data?.reason ?? (error instanceof Error ? error.message : undefined),
    isValidating,
  }
}
