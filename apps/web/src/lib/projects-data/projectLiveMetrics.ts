import type { TokenData } from 'state/info/types'
import type { StaticProjectRecord } from 'registry/projects/types'
import type { HolderCountResult } from 'lib/holder-count'
import { resolveHolderMetric } from 'lib/holder-count'
import type { ProjectDataReasonCode, ResolvedMetricValue } from './dataReasonCodes'
import { holderUnavailableMetric, missingMetric } from './dataReasonCodes'

export interface ProjectLiveMetricsSnapshot {
  liquidity: ResolvedMetricValue
  volume: ResolvedMetricValue
  holders: ResolvedMetricValue
  transactions: ResolvedMetricValue
  age: ResolvedMetricValue
  fdv: ResolvedMetricValue
  priceChange?: ResolvedMetricValue
  reasonCodes: Partial<Record<string, ProjectDataReasonCode>>
}

function formatUsd(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
  if (value >= 1) return `$${value.toFixed(2)}`
  if (value > 0) return `$${value.toFixed(6)}`
  return '—'
}

function formatCount(value: number): string {
  if (value <= 0) return '—'
  return value.toLocaleString()
}

function formatPct(value: number): string {
  if (!Number.isFinite(value)) return '—'
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

function resolveSubgraphUsd(value?: number, tokenData?: TokenData): ResolvedMetricValue {
  if (tokenData?.exists && value != null && value > 0) {
    return { display: formatUsd(value), raw: value }
  }
  if (tokenData?.exists && value === 0) {
    return missingMetric('NO_POOL_FOUND')
  }
  if (tokenData && !tokenData.exists) {
    return missingMetric('NO_EVENTS_INDEXED')
  }
  return missingMetric('DATA_SOURCE_NOT_CONFIGURED')
}

function registryAge(project: StaticProjectRecord): ResolvedMetricValue {
  if (project.asOf) {
    const indexed = new Date(project.asOf)
    if (!Number.isNaN(indexed.getTime())) {
      const days = Math.max(0, Math.floor((Date.now() - indexed.getTime()) / 86_400_000))
      if (days >= 365) return { display: `${Math.floor(days / 365)}y`, raw: days }
      if (days >= 30) return { display: `${Math.floor(days / 30)}mo`, raw: days }
      return { display: `${days}d`, raw: days }
    }
  }
  return missingMetric('EXPLORER_SOURCE_MISSING')
}

export function buildProjectLiveMetrics(
  project: StaticProjectRecord,
  tokenData?: TokenData,
  holderResult?: HolderCountResult | null,
): ProjectLiveMetricsSnapshot {
  const liquidity = resolveSubgraphUsd(tokenData?.liquidityUSD, tokenData)
  const volume = resolveSubgraphUsd(tokenData?.volumeUSD, tokenData)
  const transactions =
    tokenData?.exists && tokenData.txCount > 0
      ? { display: formatCount(tokenData.txCount), raw: tokenData.txCount }
      : tokenData?.exists
        ? missingMetric('NO_EVENTS_INDEXED')
        : missingMetric('DATA_SOURCE_NOT_CONFIGURED')

  const holders =
    holderResult !== undefined
      ? resolveHolderMetric(holderResult)
      : holderUnavailableMetric('EXPLORER_SOURCE_MISSING')

  const fdv = missingMetric('EXPLORER_SOURCE_MISSING')

  const priceChange =
    tokenData?.exists && Number.isFinite(tokenData.priceUSDChange)
      ? { display: formatPct(tokenData.priceUSDChange), raw: tokenData.priceUSDChange }
      : missingMetric('NO_EVENTS_INDEXED')

  const reasonCodes: Partial<Record<string, ProjectDataReasonCode>> = {}
  for (const [key, metric] of Object.entries({ liquidity, volume, holders, transactions, age: registryAge(project), fdv, priceChange })) {
    if (metric.reasonCode) reasonCodes[key] = metric.reasonCode
  }

  return {
    liquidity,
    volume,
    holders,
    transactions,
    age: registryAge(project),
    fdv,
    priceChange,
    reasonCodes,
  }
}

export function liveMetricsToOnChainStrings(snapshot: ProjectLiveMetricsSnapshot) {
  return {
    liquidity: snapshot.liquidity.display,
    volume: snapshot.volume.display,
    holders: snapshot.holders.display,
    transactions: snapshot.transactions.display,
    age: snapshot.age.display,
    fdv: snapshot.fdv.display,
    priceChange: snapshot.priceChange?.display,
    reasonCodes: snapshot.reasonCodes,
  }
}
