/**
 * Client consumer of the certified canonical market snapshot.
 * Prefer this over independently recomputing USD volume / featured aggregates.
 */

import useSWR from 'swr'
import type { CanonicalMarketSnapshot } from './types'

async function fetchSnapshot(url: string): Promise<CanonicalMarketSnapshot> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`market-data snapshot ${res.status}`)
  return res.json()
}

export function useCanonicalMarketSnapshot() {
  const { data, error, isValidating } = useSWR('/api/market-data/snapshot', fetchSnapshot, {
    refreshInterval: 60_000,
    revalidateOnFocus: false,
    dedupingInterval: 30_000,
  })

  return {
    snapshot: data ?? null,
    isLoading: !data && !error,
    isValidating,
    error: error ? (error instanceof Error ? error.message : 'snapshot failed') : undefined,
    volume24hUsd: data?.volume24hUsd,
    volume24hWbnb: data?.volume24hWbnb,
    bnbUsd: data?.bnbUsd,
    listedProjects: data?.listedProjects,
    markets: data?.markets,
    featured: data?.featured ?? [],
    status: data?.status,
    fromLastGood: data?.fromLastGood === true,
  }
}
