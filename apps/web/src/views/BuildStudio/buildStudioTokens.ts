import { premiumStudioColors, premiumStudioLayout, PREMIUM_FONT_BODY, PREMIUM_FONT_DISPLAY } from 'design-system/melega/tokens/premiumStudio'

export const BS_FONT_DISPLAY = PREMIUM_FONT_DISPLAY
export const BS_FONT_BODY = PREMIUM_FONT_BODY

/** Build Studio — R200 premium alignment. */
export const buildStudioLayout = {
  ...premiumStudioLayout,
  kpiWidth: '212px',
  kpiHeight: premiumStudioLayout.kpiHeight,
  kpiGap: '16px',
  colCreate: 'minmax(240px, 0.75fr)',
  colImport: 'minmax(320px, 1.8fr)',
  colRight: 'minmax(240px, 0.65fr)',
  createTokenH: 'auto',
  importTokenH: 'auto',
  advisorH: '460px',
  secondRowCardW: 'minmax(0, 1fr)',
  secondRowCardH: 'auto',
  secondRowCardMinH: '420px',
  validationH: '260px',
  recentBuildsH: '380px',
  btnTransition: premiumStudioLayout.hoverTransition,
  cardLift: '0px',
  arrowAnim: '700ms',
  manifestFade: '300ms',
  progressAnim: '900ms',
} as const

export const buildStudioColors = {
  ...premiumStudioColors,
  pageBg: premiumStudioColors.canvas,
  panel: premiumStudioColors.card,
  white: premiumStudioColors.text,
  body: premiumStudioColors.summary,
  label: premiumStudioColors.muted,
  border: premiumStudioColors.cardBorder,
  goldHover: premiumStudioColors.cardBorderHover,
  yellow: premiumStudioColors.gold,
  gray: premiumStudioColors.muted,
  shadow: '0 16px 42px rgba(0,0,0,0.30)',
  transition: premiumStudioLayout.hoverTransition,
} as const
