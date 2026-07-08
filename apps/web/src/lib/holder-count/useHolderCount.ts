import useSWR from 'swr'
import { fetchHolderCount } from './fetchHolderCount'
import type { HolderCountResult } from './types'

export function useHolderCount(chainId?: number, tokenAddress?: string) {
  const normalized = tokenAddress?.trim().toLowerCase()
  const enabled = chainId != null && normalized && /^0x[a-f0-9]{40}$/.test(normalized)

  return useSWR<HolderCountResult>(
    enabled ? ['holder-count', chainId, normalized] : null,
    () => fetchHolderCount(chainId!, normalized!),
    { revalidateOnFocus: false, refreshInterval: 300_000 },
  )
}
