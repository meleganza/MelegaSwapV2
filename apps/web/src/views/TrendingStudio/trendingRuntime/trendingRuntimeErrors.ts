export type TrendingRuntimeErrorCode =
  | 'NO_PROJECTS'
  | 'INSUFFICIENT_DATA'
  | 'WHALE_UNAVAILABLE'
  | 'SMART_MONEY_UNAVAILABLE'

export interface TrendingRuntimeError {
  code: TrendingRuntimeErrorCode
  message: string
}

const CATALOG: Record<TrendingRuntimeErrorCode, string> = {
  NO_PROJECTS: 'No indexed projects available for trending.',
  INSUFFICIENT_DATA: 'Insufficient data for this filter.',
  WHALE_UNAVAILABLE: 'Whale activity feed unavailable.',
  SMART_MONEY_UNAVAILABLE: 'Smart money tracker unavailable.',
}

export function createTrendingRuntimeError(code: TrendingRuntimeErrorCode): TrendingRuntimeError {
  return { code, message: CATALOG[code] }
}
