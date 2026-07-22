/**
 * DS001.1 — Global Design System · Color foundations.
 * Single source of truth. Do not invent colors outside this palette.
 */
export const ds001Colors = {
  primaryGold: '#F4C430',
  hoverGold: '#FFD34D',
  pressedGold: '#D9A500',

  background: '#080808',
  surface: '#121212',
  surfaceElevated: '#181818',

  border: '#2A2A2A',
  divider: '#202020',

  primaryText: '#FFFFFF',
  secondaryText: '#B5B5B5',
  muted: '#7A7A7A',

  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',

  /** Disabled primary button fill (DS001.1 §14). */
  disabled: '#4B4B4B',
  disabledText: '#888888',

  /** Search / elevated control chrome (DS001.1 §7). */
  controlSurface: '#121212',
  controlBorder: '#232323',
  placeholder: '#6D6D6D',

  /** Header chrome reserved for DS001.2 (tokens only). */
  headerBackground: 'rgba(8,8,8,0.92)',
  headerBorder: '#1A1A1A',
  navInactive: '#D4D4D4',
  navHoverBackground: '#141414',
  cardHoverBackground: '#151515',
  cardHoverBorder: '#3A3A3A',
  ghostHover: 'rgba(255,255,255,0.05)',
} as const

export type Ds001Colors = typeof ds001Colors

/** Soft gold wash derived from primary gold (no glow effects). */
export const ds001GoldSoft = 'rgba(244,196,48,0.14)' as const
