import useSWR from 'swr'

type PairCandle = {
  timestamp: number
  close: number
  volumeUsd: number
}

type PairOhlcvResponse = {
  status: 'ready' | 'empty' | 'unavailable'
  candles: PairCandle[]
  volume24hUsd: number | null
}

async function fetchPairOhlcv(url: string): Promise<PairOhlcvResponse> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`PAIR_OHLCV_HTTP_${response.status}`)
  return response.json()
}

function isAddress(value?: string | null): value is string {
  return Boolean(value && /^0x[a-fA-F0-9]{40}$/.test(value))
}

export function useFarmPairAnalytics(chainId: number, pairAddress?: string | null) {
  const valid = Number.isFinite(chainId) && isAddress(pairAddress)
  const key = valid
    ? `/api/market-data/pair-ohlcv?chainId=${chainId}&pairAddress=${encodeURIComponent(pairAddress!)}`
    : null
  const { data, error, isValidating } = useSWR<PairOhlcvResponse>(key, fetchPairOhlcv, {
    revalidateOnFocus: false,
    refreshInterval: 60_000,
    dedupingInterval: 55_000,
    shouldRetryOnError: false,
  })

  const closes = (data?.candles ?? [])
    .map((candle) => Number(candle.close))
    .filter((value) => Number.isFinite(value) && value > 0)
  const volume24hUsd =
    data?.volume24hUsd != null && Number.isFinite(data.volume24hUsd) && data.volume24hUsd >= 0
      ? data.volume24hUsd
      : null

  return {
    closes,
    volume24hUsd,
    status: data?.status ?? (isValidating ? 'loading' : error ? 'unavailable' : 'idle'),
  }
}
