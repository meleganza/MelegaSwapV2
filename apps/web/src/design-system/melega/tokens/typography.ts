/**
 * Melega DEX design system — typography tokens.
 * Backed by DS001.1 (Sora → Inter → system-ui). Legacy size keys snap to scale.
 */
import {
  ds001FontFamily,
  ds001FontSize,
  ds001FontWeight,
  ds001TypeRoles,
} from './ds001/typography'

export const fontFamily = {
  body: ds001FontFamily.body,
  display: ds001FontFamily.display,
  sans: ds001FontFamily.sans,
} as const

/**
 * Legacy size keys remapped onto the DS001.1 scale only.
 * Removed: 11px, 14px, 20px, 24px, 30px, 42px (outside allow-list).
 */
export const fontSize = {
  micro: ds001FontSize.smallLabel,
  xs: ds001FontSize.smallLabel,
  sm: ds001FontSize.smallLabel,
  md: ds001FontSize.caption,
  base: ds001FontSize.body,
  lg: ds001FontSize.body,
  xl: ds001FontSize.bodyLarge,
  '2xl': ds001FontSize.bodyLarge,
  '3xl': ds001FontSize.h3,
  '4xl': ds001FontSize.h3,
  '5xl': ds001FontSize.h2,
  '6xl': ds001FontSize.h1,
  '7xl': ds001FontSize.h1,
  hero: ds001FontSize.hero,
  h1: ds001FontSize.h1,
  h2: ds001FontSize.h2,
  h3: ds001FontSize.h3,
  body: ds001FontSize.body,
  bodyLarge: ds001FontSize.bodyLarge,
  caption: ds001FontSize.caption,
  smallLabel: ds001FontSize.smallLabel,
} as const

export const fontWeight = {
  regular: ds001FontWeight.regular,
  medium: ds001FontWeight.medium,
  semibold: ds001FontWeight.semibold,
  bold: ds001FontWeight.bold,
  /** @deprecated DS001.1 max weight is 700 — alias of bold. */
  extrabold: ds001FontWeight.bold,
  /** @deprecated DS001.1 max weight is 700 — alias of bold. */
  heavy: ds001FontWeight.bold,
} as const

/** Unitless ratios for legacy styled-components; role px line-heights live on `roles`. */
export const lineHeight = {
  tight: 1.125,
  snug: 1.2,
  normal: 1.5,
  relaxed: 1.55,
  hero: ds001TypeRoles.hero.lineHeight,
  h1: ds001TypeRoles.h1.lineHeight,
  h2: ds001TypeRoles.h2.lineHeight,
  h3: ds001TypeRoles.h3.lineHeight,
  body: ds001TypeRoles.body.lineHeight,
  bodyLarge: ds001TypeRoles.bodyLarge.lineHeight,
  caption: ds001TypeRoles.caption.lineHeight,
} as const

export const typography = {
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  roles: ds001TypeRoles,
} as const

export type MelegaTypography = typeof typography
