/** Melega DEX design system — animation tokens. */
export const animation = {
  hover: '150ms ease',
  cardHover: '150ms ease',
  expand: '220ms ease',
  fade: '180ms ease',
  glow: '8s ease-in-out',
  ticker: '42s linear',
  heroParticles: '9s ease-in-out',
  marketRotate: '8s linear',
  stars: '7s ease-in-out',
  pulse: '2.4s ease-in-out',
  switchRotate: '250ms ease-out',
} as const

export type MelegaAnimation = typeof animation
