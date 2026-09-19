import useSWR from 'swr'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useYieldParticipants } from 'lib/yield-participants/useYieldParticipants'
import { getMasterChefAddress } from 'utils/addressHelpers'

type UniqueFarmersResponse = {
  status?: string
  uniqueFarmers?: number | null
  note?: string
  coveragePct?: number
  lastIndexedBlock?: number
  chainHead?: number
  primaryLabel?: string
}

async function fetchUniqueFarmers(): Promise<UniqueFarmersResponse> {
  const res = await fetch('/api/farms/unique-farmers')
  if (!res.ok) return { status: 'unavailable' }
  return (await res.json()) as UniqueFarmersResponse
}

export function useUniqueFarmersCount(): {
  count: number | null
  loading: boolean
  indexing: boolean
  note: string | null
  coveragePct: number | null
} {
  const { chainId } = useActiveChainId()
  const { snapshot } = useYieldParticipants()
  const { data, isValidating } = useSWR(chainId === 56 ? 'farms-unique-farmers' : null, fetchUniqueFarmers, {
    revalidateOnFocus: false,
    dedupingInterval: 60_000,
    refreshInterval: 90_000,
  })

  if (chainId !== 56) {
    const indexed = snapshot.farmTotals?.[`${chainId}:${getMasterChefAddress(chainId).toLowerCase()}`]
    return {
      count: indexed?.participants ?? null, loading: false, indexing: !indexed,
      note: 'Unique wallets with active LP farm positions on this network',
      coveragePct: indexed ? 100 : null,
    }
  }
  const status = data?.status ?? 'unavailable'
  const indexing = status === 'indexing' || status === 'idle'
  // Prefer factual unique count whenever the API surfaces one (incl. seed/catch-up).
  // Never treat null / incomplete index as a factual zero.
  const count =
    data?.uniqueFarmers != null && Number.isFinite(data.uniqueFarmers) && data.uniqueFarmers > 0
      ? data.uniqueFarmers
      : status === 'ready' && data?.uniqueFarmers === 0
        ? 0
        : null

  return {
    count,
    loading: isValidating && count == null && indexing,
    indexing: indexing && count == null,
    note: data?.note ?? data?.primaryLabel ?? null,
    coveragePct: data?.coveragePct ?? null,
  }
}
