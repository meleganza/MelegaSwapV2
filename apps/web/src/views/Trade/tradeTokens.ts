import { premiumStudioColors, premiumStudioLayout } from 'design-system/melega/tokens/premiumStudio'

/** Trade terminal — R200 premium alignment. */
export const tradeLayout = {
  ...premiumStudioLayout,
  cockpitWidth: '360px',
  centerWidth: '520px',
  rightRailWidth: '300px',
  columnGap: '16px',
  verticalRhythm: '16px',
  rightRailGap: '14px',
  rightRailRadius: premiumStudioLayout.cardRadius,
  rightRailPadding: '14px',
  chartPanelHeight: 'auto',
  chartAreaHeight: '300px',
  chartAreaHeightCompact: '132px',
  recentSwapsHeight: '320px',
  recentSwapsHeightCompact: '168px',
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
  ...premiumStudioColors,
  panel: premiumStudioColors.card,
  panelGradient: premiumStudioColors.card,
  goldBright: premiumStudioColors.gold,
  border: premiumStudioColors.cardBorder,
} as const
