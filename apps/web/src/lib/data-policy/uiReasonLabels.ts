import type { DataReasonCode } from './dataReasonCodes'
import type { ProjectDataReasonCode } from 'lib/projects-data/dataReasonCodes'

/** P8 — allowed user-facing labels for missing data (never raw reason codes). */
export const UI_REASON_LABELS = {
  waitingForIndexing: 'Waiting for indexing',
  waitingForExplorer: 'Waiting for explorer',
  noRecentActivity: 'No recent activity yet',
  sourceNotConfigured: 'Source not configured',
} as const

export type UiReasonLabel = (typeof UI_REASON_LABELS)[keyof typeof UI_REASON_LABELS]

const TRADE_UI_MAP: Record<DataReasonCode, UiReasonLabel> = {
  DATA_SOURCE_NOT_CONFIGURED: UI_REASON_LABELS.sourceNotConfigured,
  SUBGRAPH_LOADING: UI_REASON_LABELS.waitingForIndexing,
  NO_EVENTS_INDEXED: UI_REASON_LABELS.noRecentActivity,
  NO_POOL_FOUND: UI_REASON_LABELS.waitingForIndexing,
  TOKEN_NOT_CANONICAL: UI_REASON_LABELS.sourceNotConfigured,
  EXPLORER_SOURCE_MISSING: UI_REASON_LABELS.waitingForExplorer,
  PAIR_NOT_INDEXED: UI_REASON_LABELS.waitingForIndexing,
}

const PROJECT_UI_MAP: Record<ProjectDataReasonCode, UiReasonLabel> = {
  DATA_SOURCE_NOT_CONFIGURED: UI_REASON_LABELS.sourceNotConfigured,
  NO_POOL_FOUND: UI_REASON_LABELS.waitingForIndexing,
  NO_EVENTS_INDEXED: UI_REASON_LABELS.noRecentActivity,
  TOKEN_NOT_CANONICAL: UI_REASON_LABELS.sourceNotConfigured,
  EXPLORER_SOURCE_MISSING: UI_REASON_LABELS.waitingForExplorer,
}

export function tradeUiReasonLabel(code?: DataReasonCode): UiReasonLabel | undefined {
  return code ? TRADE_UI_MAP[code] : undefined
}

export function projectUiReasonLabel(code?: ProjectDataReasonCode | string): UiReasonLabel | undefined {
  if (!code) return undefined
  return PROJECT_UI_MAP[code as ProjectDataReasonCode]
}
