import useSWR from 'swr'
import type { ProjectDexAnalytics } from 'lib/market-data/projectDexAnalytics'

type ProjectDexAnalyticsResponse = {
  generatedAt: string
  source: string
  sourceUrl: string
  analytics: ProjectDexAnalytics
}

async function fetchAnalytics(url: string): Promise<ProjectDexAnalyticsResponse> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`HTTP_${response.status}`)
  return response.json()
}

export function useProjectDexAnalytics(chainId: number, address?: string | null) {
  const validAddress = Boolean(address && /^0x[a-fA-F0-9]{40}$/.test(address))
  const key = validAddress
    ? `/api/market-data/token-pairs?chainId=${chainId}&address=${encodeURIComponent(address!)}`
    : null
  const { data, error, isLoading } = useSWR<ProjectDexAnalyticsResponse>(key, fetchAnalytics, {
    revalidateOnFocus: false,
    refreshInterval: 60_000,
    dedupingInterval: 45_000,
  })
  return {
    data: data ?? null,
    loading: Boolean(key && isLoading),
    unavailable: Boolean(key && error),
  }
}
