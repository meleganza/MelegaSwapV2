export type PublicOhlcvTimeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1d'

export type GeckoOhlcvTimeframe = {
  path: 'minute' | 'hour' | 'day'
  aggregate: '1' | '4' | '5' | '15'
  limit: '24' | '60'
}

const TIMEFRAMES: Record<PublicOhlcvTimeframe, GeckoOhlcvTimeframe> = {
  '1m': { path: 'minute', aggregate: '1', limit: '60' },
  '5m': { path: 'minute', aggregate: '5', limit: '60' },
  '15m': { path: 'minute', aggregate: '15', limit: '60' },
  '1h': { path: 'hour', aggregate: '1', limit: '24' },
  '4h': { path: 'hour', aggregate: '4', limit: '60' },
  '1d': { path: 'day', aggregate: '1', limit: '60' },
}

export function resolveOhlcvTimeframe(value?: string | string[]): GeckoOhlcvTimeframe | null {
  const raw = Array.isArray(value) ? value[0] : value
  return TIMEFRAMES[(raw?.toLowerCase() || '1h') as PublicOhlcvTimeframe] ?? null
}
