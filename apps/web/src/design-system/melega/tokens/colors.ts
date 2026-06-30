/** Melega DEX design system — color tokens (DS-001). */
export const colors = {
  canvas: '#000000',
  surface1: '#0A0A0A',
  surface2: '#111111',
  surface3: '#171717',
  gold: '#D4AF37',
  goldHover: '#E8C547',
  goldSoft: 'rgba(212,175,55,0.12)',
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.14)',
  textPrimary: '#FFFFFF',
  textSecondary: '#A8A8A8',
  textMuted: '#707070',
  green: '#22C55E',
  red: '#EF4444',
} as const

export type MelegaColors = typeof colors
