import type { PoolsOverviewKpiId } from './poolsOverviewKpisTokens'
import type { Pools24hRewardsBreakdown } from './buildPools24hRewards'

export type KpiMetricState = 'loading' | 'available' | 'partial' | 'unavailable' | 'stale' | 'zero'

export type KpiFreshness = 'live' | 'partial' | 'stale' | 'unavailable' | 'loading'

export interface PoolsOverviewKpiCardModel {
  id: PoolsOverviewKpiId
  label: string
  value: string
  supporting: string
  state: KpiMetricState
  freshness: KpiFreshness
  /** Accessible detail (timestamp / provenance). */
  a11yDetail?: string
}

export interface PoolsOverviewKpisViewModel {
  cards: PoolsOverviewKpiCardModel[]
  phase: 'loading' | 'ready' | 'partial'
  /** Machine-readable diagnostics for evidence / tests. */
  diagnostics: {
    tvlUsd: number | null
    valuedPoolCount: number
    poolUniverseCount: number
    discoveredPoolCount: number | null
    rewardingPoolCount: number | null
    rewards24hUsd: number | null
    rewards24hState: string
    rewards24hBreakdown?: Pools24hRewardsBreakdown
    sustainableApr: string | null
    sustainableAprPool: string | null
    claimableUsd: number | null
    claimablePoolCount: number
    claimableUnvaluedCount: number
    walletState: 'disconnected' | 'loading' | 'ready'
    classificationStatus: string
    factoryPairsNotUsed: true
    rewards24hSource: string
    provenance: Record<string, string>
    fetchedAt: string
  }
}
