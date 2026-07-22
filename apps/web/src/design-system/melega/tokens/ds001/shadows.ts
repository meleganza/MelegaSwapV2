/**
 * DS001.1 — Global Design System · Shadow foundations.
 * Default none. Never use heavy glowing effects.
 */
export const ds001Shadows = {
  default: 'none',
  hover: '0 8px 24px rgba(0,0,0,0.18)',
  modal: '0 24px 80px rgba(0,0,0,0.45)',
} as const

export type Ds001Shadows = typeof ds001Shadows
