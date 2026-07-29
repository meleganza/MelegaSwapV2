import useSWR from 'swr'

type UniqueFarmersResponse = {
  status?: string
  uniqueFarmers?: number
  note?: string
}

async function fetchUniqueFarmers(): Promise<UniqueFarmersResponse> {
  const res = await fetch('/api/farms/unique-farmers')
  if (!res.ok) return { status: 'unavailable' }
  return (await res.json()) as UniqueFarmersResponse
}

export function useUniqueFarmersCount(): {
  count: number | null
  loading: boolean
  note: string | null
} {
  const { data, isValidating } = useSWR('farms-unique-farmers', fetchUniqueFarmers, {
    revalidateOnFocus: false,
    dedupingInterval: 120_000,
    refreshInterval: 180_000,
  })
  const count =
    data?.uniqueFarmers != null && Number.isFinite(data.uniqueFarmers) && data.uniqueFarmers >= 0
      ? data.uniqueFarmers
      : null
  return {
    count,
    loading: isValidating && count == null,
    note: data?.note ?? null,
  }
}
