import { premiumStudioColors, premiumStudioLayout } from 'design-system/melega/tokens/premiumStudio'

/** Pools Studio — R200 premium alignment. */
export const poolsStudioLayout = {
  ...premiumStudioLayout,
  pageGridColumns: 12,
  pageGridGap: '16px',
  kpiGap: '12px',
  kpiHeight: premiumStudioLayout.kpiHeight,
  featuredHeight: '380px',
  advisorWidth: '334px',
  featuredGridAdjust: '14px',
  filterHeight: '44px',
  poolCardHeight: '320px',
  poolCardHeightExpanded: 'auto',
  poolCardFooterHeight: 'auto',
  poolCardBtnHeight: premiumStudioLayout.btnHeight,
  poolCardStakeWidth: 'auto',
  poolCardAnalyzeWidth: 'auto',
  poolCardBtnGap: premiumStudioLayout.actionGroupGap,
  poolCardAprGap: '14px',
  poolCardMetricsFooterGap: '16px',
  poolCardMetricRowGap: '24px',
  poolCardMetricColGap: '26px',
  featuredAprGap: '16px',
  featuredMetricsBtnGap: '18px',
  createCtaHeight: '150px',
  analyticsHeight: '150px',
  activityHeight: '320px',
  activityRowHeight: premiumStudioLayout.timelineRowHeight,
  donutDiameter: 170,
  donutDiameterMobile: 140,
  sparklineW: 48,
  sparklineH: 18,
  kpiDeltaGap: '16px',
  kpiSparkGap: '8px',
} as const

export const poolsStudioColors = {
  ...premiumStudioColors,
  panel: premiumStudioColors.card,
  card: premiumStudioColors.card,
  cardHover: '#171717',
  goldBright: premiumStudioColors.gold,
  blue: '#4DA3FF',
  purple: '#A78BFA',
  border: premiumStudioColors.cardBorder,
  rowBorder: premiumStudioColors.divider,
  goldBorder: 'rgba(212,175,55,0.55)',
  previewBadgeBg: premiumStudioColors.goldBg,
  ctaGradient: 'linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(212,175,55,0.04) 50%, rgba(5,5,5,0) 100%)',
} as const

export const POOLS_STUDIO_PREVIEW_LABEL = 'PREVIEW LAYOUT'
export const POOLS_ACTIVITY_PREVIEW_LABEL = 'Indexed Preview'
