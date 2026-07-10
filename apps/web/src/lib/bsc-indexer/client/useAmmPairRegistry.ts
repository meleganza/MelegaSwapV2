import useSWR from 'swr'
import { fetchAmmPairsPage } from './fetchDurableIndexer'

export function useAmmPairRegistry(params: {
  q?: string
  page?: number
  pageSize?: number
  classification?: string
}) {
  const key = ['amm-pair-registry', params.q, params.page, params.pageSize, params.classification]
  const { data, error, isValidating, mutate } = useSWR(key, () => fetchAmmPairsPage(params), {
    revalidateOnFocus: false,
    dedupingInterval: 60_000,
  })

  return {
    pairs: data?.rows ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    pageSize: data?.pageSize ?? 50,
    status: data?.status ?? (isValidating ? 'loading' : 'unavailable'),
    error,
    isValidating,
    mutate,
  }
}
