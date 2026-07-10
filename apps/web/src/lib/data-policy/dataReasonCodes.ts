export type DataReasonCode =
  | 'DATA_SOURCE_NOT_CONFIGURED'
  | 'SUBGRAPH_LOADING'
  | 'NO_EVENTS_INDEXED'
  | 'NO_POOL_FOUND'
  | 'TOKEN_NOT_CANONICAL'
  | 'EXPLORER_SOURCE_MISSING'
  | 'PAIR_NOT_INDEXED'

export const DATA_REASON_LABELS: Record<DataReasonCode, string> = {
  DATA_SOURCE_NOT_CONFIGURED: 'Explorer API not configured',
  SUBGRAPH_LOADING: 'Subgraph request in progress',
  NO_EVENTS_INDEXED: 'No swap events indexed for this pair',
  NO_POOL_FOUND: 'No liquidity pool indexed for this token',
  TOKEN_NOT_CANONICAL: 'Token not in canonical registry',
  EXPLORER_SOURCE_MISSING: 'BscScan holder API not configured',
  PAIR_NOT_INDEXED: 'Pair not indexed in Melega subgraph',
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
