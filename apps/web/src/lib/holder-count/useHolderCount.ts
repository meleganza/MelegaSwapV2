import useSWR from 'swr'
import type { HolderCountResult } from './types'

async function fetchHolderCountFromApi(chainId: number, tokenAddress: string): Promise<HolderCountResult> {
  const params = new URLSearchParams({
    chainId: String(chainId),
    address: tokenAddress,
  })
  const res = await fetch(`/api/holder-count?${params.toString()}`, {
    headers: { accept: 'application/json' },
  })
  const json = (await res.json()) as HolderCountResult & { diagnostic?: string; reason?: string }
  if (json.status === 'ready') return json
  return {
    status: 'unavailable',
    reason: json.reason || 'Explorer request failed',
    source: 'unavailable',
    diagnostic: json.diagnostic || `Holder count API HTTP ${res.status}`,
    checkedAt: new Date().toISOString(),
  }
}

export function useHolderCount(chainId?: number, tokenAddress?: string) {
  const normalized = tokenAddress?.trim().toLowerCase()
  const enabled = chainId != null && normalized && /^0x[a-f0-9]{40}$/.test(normalized)

  return useSWR<HolderCountResult>(
    enabled ? ['holder-count', chainId, normalized] : null,
    () => fetchHolderCountFromApi(chainId!, normalized!),
    { revalidateOnFocus: false, refreshInterval: 300_000 },
  )
}
