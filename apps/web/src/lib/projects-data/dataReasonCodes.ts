export type ProjectDataReasonCode =
  | 'DATA_SOURCE_NOT_CONFIGURED'
  | 'NO_POOL_FOUND'
  | 'NO_EVENTS_INDEXED'
  | 'TOKEN_NOT_CANONICAL'
  | 'EXPLORER_SOURCE_MISSING'

export const PROJECT_DATA_REASON_LABELS: Record<ProjectDataReasonCode, string> = {
  DATA_SOURCE_NOT_CONFIGURED: 'Unavailable',
  NO_POOL_FOUND: 'Unavailable',
  NO_EVENTS_INDEXED: 'Unavailable',
  TOKEN_NOT_CANONICAL: 'Unavailable',
  EXPLORER_SOURCE_MISSING: 'Unavailable',
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

/** P8 user-facing label — map diagnostics to Unavailable. */
export function metricUiReasonLabel(code?: ProjectDataReasonCode): string | undefined {
  if (!code) return undefined
  const map: Record<ProjectDataReasonCode, string> = {
    DATA_SOURCE_NOT_CONFIGURED: 'Unavailable',
    NO_POOL_FOUND: 'Unavailable',
    NO_EVENTS_INDEXED: 'Unavailable',
    TOKEN_NOT_CANONICAL: 'Unavailable',
    EXPLORER_SOURCE_MISSING: 'Unavailable',
  }
  return map[code]
}

/** UI + machine profile: missing live data shows Unavailable (never invent zeros). */
export function missingMetric(reasonCode: ProjectDataReasonCode): ResolvedMetricValue {
  return { display: 'Unavailable', reasonCode }
}

/** Holder count unavailable — explicit Unavailable (never invent). */
export function holderUnavailableMetric(
  reasonCode: ProjectDataReasonCode = 'EXPLORER_SOURCE_MISSING',
): ResolvedMetricValue {
  return {
    display: 'Unavailable',
    reasonCode,
  }
}
