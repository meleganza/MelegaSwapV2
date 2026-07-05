export type ProjectDataReasonCode =
  | 'DATA_SOURCE_NOT_CONFIGURED'
  | 'NO_POOL_FOUND'
  | 'NO_EVENTS_INDEXED'
  | 'TOKEN_NOT_CANONICAL'
  | 'EXPLORER_SOURCE_MISSING'

export const PROJECT_DATA_REASON_LABELS: Record<ProjectDataReasonCode, string> = {
  DATA_SOURCE_NOT_CONFIGURED: 'Data source not configured',
  NO_POOL_FOUND: 'No pool found',
  NO_EVENTS_INDEXED: 'No events indexed',
  TOKEN_NOT_CANONICAL: 'Token not canonical',
  EXPLORER_SOURCE_MISSING: 'Explorer source missing',
}

export interface ResolvedMetricValue {
  display: string
  reasonCode?: ProjectDataReasonCode
  raw?: number
}

export function metricDisplay(value: ResolvedMetricValue): string {
  return value.display
}

export function metricReasonLabel(code?: ProjectDataReasonCode): string | undefined {
  return code ? PROJECT_DATA_REASON_LABELS[code] : undefined
}

/** P8 user-facing label (never raw reason code). */
export function metricUiReasonLabel(code?: ProjectDataReasonCode): string | undefined {
  if (!code) return undefined
  const map: Record<ProjectDataReasonCode, string> = {
    DATA_SOURCE_NOT_CONFIGURED: 'Source not configured',
    NO_POOL_FOUND: 'Waiting for indexing',
    NO_EVENTS_INDEXED: 'No recent activity yet',
    TOKEN_NOT_CANONICAL: 'Source not configured',
    EXPLORER_SOURCE_MISSING: 'Waiting for explorer',
  }
  return map[code]
}

/** UI + machine profile: never emit generic "Unavailable" for missing live data. */
export function missingMetric(reasonCode: ProjectDataReasonCode): ResolvedMetricValue {
  return { display: '—', reasonCode }
}
