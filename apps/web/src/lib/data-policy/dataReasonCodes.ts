export type DataReasonCode =
  | 'DATA_SOURCE_NOT_CONFIGURED'
  | 'SUBGRAPH_LOADING'
  | 'NO_EVENTS_INDEXED'
  | 'NO_POOL_FOUND'
  | 'TOKEN_NOT_CANONICAL'
  | 'EXPLORER_SOURCE_MISSING'
  | 'PAIR_NOT_INDEXED'

export const DATA_REASON_LABELS: Record<DataReasonCode, string> = {
  DATA_SOURCE_NOT_CONFIGURED: 'Data source not configured',
  SUBGRAPH_LOADING: 'Subgraph loading',
  NO_EVENTS_INDEXED: 'No events indexed',
  NO_POOL_FOUND: 'No pool found',
  TOKEN_NOT_CANONICAL: 'Token not canonical',
  EXPLORER_SOURCE_MISSING: 'Explorer source missing',
  PAIR_NOT_INDEXED: 'Pair not indexed',
}

export interface ResolvedDataField<T = string> {
  display: T
  reasonCode?: DataReasonCode
}

export function emptyField(reasonCode: DataReasonCode): ResolvedDataField {
  return { display: '—', reasonCode }
}
