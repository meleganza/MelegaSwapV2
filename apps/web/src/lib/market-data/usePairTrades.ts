import useSWR from 'swr'
import type { PublicPairTrade } from './pairTrades'

type PairTradesResponse = {
  status: 'ready' | 'empty' | 'unavailable'
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

  return {
    trades: data?.trades ?? [],
    status: data?.status ?? (isValidating ? 'loading' : error ? 'unavailable' : 'idle'),
    source: data?.source ?? 'geckoterminal-public-trades',
    reason: data?.reason,
    generatedAt: data?.generatedAt,
  }
}

export default usePairTrades
