import { premiumStudioColors, premiumStudioLayout, PREMIUM_FONT_DISPLAY } from 'design-system/melega/tokens/premiumStudio'
import { studioConstitutionLayout } from 'design-system/melega/tokens/studioConstitution'
import { tradeTypography } from 'views/Trade/tradeTokens'

/** Farms Studio — R758 constitution rhythm. */
export const farmsStudioLayout = {
  ...premiumStudioLayout,
  ...studioConstitutionLayout,
  pageGridColumns: 3,
  pageGridGap: '14px',
  kpiGap: '12px',
  kpiHeight: premiumStudioLayout.kpiHeight,
  sparklineW: 48,
  sparklineH: 18,
  kpiDeltaGap: '16px',
  kpiSparkGap: '8px',
  featuredHeight: '270px',
  featuredMetricColWidth: '120px',
  filterHeight: '44px',
  filterMarginTop: '16px',
  gridGap: premiumStudioLayout.cardGap,
  gridMarginTop: '16px',
  farmCardHeight: '320px',
  farmCardHeightExpanded: 'auto',
  farmCardFooterHeight: 'auto',
  farmCardPadding: '16px',
  farmCardBtnHeight: premiumStudioLayout.btnHeight,
  farmCardBtnWidth: 'auto',
  farmCardAnalyzeWidth: 'auto',
  farmCardBtnGap: premiumStudioLayout.actionGroupGap,
  farmCardAprGap: '14px',
  farmCardMetricsFooterGap: '16px',
  farmCardMetricRowGap: '12px',
  farmCardMetricColGap: '16px',
  featuredGridAdjust: '12px',
  activityHeight: '320px',
  activityMarginTop: '0',
  activityRowHeight: premiumStudioLayout.timelineRowHeight,
  activityCellPadding: '18px',
} as const

/** R763 — institutional numeric typography aligned with Trade / Home / Pools. */
export const farmsTypography = {
  ...tradeTypography,
  kpiValue: tradeTypography.statValue,
  cardMetricValue: tradeTypography.statValue,
  analyzeValue: { size: '13px', weight: 700, lineHeight: '1.3' },
} as const

export const farmsStudioColors = {
  ...premiumStudioColors,
  panel: premiumStudioColors.card,
  panelAlt: premiumStudioColors.card,
  goldBright: premiumStudioColors.gold,
  green: premiumStudioColors.green,
  red: premiumStudioColors.red,
  purple: '#A78BFA',
  border: premiumStudioColors.cardBorder,
  rowBorder: premiumStudioColors.divider,
  goldBorder: 'rgba(212,175,55,0.45)',
  previewBadgeBg: premiumStudioColors.goldBg,
} as const

export const FARMS_STUDIO_PREVIEW_LABEL = 'Live Runtime'
export const FARMS_ACTIVITY_PREVIEW_LABEL = 'LIVE'
export const FARMS_FONT_DISPLAY = PREMIUM_FONT_DISPLAY
