import type { PoolReconciliation } from 'lib/data-truth/poolLifecycle'

export interface PoolClassificationCounts {
  discovered: number
  verified: number
  active: number
  funded: number
  rewarding: number
  ended: number
  invalid: number
}

export type PoolClassificationStatus = 'loading' | 'ready' | 'unavailable'

export interface PoolClassificationSummary {
  status: PoolClassificationStatus
  counts?: PoolClassificationCounts
  generatedAt?: string
  currentBlock?: number
  errorDetail?: string
}

export interface ClassificationApiResponse {
  generatedAt?: string
  currentBlock?: number
  counts?: Partial<PoolClassificationCounts> & {
    dataSource?: string
    note?: string
  }
}

export function parseClassificationCounts(raw: ClassificationApiResponse | null | undefined): PoolClassificationCounts | null {
  const c = raw?.counts
  if (!c) return null
  const discovered = Number(c.discovered)
  if (!Number.isFinite(discovered)) return null
  return {
    discovered,
    verified: finiteCount(c.verified, discovered),
    active: finiteCount(c.active, 0),
    funded: finiteCount(c.funded, 0),
    rewarding: finiteCount(c.rewarding, 0),
    ended: finiteCount(c.ended, 0),
    invalid: finiteCount(c.invalid, 0),
  }
}

function finiteCount(value: unknown, fallback: number): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

export function buildLifecycleSecondaryCopy(counts: PoolClassificationCounts): string {
  return `${counts.active} active · ${counts.funded} funded · ${counts.rewarding} rewarding`
}

export function classificationToReconciliation(counts: PoolClassificationCounts): PoolReconciliation {
  return {
    discovered: counts.discovered,
    validContracts: counts.verified,
    future: 0,
    active: counts.active,
    funded: counts.funded,
    rewarding: counts.rewarding,
    finished: counts.ended,
    invalid: counts.invalid,
    unresolved: 0,
  }
}

export function assertRewardingInvariants(counts: PoolClassificationCounts): boolean {
  return counts.rewarding <= counts.active && counts.rewarding <= counts.funded
}

export function resolveLifecycleCounts(summary: PoolClassificationSummary): PoolClassificationCounts | undefined {
  if (summary.status !== 'ready' || !summary.counts) return undefined
  return summary.counts
}

export interface KpiLifecycleFields {
  lifecycleReady: boolean
  discoveredValue: string
  lifecycleSecondary?: string
  rewarding: number
  counts?: PoolClassificationCounts
}

export function resolveKpiLifecycleFields(summary: PoolClassificationSummary): KpiLifecycleFields {
  const counts = resolveLifecycleCounts(summary)
  const lifecycleReady = summary.status === 'ready' && Boolean(counts)
  if (!lifecycleReady) {
    return {
      lifecycleReady: false,
      discoveredValue: summary.status === 'loading' ? '—' : 'Unavailable',
      lifecycleSecondary: undefined,
      rewarding: 0,
    }
  }
  return {
    lifecycleReady: true,
    discoveredValue: String(counts!.discovered),
    lifecycleSecondary: buildLifecycleSecondaryCopy(counts!),
    rewarding: counts!.rewarding,
    counts,
  }
}
