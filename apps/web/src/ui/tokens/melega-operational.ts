/** Shared Melega Economic OS presentation tokens — design system source of truth. */
export const melegaOperational = {
  bg: '#000000',
  surface: '#111111',
  surfaceSecondary: '#1A1A1A',
  surfaceGlass: 'rgba(17, 17, 17, 0.92)',
  gold: '#D4AF37',
  goldHighlight: '#E8C547',
  text: '#FFFFFF',
  textSecondary: '#9E9E9E',
  success: '#22C55E',
  border: 'rgba(255, 255, 255, 0.06)',
  borderGold: 'rgba(212, 175, 55, 0.2)',
  radius: '16px',
  radiusSm: '12px',
  radiusLg: '20px',
  contentMaxWidth: '1400px',
  sectionGap: '48px',
  cardPadding: '28px 32px',
  fontDisplay: '"Orbitron", sans-serif',
  fontBody: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
  transition: '200ms ease',
} as const

export type MelegaOperationalTokens = typeof melegaOperational
