import { startTransition, useEffect, useState } from 'react'
import useSWR from 'swr'
import type { GlobalLiquiditySnapshot } from './types'

async function fetchSnapshot(url: string): Promise<GlobalLiquiditySnapshot> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Global liquidity snapshot unavailable (${response.status})`)
  return response.json()
}

export function useGlobalLiquiditySnapshot() {
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => startTransition(() => setHydrated(true)), [])

  return useSWR<GlobalLiquiditySnapshot>(hydrated ? '/api/indexer/global-liquidity' : null, fetchSnapshot, {
    isPaused: () => false,
    refreshInterval: 120_000,
    dedupingInterval: 60_000,
    revalidateOnFocus: false,
  })
}
