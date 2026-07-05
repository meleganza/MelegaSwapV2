import { premiumStudioColors, premiumStudioLayout, PREMIUM_FONT_BODY, PREMIUM_FONT_DISPLAY } from 'design-system/melega/tokens/premiumStudio'

/** Trending Studio — R200 premium alignment. */
export const trendingStudioLayout = {
  ...premiumStudioLayout,
  mainColumnWidth: 'minmax(0, 1fr)',
  sidebarWidth: 'minmax(280px, 320px)',
  columnGap: premiumStudioLayout.cardGap,
  kpiGap: '18px',
  kpiHeight: premiumStudioLayout.kpiHeight,
  kpiRadius: premiumStudioLayout.cardRadius,
  sparklineW: 72,
  sparklineH: 28,
  filterHeight: '44px',
  filterRadius: '999px',
  filterPaddingX: '18px',
  filterGap: '10px',
  heatmapHeight: '260px',
  trendingCardWidth: 'auto',
  trendingCardHeight: 'auto',
  trendingCardMinHeight: '245px',
  trendingCardGap: premiumStudioLayout.cardGap,
  trendingCardRadius: premiumStudioLayout.cardRadius,
  trendingBtnHeight: premiumStudioLayout.btnHeight,
  tradeBtnWidth: '120px',
  openBtnWidth: '150px',
  watchBtnWidth: '120px',
  trendingBtnGap: '16px',
  whaleMonitorHeight: '210px',
  smartMoneyHeight: '180px',
  opportunityRing: '92px',
  discoveriesHeight: '260px',
  mobilePadding: '20px',
  mobileGap: '16px',
} as const

export const trendingStudioColors = {
  ...premiumStudioColors,
  panel: premiumStudioColors.card,
  panelAlt: premiumStudioColors.card,
  border: premiumStudioColors.cardBorder,
  yellow: premiumStudioColors.gold,
  white: premiumStudioColors.text,
  gray: premiumStudioColors.secondary,
  hoverRow: '#171717',
  shadow: '0 8px 30px rgba(0,0,0,0.35)',
} as const

export const TRENDING_FONT_DISPLAY = PREMIUM_FONT_DISPLAY
export const TRENDING_FONT_BODY = PREMIUM_FONT_BODY

export const TRENDING_STUDIO_PREVIEW_LABEL = 'PREVIEW LAYOUT'
