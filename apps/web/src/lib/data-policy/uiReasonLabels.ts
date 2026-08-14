import type { DataReasonCode } from './dataReasonCodes'
import type { ProjectDataReasonCode } from 'lib/projects-data/dataReasonCodes'
import { METRIC_STATUS, type MetricStatusLabel } from './metricStatus'

/**
 * Global data status — user language is only Available / Indexed / Unavailable.
 * Machine diagnostics stay on reason codes; never surface "Source not configured",
 * "Waiting explorer", or "Unknown" in product UI.
 */
export const UI_REASON_LABELS = {
  available: METRIC_STATUS.AVAILABLE,
  indexed: METRIC_STATUS.INDEXED,
  unavailable: METRIC_STATUS.UNAVAILABLE,
  /** @deprecated alias — maps to Unavailable */
  subgraphLoading: METRIC_STATUS.UNAVAILABLE,
  /** @deprecated alias — maps to Unavailable */
  explorerNotConfigured: METRIC_STATUS.UNAVAILABLE,
  /** @deprecated alias — maps to Unavailable */
  noSwapEvents: METRIC_STATUS.UNAVAILABLE,
  /** @deprecated alias — maps to Unavailable */
  sourceNotConfigured: METRIC_STATUS.UNAVAILABLE,
  /** @deprecated alias — maps to Unavailable */
  poolsLoading: METRIC_STATUS.UNAVAILABLE,
  /** @deprecated alias — maps to Unavailable */
  waitingForIndexing: METRIC_STATUS.UNAVAILABLE,
  /** @deprecated alias — maps to Unavailable */
  waitingForExplorer: METRIC_STATUS.UNAVAILABLE,
} as const

export type UiReasonLabel = MetricStatusLabel

const TRADE_UI_MAP: Record<DataReasonCode, MetricStatusLabel> = {
  DATA_SOURCE_NOT_CONFIGURED: METRIC_STATUS.UNAVAILABLE,
  SUBGRAPH_LOADING: METRIC_STATUS.UNAVAILABLE,
  NO_EVENTS_INDEXED: METRIC_STATUS.UNAVAILABLE,
  NO_POOL_FOUND: METRIC_STATUS.UNAVAILABLE,
  TOKEN_NOT_CANONICAL: METRIC_STATUS.UNAVAILABLE,
  EXPLORER_SOURCE_MISSING: METRIC_STATUS.UNAVAILABLE,
  PAIR_NOT_INDEXED: METRIC_STATUS.UNAVAILABLE,
}

const PROJECT_UI_MAP: Record<ProjectDataReasonCode, MetricStatusLabel> = {
  DATA_SOURCE_NOT_CONFIGURED: METRIC_STATUS.UNAVAILABLE,
  NO_POOL_FOUND: METRIC_STATUS.UNAVAILABLE,
  NO_EVENTS_INDEXED: METRIC_STATUS.UNAVAILABLE,
  TOKEN_NOT_CANONICAL: METRIC_STATUS.UNAVAILABLE,
  EXPLORER_SOURCE_MISSING: METRIC_STATUS.UNAVAILABLE,
}

export function tradeUiReasonLabel(code?: DataReasonCode): MetricStatusLabel | undefined {
  return code ? TRADE_UI_MAP[code] : undefined
}

export function projectUiReasonLabel(code?: ProjectDataReasonCode | string): MetricStatusLabel | undefined {
  if (!code) return undefined
  return PROJECT_UI_MAP[code as ProjectDataReasonCode]
}
