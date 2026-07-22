/**
 * DS001.1 — Global Design System · Foundation barrel.
 * Import from `design-system/melega/tokens/ds001` going forward.
 */
export { ds001Colors, ds001GoldSoft, type Ds001Colors } from './colors'
export {
  ds001FontFamily,
  ds001FontSize,
  ds001FontWeight,
  ds001TypeRoles,
  ds001Typography,
  type Ds001Typography,
} from './typography'
export {
  DS001_SPACING_SCALE,
  ds001Spacing,
  assertDs001Spacing,
  snapToDs001Spacing,
  type Ds001Spacing,
  type Ds001SpacingPx,
  type Ds001SpacingToken,
} from './spacing'
export { ds001Radius, type Ds001Radius, type Ds001RadiusToken } from './radius'
export { ds001Shadows, type Ds001Shadows } from './shadows'
export { ds001Layout, type Ds001Layout } from './layout'
export { ds001Buttons, type Ds001Buttons } from './buttons'
export { ds001Icons, type Ds001Icons } from './icons'

import { ds001Colors, ds001GoldSoft } from './colors'
import { ds001Typography } from './typography'
import { ds001Spacing } from './spacing'
import { ds001Radius } from './radius'
import { ds001Shadows } from './shadows'
import { ds001Layout } from './layout'
import { ds001Buttons } from './buttons'
import { ds001Icons } from './icons'

/** Unified DS001.1 foundation export. */
export const ds001Tokens = {
  version: '1.0' as const,
  mission: 'DS001.1' as const,
  colors: ds001Colors,
  goldSoft: ds001GoldSoft,
  typography: ds001Typography,
  spacing: ds001Spacing,
  radius: ds001Radius,
  shadows: ds001Shadows,
  layout: ds001Layout,
  buttons: ds001Buttons,
  icons: ds001Icons,
} as const

export type Ds001Tokens = typeof ds001Tokens
