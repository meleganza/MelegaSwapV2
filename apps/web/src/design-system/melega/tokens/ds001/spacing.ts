/**
 * DS001.1 — Global Design System · Spacing foundations.
 * Base unit 8px. Only these values are allowed.
 */
export const DS001_SPACING_SCALE = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128] as const

export type Ds001SpacingPx = (typeof DS001_SPACING_SCALE)[number]

/** Named spacing tokens (px → CSS string). */
export const ds001Spacing = {
  4: '4px',
  8: '8px',
  12: '12px',
  16: '16px',
  20: '20px',
  24: '24px',
  32: '32px',
  40: '40px',
  48: '48px',
  64: '64px',
  80: '80px',
  96: '96px',
  128: '128px',
} as const

export type Ds001Spacing = typeof ds001Spacing
export type Ds001SpacingToken = keyof typeof ds001Spacing

export function assertDs001Spacing(px: number): asserts px is Ds001SpacingPx {
  if (!(DS001_SPACING_SCALE as readonly number[]).includes(px)) {
    throw new Error(`DS001.1: spacing ${px}px is not in the allow-list`)
  }
}

/** Snap arbitrary px to the nearest allowed DS001.1 spacing token (ties round up). */
export function snapToDs001Spacing(px: number): Ds001SpacingPx {
  let best: Ds001SpacingPx = DS001_SPACING_SCALE[0]
  let bestDist = Math.abs(px - best)
  for (const step of DS001_SPACING_SCALE) {
    const dist = Math.abs(px - step)
    if (dist < bestDist || (dist === bestDist && step > best)) {
      best = step
      bestDist = dist
    }
  }
  return best
}
