import type { ResolvedMetricValue } from 'lib/projects-data/dataReasonCodes'
import type { HolderCountResult } from './types'

function formatHolderCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(2)}M`
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`
  return count.toLocaleString()
}

export function resolveHolderMetric(
  result?: HolderCountResult | null,
  loading?: boolean,
): ResolvedMetricValue {
  if (loading) {
    return {
      display: 'Loading',
      reasonCode: undefined,
    }
  }

  if (!result) {
    return {
      display: 'Unavailable',
      reasonCode: 'EXPLORER_SOURCE_MISSING',
    }
  }

  if (result.status === 'ready') {
    return { display: formatHolderCount(result.count), raw: result.count }
  }

  return {
    display: 'Unavailable',
    reasonCode: 'EXPLORER_SOURCE_MISSING',
    reason: result.reason || result.diagnostic,
  }
}
