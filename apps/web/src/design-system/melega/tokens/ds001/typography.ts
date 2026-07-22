/**
 * DS001.1 — Global Design System · Typography foundations.
 * Font: Sora → Inter → system-ui. Never use sizes outside this scale.
 */
export const ds001FontFamily = {
  sans: '"Sora", "Inter", system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
  /** Display uses the same family — Orbitron is retired by DS001.1. */
  display: '"Sora", "Inter", system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
  body: '"Sora", "Inter", system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
} as const

export const ds001TypeRoles = {
  hero: { size: '64px', weight: 700, lineHeight: '72px' },
  h1: { size: '48px', weight: 600, lineHeight: '56px' },
  h2: { size: '36px', weight: 600, lineHeight: '44px' },
  h3: { size: '28px', weight: 600, lineHeight: '34px' },
  bodyLarge: { size: '18px', weight: 400, lineHeight: '28px' },
  body: { size: '16px', weight: 400, lineHeight: '24px' },
  caption: { size: '13px', weight: 400, lineHeight: '18px' },
  smallLabel: {
    size: '12px',
    weight: 500,
    lineHeight: '18px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
  },
} as const

/** Flat size scale — only DS001.1 sizes. */
export const ds001FontSize = {
  smallLabel: ds001TypeRoles.smallLabel.size,
  caption: ds001TypeRoles.caption.size,
  body: ds001TypeRoles.body.size,
  bodyLarge: ds001TypeRoles.bodyLarge.size,
  h3: ds001TypeRoles.h3.size,
  h2: ds001TypeRoles.h2.size,
  h1: ds001TypeRoles.h1.size,
  hero: ds001TypeRoles.hero.size,
  /** Nav / search control sizes from DS001.1 §6–7 */
  nav: '16px',
  search: '15px',
} as const

export const ds001FontWeight = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const

export type Ds001Typography = {
  fontFamily: typeof ds001FontFamily
  roles: typeof ds001TypeRoles
  fontSize: typeof ds001FontSize
  fontWeight: typeof ds001FontWeight
}

export const ds001Typography: Ds001Typography = {
  fontFamily: ds001FontFamily,
  roles: ds001TypeRoles,
  fontSize: ds001FontSize,
  fontWeight: ds001FontWeight,
}
