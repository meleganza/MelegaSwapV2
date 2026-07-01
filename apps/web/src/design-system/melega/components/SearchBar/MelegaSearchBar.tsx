import React from 'react'
import styled from 'styled-components'
import { colors, typography, animation } from '../../tokens'
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
  gap: 10px;
  width: 500px;
  height: 42px;
  padding: 0 12px 0 16px;
  background: #080808;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  box-shadow: none;
  box-sizing: border-box;
  transition: border-color ${animation.hover}, box-shadow ${animation.hover};

  &:focus-within {
    border-color: rgba(212, 175, 55, 0.35);
    box-shadow: 0 0 0 1px rgba(212, 175, 55, 0.2);
  }

  ${media.mobile} {
    width: 100%;
    height: 40px;
  }
`

const Icon = styled.span`
  color: #707070;
  font-size: 16px;
  line-height: 1;
  margin-left: 2px;
`

const Input = styled.input`
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-family: ${typography.fontFamily.body};
  font-size: 14px;
  color: ${colors.textPrimary};
  padding-top: 2px;

  &::placeholder {
    color: #888888;
    font-size: 14px;
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
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: transparent;
  font-family: ${typography.fontFamily.body};
  font-size: 12px;
  color: #707070;
  flex-shrink: 0;

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
