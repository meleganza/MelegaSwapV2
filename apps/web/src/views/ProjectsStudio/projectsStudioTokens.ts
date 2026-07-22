import { premiumStudioColors, premiumStudioLayout } from 'design-system/melega/tokens/premiumStudio'
import { studioConstitutionLayout } from 'design-system/melega/tokens/studioConstitution'
import { ds001FontFamily, ds001Spacing } from 'design-system/melega/tokens/ds001'

/** Projects Studio tokens — DS001.1 foundations + constitution rhythm. */
export const PR_FONT_DISPLAY = ds001FontFamily.display
export const PR_FONT_BODY = ds001FontFamily.body

export const projectsStudioLayout = {
  ...premiumStudioLayout,
  ...studioConstitutionLayout,
  headerHeight: studioConstitutionLayout.heroMinHeight,
  kpiHeight: premiumStudioLayout.kpiHeight,
  kpiPadding: '22px',
  featuredHeight: '380px',
  advisorHeight: '380px',
  advisorPadding: '24px',
  advisorRowHeight: '56px',
  advisorRowGap: '12px',
  featuredSplitLeft: '68%',
  featuredSplitRight: '32%',
  featuredMetricGapY: '16px',
  featuredMetricGapX: ds001Spacing[32],
  featuredChartHeight: '220px',
  featuredChartHeightMobile: '143px',
  cardSplitLeft: '65%',
  cardSplitRight: '35%',
  cardRightPanePadding: '8px',
  cardBtnGap: '12px',
  cardActionRowSpacing: '8px',
  filterPillHeight: '44px',
  projectCardHeight: '340px',
  projectBtnHeight: '46px',
  projectBtnWidth: '210px',
  featuredBtnGap: '12px',
  featuredActionGroupMarginTop: '8px',
  featuredMobileBtnRowGap: '20px',
  activityHeight: '320px',
  activityRowHeight: '68px',
  activityListPaddingLeft: '12px',
  gridColumns: 1,
  mobileBottomPad: 'calc(96px + env(safe-area-inset-bottom, 0px))',
  stackBreakpoint: '1024px',
} as const

export const projectsStudioColors = {
  ...premiumStudioColors,
  goldBright: premiumStudioColors.gold,
  chartBg: premiumStudioColors.card,
  goldBorder: 'rgba(244, 196, 48,0.55)',
} as const

export const projectsStudioType = {
  pageTitle: '52px',
  pageSubtitle: '16px',
  pageSubtitleMax: '720px',
  kpiMetric: '22px',
  kpiLabel: '13px',
  featuredName: '40px',
  featuredPrice: '42px',
  headerPrimaryW: '220px',
  headerPrimaryH: '48px',
} as const

export const PROJECTS_ACTIVITY_PREVIEW_LABEL = 'LIVE'
