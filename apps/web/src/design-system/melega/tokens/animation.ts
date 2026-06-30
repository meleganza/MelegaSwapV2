/** Melega DEX design system — animation tokens. */
export const animation = {
  hover: '150ms ease',
  expand: '200ms ease',
  fade: '180ms ease',
  glow: '9s ease-in-out',
  ticker: '45s linear',
} as const

export type MelegaAnimation = typeof animation
