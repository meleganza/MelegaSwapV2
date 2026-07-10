import { premiumStudioColors, premiumStudioLayout, PREMIUM_FONT_BODY, PREMIUM_FONT_DISPLAY } from 'design-system/melega/tokens/premiumStudio'
import { studioConstitutionLayout } from 'design-system/melega/tokens/studioConstitution'

export const BS_FONT_DISPLAY = PREMIUM_FONT_DISPLAY
export const BS_FONT_BODY = PREMIUM_FONT_BODY

/** Build Studio — R758 constitution rhythm. */
export const buildStudioLayout = {
  ...premiumStudioLayout,
  ...studioConstitutionLayout,
  kpiWidth: '212px',
  kpiHeight: premiumStudioLayout.kpiHeight,
  kpiGap: '16px',
  colCreate: 'minmax(280px, 0.85fr)',
  colImport: 'minmax(360px, 1.6fr)',
  colRight: 'minmax(260px, 0.7fr)',
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
