import type { DataReasonCode } from './dataReasonCodes'
import type { ProjectDataReasonCode } from 'lib/projects-data/dataReasonCodes'

/** R756 — explicit runtime truth labels (never em dash, never fake indexing). */
export const UI_REASON_LABELS = {
  subgraphLoading: 'Subgraph request in progress',
  explorerNotConfigured: 'BscScan holder API not configured',
  noSwapEvents: 'No swap events indexed for this pair',
  sourceNotConfigured: 'Data source not configured',
  poolsLoading: 'SousChef pool discovery in progress',
} as const

export type UiReasonLabel = (typeof UI_REASON_LABELS)[keyof typeof UI_REASON_LABELS]

const TRADE_UI_MAP: Record<DataReasonCode, UiReasonLabel> = {
  DATA_SOURCE_NOT_CONFIGURED: UI_REASON_LABELS.sourceNotConfigured,
  SUBGRAPH_LOADING: UI_REASON_LABELS.subgraphLoading,
  NO_EVENTS_INDEXED: UI_REASON_LABELS.noSwapEvents,
  NO_POOL_FOUND: UI_REASON_LABELS.sourceNotConfigured,
  TOKEN_NOT_CANONICAL: UI_REASON_LABELS.sourceNotConfigured,
  EXPLORER_SOURCE_MISSING: UI_REASON_LABELS.explorerNotConfigured,
  PAIR_NOT_INDEXED: UI_REASON_LABELS.sourceNotConfigured,
}

const PROJECT_UI_MAP: Record<ProjectDataReasonCode, UiReasonLabel> = {
  DATA_SOURCE_NOT_CONFIGURED: UI_REASON_LABELS.sourceNotConfigured,
  NO_POOL_FOUND: UI_REASON_LABELS.sourceNotConfigured,
  NO_EVENTS_INDEXED: UI_REASON_LABELS.noSwapEvents,
  TOKEN_NOT_CANONICAL: UI_REASON_LABELS.sourceNotConfigured,
  EXPLORER_SOURCE_MISSING: UI_REASON_LABELS.explorerNotConfigured,
}

export function tradeUiReasonLabel(code?: DataReasonCode): UiReasonLabel | undefined {
  return code ? TRADE_UI_MAP[code] : undefined
}

export function projectUiReasonLabel(code?: ProjectDataReasonCode | string): UiReasonLabel | undefined {
  if (!code) return undefined
  return PROJECT_UI_MAP[code as ProjectDataReasonCode]
}
