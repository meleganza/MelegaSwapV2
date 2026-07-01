/** Melega DEX design system — animation tokens. */
export const animation = {
  hover: '150ms ease',
  cardHover: '150ms ease',
  expand: '220ms ease',
  fade: '250ms ease',
  glow: '8s ease-in-out',
  ticker: '45s linear',
  stars: '7s ease-in-out',
  pulse: '2.5s ease-in-out',
  switchRotate: '250ms ease-out',
} as const

export type MelegaAnimation = typeof animation
