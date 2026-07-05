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
  premiumStudioType,
} from './premiumStudio'

import { colors } from './colors'
import { typography } from './typography'
import { spacing } from './spacing'
import { radius } from './radius'
import { animation } from './animation'

/** Unified token export — single source of truth for Melega DEX UI. */
export const melegaTokens = {
  colors,
  typography,
  spacing,
  radius,
  animation,
} as const

export type MelegaTokens = typeof melegaTokens
