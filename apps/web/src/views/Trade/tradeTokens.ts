import { premiumStudioColors, premiumStudioLayout } from 'design-system/melega/tokens/premiumStudio'
import { studioConstitutionLayout } from 'design-system/melega/tokens/studioConstitution'

/** Trade terminal — R758 constitution rhythm. */
export const tradeLayout = {
  ...premiumStudioLayout,
  ...studioConstitutionLayout,
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
  recentSwapsHeight: '320px',
  swapRowHeight: '52px',
  swapTableHeadHeight: '36px',
  statCardMinHeight: '108px',
  statValueMinHeight: '28px',
  executionInputGap: '12px',
  executionRouteGap: '14px',
  executionDetailsGap: '14px',
  executionButtonGap: '14px',
} as const

/** R759 — canonical numeric typography for Trade surfaces. */
export const tradeTypography = {
  fontVariantNumeric: 'tabular-nums',
  heroPrice: { size: '34px', weight: 800, lineHeight: '1' },
  heroChange: { size: '14px', weight: 700, lineHeight: '1.2' },
  statLabel: { size: '12px', weight: 600, lineHeight: '1.2' },
  statValue: { size: '22px', weight: 700, lineHeight: '1.15' },
  statSubline: { size: '12px', weight: 400, lineHeight: '1.35' },
  tableHead: { size: '11px', weight: 700, letterSpacing: '0.04em' },
  tableCell: { size: '13px', weight: 600, lineHeight: '1.3' },
  tableCellMuted: { size: '12px', weight: 500, lineHeight: '1.3' },
  executionAmount: { size: '32px', weight: 700, lineHeight: '32px' },
  executionMeta: { size: '12px', weight: 600, lineHeight: '1.35' },
} as const

export type TradeMode = 'smartswap' | 'router' | 'limit' | 'history'

export const TRADE_TABS: { id: TradeMode; label: string; icon?: 'lightning' }[] = [
  { id: 'smartswap', label: 'SmartSwap', icon: 'lightning' },
  { id: 'router', label: 'MelegaSwap Router' },
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
