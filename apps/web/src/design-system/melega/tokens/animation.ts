/**
 * Melega DEX design system — animation tokens.
 * Card/hover timings aligned to DS001.1 180ms. Glow effects deprecated.
 */
export const animation = {
  hover: '180ms ease',
  cardHover: '180ms ease',
  expand: '220ms ease',
  fade: '180ms ease',
  /** @deprecated DS001.1 forbids glow effects — do not use in new UI. */
  glow: '8s ease-in-out',
  ticker: '42s linear',
  heroParticles: '9s ease-in-out',
  marketRotate: '8s linear',
  stars: '7s ease-in-out',
  pulse: '2.4s ease-in-out',
  switchRotate: '250ms ease-out',
} as const

export type MelegaAnimation = typeof animation
