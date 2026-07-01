/** Melega DEX design system — border radius tokens. */
export const radius = {
  sm: '8px',
  md: '10px',
  lg: '12px',
  xl: '14px',
  '2xl': '18px',
  panel: '20px',
  full: '999px',
} as const

export type MelegaRadius = typeof radius
export type RadiusToken = keyof typeof radius
