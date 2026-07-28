/**
 * FARMS_MODULE_007 — Analytics view-model types.
 * Factual ecosystem health only — no estimates / projections.
 */

export type FarmsAnalyticsModuleState = 'loading' | 'ready' | 'partial' | 'unavailable'

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

export interface FarmsAnalyticsPanelModel {
  id: 'farm_distribution' | 'reward_distribution' | 'participation' | 'farm_health'
  title: string
  state: 'ready' | 'partial' | 'unavailable' | 'loading'
  segments: AnalyticsSegment[]
  stats: AnalyticsStatRow[]
  summary: string
}

export interface FarmsAnalyticsViewModel {
  state: FarmsAnalyticsModuleState
  panels: FarmsAnalyticsPanelModel[]
  liveRegion: string
  totals: {
    active: number
    finished: number
    withdraw: number
    emergency: number
    healthy: number
    partial: number
    unavailable: number
    lpUniverse: number
  }
}
