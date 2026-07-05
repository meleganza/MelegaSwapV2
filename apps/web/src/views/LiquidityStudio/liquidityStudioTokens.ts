import { premiumStudioColors, premiumStudioLayout, PREMIUM_FONT_DISPLAY } from 'design-system/melega/tokens/premiumStudio'

/** Liquidity Studio — R200 premium alignment. */
export const liquidityStudioLayout = {
  ...premiumStudioLayout,
  gridWidth: '100%',
  leftWidth: '340px',
  centerWidth: '430px',
  rightWidth: '300px',
  columnGap: '14px',
  verticalRhythm: '16px',
  panelRadius: premiumStudioLayout.cardRadius,
  rightPanelRadius: premiumStudioLayout.cardRadius,
  panelPadding: premiumStudioLayout.cardPadding,
  previewPanelPaddingTop: '22px',
  rightPanelPadding: '16px',
  builderHeight: 'auto',
  previewHeight: 'auto',
  builderMinHeight: '440px',
  builderPairHeight: premiumStudioLayout.btnHeight,
  tokenRowHeight: '82px',
  sectionGap: premiumStudioLayout.sectionGap,
  swapIconSize: '34px',
  ratioRowHeight: '20px',
  slippageRowHeight: '22px',
  metricCardHeight: '78px',
  metricsAfterBarsGap: '18px',
  ilChartHeight: '82px',
  ilMarginTop: '18px',
  barsAreaHeight: '112px',
  liquidityBarWidth: '34px',
  liquidityBarHeight: '88px',
  connectButtonHeight: premiumStudioLayout.btnHeight,
  marketIntelHeight: '180px',
  aiAdvisorHeight: '180px',
  topPoolsHeight: '180px',
  activityHeight: '320px',
  activityHeaderHeight: '36px',
  activityRowHeight: premiumStudioLayout.timelineRowHeight,
  activityCellPadding: '16px',
} as const

export const liquidityStudioColors = {
  ...premiumStudioColors,
  panel: premiumStudioColors.card,
  panelGradient: premiumStudioColors.card,
  surfaceSecondary: '#181818',
  goldBright: premiumStudioColors.gold,
  yellow: premiumStudioColors.gold,
  border: premiumStudioColors.cardBorder,
  rowBorder: premiumStudioColors.divider,
  previewBadgeBg: premiumStudioColors.goldBg,
} as const

export const LIQUIDITY_STUDIO_PREVIEW_LABEL = 'PREVIEW LAYOUT'
export const LIQUIDITY_FONT_DISPLAY = PREMIUM_FONT_DISPLAY
