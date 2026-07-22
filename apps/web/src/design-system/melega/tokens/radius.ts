/**
 * Melega DEX design system — border radius tokens.
 * Backed by DS001.1 semantic radii. Legacy keys alias to nearest DS value.
 */
import { ds001Radius } from './ds001/radius'

export const radius = {
  /** Semantic DS001.1 */
  card: ds001Radius.card,
  input: ds001Radius.input,
  button: ds001Radius.button,
  badge: ds001Radius.badge,
  modal: ds001Radius.modal,
  search: ds001Radius.search,

  /** Legacy aliases → DS001.1 */
  sm: ds001Radius.button,
  md: ds001Radius.button,
  lg: ds001Radius.button,
  xl: ds001Radius.button,
  '2xl': ds001Radius.card,
  panel: ds001Radius.card,
  full: ds001Radius.badge,
} as const

export type MelegaRadius = typeof radius
export type RadiusToken = keyof typeof radius
