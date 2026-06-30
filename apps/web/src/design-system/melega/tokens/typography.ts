/** Melega DEX design system — typography tokens (DS-001). */
export const fontFamily = {
  body: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
  wordmark: '"Orbitron", sans-serif',
} as const

export const fontSize = {
  xs: '11px',
  sm: '12px',
  md: '13px',
  base: '14px',
  lg: '16px',
  xl: '18px',
  '2xl': '20px',
  '3xl': '24px',
  '4xl': '32px',
  '5xl': '40px',
} as const

export const fontWeight = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const

export const lineHeight = {
  tight: 1.15,
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
