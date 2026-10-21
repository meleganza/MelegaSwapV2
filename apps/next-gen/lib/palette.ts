/** Pearl-gray sheet on a graphite ink. Hex values are asserted against globals.css. */
export const palette = {
  canvas: '#e8e5de',
  sheet: '#f8f6f1',
  ink: '#171816',
  muted: '#66645e',
  line: '#d9d5cc',
  inverse: '#f8f6f1',
  graphite: '#171816',
} as const

export type PaletteName = keyof typeof palette
