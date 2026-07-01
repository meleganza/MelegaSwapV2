/** Melega DEX design system — color tokens (Home V2 cockpit). */
export const colors = {
  background: '#0A0A0A',
  canvas: '#0A0A0A',
  surface1: '#101010',
  surface2: '#171717',
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
  green: '#00E676',
  red: '#EF4444',
} as const

export type MelegaColors = typeof colors
