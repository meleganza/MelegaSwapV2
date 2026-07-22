/**
 * Melega DEX design system — spacing tokens.
 * Backed by DS001.1 8px base allow-list. Legacy numeric keys preserved.
 *
 * Index semantics (legacy 4px-step keys → DS001.1 px values):
 * 1→4, 2→8, 3→12, 4→16, 5→20, 6→24, 8→32, 10→40, 12→48, 16→64, 20→80,
 * plus DS001.1 extensions 24→96, 32→128.
 */
import { ds001Spacing } from './ds001/spacing'

export const spacing = {
  1: ds001Spacing[4],
  2: ds001Spacing[8],
  3: ds001Spacing[12],
  4: ds001Spacing[16],
  5: ds001Spacing[20],
  6: ds001Spacing[24],
  8: ds001Spacing[32],
  10: ds001Spacing[40],
  12: ds001Spacing[48],
  16: ds001Spacing[64],
  20: ds001Spacing[80],
  /** DS001.1 extensions */
  24: ds001Spacing[96],
  32: ds001Spacing[128],
} as const

export type MelegaSpacing = typeof spacing
export type SpacingToken = keyof typeof spacing
