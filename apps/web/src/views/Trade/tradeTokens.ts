/** Trade terminal layout constants — R003-B precision grid. */
export const tradeLayout = {
  contentMax: '1180px',
  cockpitWidth: '360px',
  centerWidth: '520px',
  rightRailWidth: '300px',
  columnGap: '16px',
  verticalRhythm: '16px',
  rightRailGap: '14px',
  rightRailRadius: '16px',
  rightRailPadding: '14px',
  contentPaddingX: '24px',
  contentPaddingTop: '18px',
  chartPanelHeight: 'auto',
  chartAreaHeight: '300px',
  recentSwapsHeight: '220px',
} as const

export type TradeMode = 'smartswap' | 'router' | 'limit' | 'history'

export const TRADE_TABS: { id: TradeMode; label: string; icon?: 'lightning' }[] = [
  { id: 'smartswap', label: 'SmartSwap', icon: 'lightning' },
  { id: 'router', label: 'MelegaSwap Router' },
  { id: 'limit', label: 'Limit Orders' },
  { id: 'history', label: 'History' },
]

export const TRADE_TIMEFRAMES = [
  { id: '1m', label: '1m' },
  { id: '5m', label: '5m' },
  { id: '15m', label: '15m' },
  { id: '1h', label: '1H' },
  { id: '4h', label: '4H' },
  { id: '1d', label: '1D' },
] as const

export type TradeTimeframeId = (typeof TRADE_TIMEFRAMES)[number]['id']

export const tradeColors = {
  canvas: '#050505',
  panel: '#111111',
  panelGradient: 'linear-gradient(180deg, #141414 0%, #101010 100%)',
  gold: '#D4AF37',
  goldBright: '#F4C542',
  green: '#00E676',
  red: '#FF4D4D',
  muted: '#8A8A8A',
  text: '#FFFFFF',
  border: 'rgba(255,255,255,0.08)',
} as const
