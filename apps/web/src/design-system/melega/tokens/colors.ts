/** Melega DEX design system — color tokens (Home V2 cockpit). */
export const colors = {
  background: '#050505',
  canvas: '#000000',
  surface1: '#0D0D0D',
  surface2: '#151515',
  surface3: '#1C1C1C',
  gold: '#D4AF37',
  goldHover: '#F4C542',
  goldGlow: '#FFD55A',
  goldSoft: 'rgba(212,175,55,0.13)',
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.14)',
  textPrimary: '#FFFFFF',
  textSecondary: '#B3B3B3',
  textMuted: '#707070',
  green: '#22C55E',
  red: '#EF4444',
} as const

export type MelegaColors = typeof colors
