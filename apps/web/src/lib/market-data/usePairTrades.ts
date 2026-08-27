import useSWR from 'swr'
import type { PublicPairTrade } from './pairTrades'
import { pairResponseMatchesRequest } from './pairResponseIdentity'

type PairTradesResponse = {
  status: 'ready' | 'empty' | 'unavailable'
  chainId: number
  pairAddress: string
  tokenAddress: string
  trades: PublicPairTrade[]
  source: string
  reason?: string
  generatedAt?: string
}

async function fetchPairTrades(url: string): Promise<PairTradesResponse> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`PAIR_TRADES_HTTP_${response.status}`)
  return response.json()
}

function isAddress(value?: string | null): value is string {
  return Boolean(value && /^0x[a-fA-F0-9]{40}$/.test(value))
}

/** Recent public swaps for the exact selected pool and token. */
export function usePairTrades(chainId: number | undefined, pairAddress?: string | null, tokenAddress?: string | null) {
  const valid = Number.isFinite(chainId) && isAddress(pairAddress) && isAddress(tokenAddress)
  const key = valid
    ? `/api/market-data/pair-trades?chainId=${chainId}&pairAddress=${encodeURIComponent(
        pairAddress!,
      )}&tokenAddress=${encodeURIComponent(tokenAddress!)}`
    : null
  const { data, error, isValidating } = useSWR<PairTradesResponse>(key, fetchPairTrades, {
    revalidateOnFocus: false,
    refreshInterval: 30_000,
    dedupingInterval: 25_000,
    shouldRetryOnError: false,
  })
  const currentData = pairResponseMatchesRequest(data, chainId, pairAddress, tokenAddress) ? data : undefined

  return {
    trades: currentData?.trades ?? [],
    status: currentData?.status ?? (isValidating ? 'loading' : error ? 'unavailable' : valid ? 'loading' : 'idle'),
    source: currentData?.source ?? 'geckoterminal-public-trades',
    reason: currentData?.reason,
    generatedAt: currentData?.generatedAt,
  }
}

export default usePairTrades
