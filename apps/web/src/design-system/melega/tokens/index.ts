export { colors, type MelegaColors } from './colors'
export { typography, fontFamily, fontSize, fontWeight, lineHeight, type MelegaTypography } from './typography'
export { spacing, type MelegaSpacing, type SpacingToken } from './spacing'
export { radius, type MelegaRadius, type RadiusToken } from './radius'
export { animation, type MelegaAnimation } from './animation'
export {
  PREMIUM_EMPTY,
  PREMIUM_FONT_BODY,
  PREMIUM_FONT_DISPLAY,
  premiumStudioColors,
  premiumStudioLayout,
  premiumStudioShadows,
  premiumStudioType,
} from './premiumStudio'
export {
  STUDIO_FONT_BODY,
  STUDIO_FONT_DISPLAY,
  STUDIO_PAGE_TITLES,
  studioConstitutionColors,
  studioConstitutionLayout,
  studioConstitutionType,
} from './studioConstitution'
export {
  STUDIO_KPI_VALUE,
  STUDIO_LIVE_RUNTIME_LABEL,
  displayStudioMetric,
  isStudioMetricUnavailable,
} from './studioDisplay'

export {
  ds001Tokens,
  ds001Colors,
  ds001GoldSoft,
  ds001Typography,
  ds001FontFamily,
  ds001FontSize,
  ds001FontWeight,
  ds001TypeRoles,
  ds001Spacing,
  DS001_SPACING_SCALE,
  assertDs001Spacing,
  snapToDs001Spacing,
  ds001Radius,
  ds001Shadows,
  ds001Layout,
  ds001Buttons,
  ds001Icons,
} from './ds001'

import { colors } from './colors'
import { typography } from './typography'
import { spacing } from './spacing'
import { radius } from './radius'
import { animation } from './animation'
import { ds001Tokens } from './ds001'

/**
 * Unified token export — DS001.1 is the single source of truth.
 * Legacy `colors` / `spacing` / `radius` / `typography` keys are compatibility aliases.
 */
export const melegaTokens = {
  foundation: ds001Tokens,
  colors,
  typography,
  spacing,
  radius,
  animation,
} as const

export type MelegaTokens = typeof melegaTokens
