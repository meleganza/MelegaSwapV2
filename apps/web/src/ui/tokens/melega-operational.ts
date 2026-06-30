/** Shared Melega operational presentation tokens — not feature-owned. */
export const melegaOperational = {
  bg: '#000000',
  surface: '#111111',
  surfaceGlass: 'rgba(17, 17, 17, 0.88)',
  gold: '#D4AF37',
  goldHighlight: '#FFC842',
  text: '#FFFFFF',
  textSecondary: '#A9A9A9',
  success: '#22C55E',
  border: 'rgba(255, 255, 255, 0.08)',
  borderGold: 'rgba(212, 175, 55, 0.22)',
  radius: '14px',
  radiusSm: '10px',
  fontDisplay: '"Orbitron", sans-serif',
  fontBody: '"Inter", sans-serif',
  transition: '180ms ease',
} as const

export type MelegaOperationalTokens = typeof melegaOperational
