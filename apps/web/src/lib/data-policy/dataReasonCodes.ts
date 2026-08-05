export type DataReasonCode =
  | 'DATA_SOURCE_NOT_CONFIGURED'
  | 'SUBGRAPH_LOADING'
  | 'NO_EVENTS_INDEXED'
  | 'NO_POOL_FOUND'
  | 'TOKEN_NOT_CANONICAL'
  | 'EXPLORER_SOURCE_MISSING'
  | 'PAIR_NOT_INDEXED'

export const DATA_REASON_LABELS: Record<DataReasonCode, string> = {
  DATA_SOURCE_NOT_CONFIGURED: 'Unavailable',
  SUBGRAPH_LOADING: 'Unavailable',
  NO_EVENTS_INDEXED: 'Unavailable',
  NO_POOL_FOUND: 'Unavailable',
  TOKEN_NOT_CANONICAL: 'Unavailable',
  EXPLORER_SOURCE_MISSING: 'Unavailable',
  PAIR_NOT_INDEXED: 'Unavailable',
}

export interface ResolvedDataField<T = string> {
  display: T
  reasonCode?: DataReasonCode
  status?: 'READY' | 'UNAVAILABLE' | 'LOADING'
  reason?: string
}

export function emptyField(reasonCode: DataReasonCode): ResolvedDataField {
  return {
    display: 'Unavailable',
    reasonCode,
    status: 'UNAVAILABLE',
    reason: DATA_REASON_LABELS[reasonCode],
  }
}
