import type { FarmsOverviewKpiId } from './farmsOverviewKpisTokens'

export type KpiMetricState = 'loading' | 'available' | 'partial' | 'unavailable' | 'stale' | 'zero'

export type KpiFreshness = 'live' | 'partial' | 'stale' | 'unavailable' | 'loading'

export interface FarmsOverviewKpiCardModel {
  id: FarmsOverviewKpiId
  label: string
  value: string
  supporting: string
  state: KpiMetricState
  freshness: KpiFreshness
  a11yDetail?: string
}

export interface FarmsOverviewKpisViewModel {
  cards: FarmsOverviewKpiCardModel[]
  phase: 'loading' | 'ready' | 'partial'
  diagnostics: {
    tvlUsd: number | null
    valuedFarmCount: number
    farmUniverseCount: number
    activeFarmCount: number | null
    activeFarmersCount: number | null
    activeFarmersState: KpiMetricState
    rewards24hUsd: number | null
    rewards24hState: KpiMetricState
    rewards24hSource: 'unavailable_no_indexed_distribution'
    sustainableApr: string | null
    sustainableAprFarm: string | null
    harvestableUsd: number | null
    harvestableFarmCount: number
    walletState: 'disconnected' | 'loading' | 'ready'
    emissionNotUsedAs24h: true
    poolsTvlNotIncluded: true
    provenance: Record<string, string>
    fetchedAt: string
  }
}
