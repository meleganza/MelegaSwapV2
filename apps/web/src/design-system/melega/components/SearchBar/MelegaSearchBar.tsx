import React from 'react'
import styled from 'styled-components'
import { colors, typography, spacing, radius, animation } from '../../tokens'
import { media } from '../../theme'
import { focusRing } from '../../primitives'

export interface MelegaSearchBarProps {
  placeholder?: string
  shortcut?: string
  value?: string
  onChange?: (value: string) => void
  onFocus?: () => void
  disabled?: boolean
  loading?: boolean
}

const Wrap = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing[3]};
  height: 42px;
  padding: 0 10px 0 16px;
  background: #080808;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: ${radius.lg};
  box-shadow: none;
  transition: border-color ${animation.hover};

  &:hover,
  &:focus-within {
    border-color: rgba(255, 255, 255, 0.18);
  }

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
    color: ${colors.textSecondary};
  }

  ${focusRing}
`

const Kbd = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 24px;
  border-radius: 8px;
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
  placeholder = 'Search tokens, farms, projects...',
  shortcut = '⌘K',
  value,
  onChange,
  onFocus,
  disabled,
  loading,
}) => (
  <Wrap
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
