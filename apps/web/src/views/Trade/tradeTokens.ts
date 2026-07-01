/** Trade terminal layout constants — aligned with Home DS-002 shell. */
export const tradeLayout = {
  contentMax: '1180px',
  cockpitWidth: '560px',
  columnGap: '20px',
  chartHeight: '420px',
} as const

export type TradeMode = 'standard' | 'smartswap'

export const TRADE_TIMEFRAMES = [
  { id: '1h', label: '1H' },
  { id: '4h', label: '4H' },
  { id: '1d', label: '1D' },
  { id: '1w', label: '1W' },
  { id: '1m', label: '1M' },
  { id: 'all', label: 'ALL' },
] as const

export type TradeTimeframeId = (typeof TRADE_TIMEFRAMES)[number]['id']
