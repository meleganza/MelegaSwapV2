export type RadarRuntimeErrorCode =
  | 'NO_RUNTIME_DATA'
  | 'PROJECT_NOT_INDEXED'
  | 'NO_CONTRACT'
  | 'NO_MARKET_SOURCE'
  | 'NO_EXPLORER'
  | 'NO_SOCIAL'
  | 'INDEXING_PENDING'
  | 'UNKNOWN'

export interface RadarRuntimeError {
  code: RadarRuntimeErrorCode
  message: string
}

const ERROR_CATALOG: Record<RadarRuntimeErrorCode, string> = {
  NO_RUNTIME_DATA: 'Radar runtime has no indexed signals for this scope.',
  PROJECT_NOT_INDEXED: 'Project is not indexed in the Melega registry.',
  NO_CONTRACT: 'No contract address is available for intelligence preview.',
  NO_MARKET_SOURCE: 'No external market source confirmed for this contract.',
  NO_EXPLORER: 'Explorer link is unavailable for this contract.',
  NO_SOCIAL: 'No social channels indexed for this project.',
  INDEXING_PENDING: 'Radar indexing is pending for this project.',
  UNKNOWN: 'An unexpected error occurred while loading radar intelligence.',
}

export function createRadarRuntimeError(code: RadarRuntimeErrorCode): RadarRuntimeError {
  return { code, message: ERROR_CATALOG[code] }
}
