import { premiumStudioColors, premiumStudioLayout, PREMIUM_FONT_BODY, PREMIUM_FONT_DISPLAY } from 'design-system/melega/tokens/premiumStudio'

export const IT_FONT_DISPLAY = PREMIUM_FONT_DISPLAY
export const IT_FONT_BODY = PREMIUM_FONT_BODY

/** Import Existing Token — R200 premium alignment. */
export const importTokenLayout = {
  ...premiumStudioLayout,
  colLeft: '760px',
  colRight: '360px',
  heroH: '240px',
  btnTransition: premiumStudioLayout.hoverTransition,
  cardLift: '0px',
  arrowAnim: '700ms',
  manifestFade: '300ms',
  gaugeAnim: '900ms',
} as const

export const importTokenColors = {
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
  transition: premiumStudioLayout.hoverTransition,
} as const
