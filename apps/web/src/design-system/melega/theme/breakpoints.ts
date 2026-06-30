/** Responsive breakpoints — mobile 390, tablet 1024, desktop 1440. */
export const breakpoints = {
  mobile: 390,
  tablet: 1024,
  desktop: 1440,
} as const

export type MelegaBreakpoints = typeof breakpoints
