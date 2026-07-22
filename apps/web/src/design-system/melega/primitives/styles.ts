import { css } from 'styled-components'
import { spacing, radius as radiusTokens } from '../tokens'
import { ds001Colors } from '../tokens/ds001/colors'
import type { RadiusToken, SpacingToken } from '../tokens'
import { media } from '../theme'

export const pad = (token?: SpacingToken) => (token ? spacing[token] : undefined)
export const rad = (token?: RadiusToken) => (token ? radiusTokens[token] : undefined)

export const layoutStyles = (opts: {
  padding?: SpacingToken
  margin?: SpacingToken
  radius?: RadiusToken
  mobile?: boolean
  desktop?: boolean
}) => css`
  ${opts.padding && `padding: ${spacing[opts.padding]};`}
  ${opts.margin && `margin: ${spacing[opts.margin]};`}
  ${opts.radius && `border-radius: ${radiusTokens[opts.radius]};`}

  ${opts.mobile &&
  css`
    ${media.tabletUp} {
      display: none;
    }
  `}

  ${opts.desktop &&
  css`
    ${media.mobile} {
      display: none;
    }
  `}
`

export const disabledStyles = css`
  opacity: 0.45;
  pointer-events: none;
  cursor: not-allowed;
`

export const loadingStyles = css`
  opacity: 0.7;
  pointer-events: none;
  cursor: wait;
`

export const focusRing = css`
  &:focus-visible {
    outline: 2px solid rgba(244, 196, 48, 0.55);
    outline-offset: 2px;
  }
`

/** Prefer `ds001Colors.primaryGold` for new focus treatments. */
export const focusRingGold = ds001Colors.primaryGold
