/**
 * Melega DEX design system — color tokens.
 * Backed by DS001.1 foundations. Legacy keys preserved as aliases.
 */
import { ds001Colors, ds001GoldSoft } from './ds001/colors'

export const colors = {
  background: ds001Colors.background,
  canvas: ds001Colors.background,
  surface1: ds001Colors.surface,
  surface2: ds001Colors.surfaceElevated,
  surface3: ds001Colors.surfaceElevated,
  gold: ds001Colors.primaryGold,
  goldHover: ds001Colors.hoverGold,
  /** @deprecated DS001.1 forbids glow — alias of hover gold. */
  goldGlow: ds001Colors.hoverGold,
  goldSoft: ds001GoldSoft,
  goldPressed: ds001Colors.pressedGold,
  border: ds001Colors.border,
  borderStrong: ds001Colors.cardHoverBorder,
  divider: ds001Colors.divider,
  textPrimary: ds001Colors.primaryText,
  textSecondary: ds001Colors.secondaryText,
  textMuted: ds001Colors.muted,
  green: ds001Colors.success,
  red: ds001Colors.danger,
  warning: ds001Colors.warning,
  info: ds001Colors.info,
  placeholder: ds001Colors.placeholder,
} as const

export type MelegaColors = typeof colors
