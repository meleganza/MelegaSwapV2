/**
 * POOLS_MODULE_007 — Analytics view-model types.
 * Factual ecosystem health only — no estimates / projections.
 */

export type PoolsAnalyticsModuleState = 'loading' | 'ready' | 'partial' | 'unavailable'

export type AnalyticsMetricDisplay = string // number string or '—'

export interface AnalyticsSegment {
  id: string
  label: string
  count: number
  /** Share of segment total when total > 0; otherwise null (UI shows —). */
  sharePct: number | null
  color: string
}

export interface AnalyticsStatRow {
  id: string
  label: string
  value: AnalyticsMetricDisplay
  supporting?: string
}

export interface PoolsAnalyticsPanelModel {
  id: 'pool_distribution' | 'reward_distribution' | 'participation' | 'pool_health'
  title: string
  state: 'ready' | 'partial' | 'unavailable' | 'loading'
  segments: AnalyticsSegment[]
  stats: AnalyticsStatRow[]
  summary: string
}

export interface PoolsAnalyticsViewModel {
  state: PoolsAnalyticsModuleState
  panels: PoolsAnalyticsPanelModel[]
  liveRegion: string
  /** Factual totals for tests / a11y */
  totals: {
    active: number
    ended: number
    emergency: number
    withdraw: number
    rewarding: number
    smartChefUniverse: number
  }
}
