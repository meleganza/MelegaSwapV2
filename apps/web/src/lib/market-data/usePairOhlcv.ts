import useSWR from 'swr'
import type { PublicOhlcvTimeframe } from './ohlcvTimeframe'
import { pairResponseMatchesRequest } from './pairResponseIdentity'

export type PublicPairCandle = {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volumeUsd: number
}

type PairOhlcvResponse = {
  status: 'ready' | 'empty' | 'unavailable'
  chainId: number
  pairAddress: string
  tokenAddress?: string | null
  candles: PublicPairCandle[]
  volume24hUsd: number | null
  source: string
}

async function fetchPairOhlcv(url: string): Promise<PairOhlcvResponse> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`PAIR_OHLCV_HTTP_${response.status}`)
  return response.json()
}

function isAddress(value?: string | null): value is string {
  return Boolean(value && /^0x[a-fA-F0-9]{40}$/.test(value))
}

/** Public OHLCV fallback for real pairs not yet covered by the durable Melega indexer. */
export function usePairOhlcv(
  chainId: number | undefined,
  pairAddress?: string | null,
  tokenAddress?: string | null,
  timeframe: PublicOhlcvTimeframe = '1h',
) {
  const valid = Number.isFinite(chainId) && isAddress(pairAddress)
  const targetToken = isAddress(tokenAddress) ? tokenAddress.toLowerCase() : undefined
  const key = valid
    ? `/api/market-data/pair-ohlcv?chainId=${chainId}&pairAddress=${encodeURIComponent(pairAddress!)}${
        targetToken ? `&tokenAddress=${encodeURIComponent(targetToken)}` : ''
      }&timeframe=${timeframe}`
    : null
  const { data, error, isValidating } = useSWR<PairOhlcvResponse>(key, fetchPairOhlcv, {
    revalidateOnFocus: false,
    refreshInterval: 60_000,
    dedupingInterval: 55_000,
    shouldRetryOnError: false,
  })
  const currentData = pairResponseMatchesRequest(data, chainId, pairAddress, targetToken) ? data : undefined

  return {
    candles: currentData?.candles ?? [],
    volume24hUsd:
      currentData?.volume24hUsd != null && Number.isFinite(currentData.volume24hUsd) && currentData.volume24hUsd >= 0
        ? currentData.volume24hUsd
        : null,
    status: currentData?.status ?? (isValidating ? 'loading' : error ? 'unavailable' : valid ? 'loading' : 'idle'),
    source: currentData?.source ?? null,
  }
}

export default usePairOhlcv
