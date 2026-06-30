import React from 'react'
import styled from 'styled-components'
import { colors, typography, spacing, radius, animation } from '../../tokens'
import { media } from '../../theme'
import { focusRing, layoutStyles } from '../../primitives'
import type { MelegaLayoutProps } from '../../primitives'

export interface MelegaSearchBarProps extends MelegaLayoutProps {
  placeholder?: string
  shortcut?: string
  value?: string
  onChange?: (value: string) => void
  onFocus?: () => void
}

const Wrap = styled.div<{
  $padding?: MelegaLayoutProps['padding']
  $margin?: MelegaLayoutProps['margin']
  $radius?: MelegaLayoutProps['radius']
}>`
  display: flex;
  align-items: center;
  gap: ${spacing[3]};
  height: 42px;
  padding: 0 ${spacing[4]};
  background: ${colors.surface1};
  border: 1px solid ${colors.borderStrong};
  border-radius: ${radius.lg};
  box-shadow: none;
  transition: border-color ${animation.hover};

  &:hover,
  &:focus-within {
    border-color: rgba(255, 255, 255, 0.18);
  }

  ${({ $padding, $margin, $radius: r }) => layoutStyles({ padding: $padding, margin: $margin, radius: r })}

  ${media.mobile} {
    height: 40px;
    width: 100%;
  }

  ${media.desktopUp} {
    width: 500px;
  }
`

const Icon = styled.span`
  color: ${colors.textMuted};
  font-size: ${typography.fontSize.lg};
  line-height: 1;
`

const Input = styled.input`
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-family: ${typography.fontFamily.body};
  font-size: ${typography.fontSize.base};
  color: ${colors.textPrimary};

  &::placeholder {
    color: ${colors.textMuted};
  }

  ${focusRing}
`

const Kbd = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 38px;
  height: 24px;
  padding: 0 ${spacing[2]};
  border-radius: ${radius.sm};
  border: 1px solid ${colors.border};
  background: rgba(255, 255, 255, 0.04);
  font-family: ${typography.fontFamily.body};
  font-size: ${typography.fontSize.sm};
  color: ${colors.textMuted};

  ${media.mobile} {
    display: none;
  }
`

export const MelegaSearchBar: React.FC<MelegaSearchBarProps> = ({
  placeholder = 'Search tokens, farms, projects…',
  shortcut = '⌘K',
  value,
  onChange,
  onFocus,
  padding,
  margin,
  radius: radiusToken,
  disabled,
  loading,
}) => (
  <Wrap
    $padding={padding}
    $margin={margin}
    $radius={radiusToken}
    role="search"
    aria-busy={loading}
    style={{ opacity: disabled ? 0.45 : 1, pointerEvents: disabled || loading ? 'none' : 'auto' }}
  >
    <Icon aria-hidden>⌕</Icon>
    <Input
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      onFocus={onFocus}
      disabled={disabled || loading}
      aria-label={placeholder}
    />
    {shortcut && <Kbd>{shortcut}</Kbd>}
  </Wrap>
)

export default MelegaSearchBar
