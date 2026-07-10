import { premiumStudioColors, premiumStudioLayout, PREMIUM_FONT_DISPLAY } from 'design-system/melega/tokens/premiumStudio'
import { studioConstitutionLayout } from 'design-system/melega/tokens/studioConstitution'
import { tradeLayout, tradeTypography } from 'views/Trade/tradeTokens'

/** Liquidity Studio — R758 constitution + R761 Trade-aligned typography. */
export const liquidityStudioLayout = {
  ...premiumStudioLayout,
  ...studioConstitutionLayout,
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
  previewHeight: '100%',
  previewMinHeight: '440px',
  builderMinHeight: '440px',
  builderPairHeight: premiumStudioLayout.btnHeight,
  tokenRowHeight: '82px',
  swapIconSize: '34px',
  ratioRowHeight: '20px',
  slippageRowHeight: '22px',
  metricCardHeight: '78px',
  metricsAfterBarsGap: '14px',
  ilChartHeight: '82px',
  ilMarginTop: '14px',
  barsAreaHeight: '100px',
  liquidityBarWidth: '34px',
  liquidityBarHeight: '80px',
  connectButtonHeight: premiumStudioLayout.btnHeight,
  marketIntelHeight: 'auto',
  lpInfoMinHeight: '196px',
  aiAdvisorHeight: '180px',
  topPoolsHeight: '180px',
  activityHeight: tradeLayout.recentSwapsHeight,
  activityHeaderHeight: tradeLayout.swapTableHeadHeight,
  activityRowHeight: tradeLayout.swapRowHeight,
  activityCellPadding: '16px',
  executionStepGap: '10px',
  executionButtonGap: '14px',
} as const

/** R761 — canonical numeric typography (execution workflow reference). */
export const liquidityTypography = {
  ...tradeTypography,
  panelTitle: { size: '18px', weight: 800, lineHeight: '1.2' },
  sectionTitle: { size: '16px', weight: 800, lineHeight: '1.2' },
  builderAmount: { size: '32px', weight: 700, lineHeight: '32px' },
  lpInfoLabel: { size: '12px', weight: 600, lineHeight: '1.2' },
  lpInfoValue: { size: '14px', weight: 700, lineHeight: '1.3' },
  stepLabel: { size: '12px', weight: 600, lineHeight: '1.35' },
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
