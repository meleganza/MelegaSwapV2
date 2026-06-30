import type { RadiusToken, SpacingToken } from '../tokens'

export type MelegaViewport = 'mobile' | 'tablet' | 'desktop' | 'auto'

/** Shared layout props every design-system component may accept. */
export interface MelegaLayoutProps {
  padding?: SpacingToken
  margin?: SpacingToken
  radius?: RadiusToken
  disabled?: boolean
  loading?: boolean
  /** Force mobile density regardless of viewport. */
  mobile?: boolean
  /** Force desktop density regardless of viewport. */
  desktop?: boolean
}

export interface MelegaInteractiveProps extends MelegaLayoutProps {
  active?: boolean
}
