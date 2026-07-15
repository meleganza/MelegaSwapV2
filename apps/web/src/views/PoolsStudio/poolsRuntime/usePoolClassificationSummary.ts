import useSWR from 'swr'
import { useMemo } from 'react'
import {
  parseClassificationCounts,
  type ClassificationApiResponse,
  type PoolClassificationSummary,
} from './poolClassificationSummary'

async function fetchPoolClassification(): Promise<ClassificationApiResponse> {
  const res = await fetch('/api/pools/classification/')
  if (!res.ok) {
    throw new Error(`classification HTTP ${res.status}`)
  }
  return res.json()
}

export function usePoolClassificationSummary(): PoolClassificationSummary {
  const { data, error, isLoading } = useSWR('pool-classification-summary', fetchPoolClassification, {
    revalidateOnFocus: false,
    dedupingInterval: 60_000,
  })

  return useMemo((): PoolClassificationSummary => {
    if (isLoading && !data) {
      return { status: 'loading' }
    }
    if (error) {
      return {
        status: 'unavailable',
        errorDetail: error instanceof Error ? error.message : String(error),
      }
    }
    const counts = parseClassificationCounts(data)
    if (!counts) {
      return {
        status: 'unavailable',
        errorDetail: 'Classification response missing counts',
        generatedAt: data?.generatedAt,
        currentBlock: data?.currentBlock,
      }
    }
    return {
      status: 'ready',
      counts,
      generatedAt: data?.generatedAt,
      currentBlock: data?.currentBlock,
    }
  }, [data, error, isLoading])
}
