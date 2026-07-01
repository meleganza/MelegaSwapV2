/** Melega DEX design system — animation tokens. */
export const animation = {
  hover: '150ms ease',
  cardHover: '180ms ease',
  expand: '200ms ease',
  fade: '180ms ease',
  glow: '9s ease-in-out',
  ticker: '45s linear',
  stars: '7s ease-in-out',
  pulse: '1.5s ease-in-out',
  switchRotate: '250ms ease-out',
} as const

export type MelegaAnimation = typeof animation
