/** Melega DEX design system — typography tokens (Home V2 cockpit). */
export const fontFamily = {
  body: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
} as const

export const fontSize = {
  micro: '11px',
  xs: '11px',
  sm: '12px',
  md: '13px',
  base: '14px',
  lg: '16px',
  xl: '18px',
  '2xl': '20px',
  '3xl': '24px',
  '4xl': '28px',
  '5xl': '30px',
  '6xl': '42px',
  '7xl': '48px',
} as const

export const fontWeight = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  heavy: 850,
} as const

export const lineHeight = {
  tight: 1.05,
  snug: 1.15,
  normal: 1.45,
  relaxed: 1.6,
} as const

export const typography = {
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
} as const

export type MelegaTypography = typeof typography
