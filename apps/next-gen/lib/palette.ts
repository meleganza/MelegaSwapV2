/** Pearl-gray sheet on a graphite ink. Hex values are asserted against globals.css. */
export const palette = {
  canvas: '#e4e1db',
  sheet: '#f4f2ee',
  ink: '#1c1c1c',
  muted: '#5e5a55',
  line: '#ddd9d2',
  inverse: '#f4f2ee',
  graphite: '#1c1c1c',
} as const

export type PaletteName = keyof typeof palette
