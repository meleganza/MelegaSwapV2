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
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void
  disabled?: boolean
  loading?: boolean
}

const Wrap = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  height: 42px;
  padding: 0 14px 0 18px;
  background: linear-gradient(180deg, #0c0c0c 0%, #080808 100%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  box-shadow: none;
  box-sizing: border-box;
  transition: border-color ${animation.hover}, box-shadow ${animation.hover};

  &:focus-within {
    border-color: rgba(244, 196, 48, 0.4);
    box-shadow: 0 0 0 1px rgba(244, 196, 48, 0.22);
  }

  ${media.mobile} {
    width: 100%;
    height: 40px;
    padding: 0 12px 0 16px;
  }
`

const Icon = styled.span`
  color: #9a9a9a;
  font-size: 16px;
  line-height: 1;
  margin-left: 4px;
  flex-shrink: 0;
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
  min-width: 0;

  &::placeholder {
    color: #a8a8a8;
    font-size: 14px;
    opacity: 1;
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
  onKeyDown,
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
      onKeyDown={onKeyDown}
      disabled={disabled || loading}
      aria-label={placeholder}
    />
    {shortcut && <Kbd>{shortcut}</Kbd>}
  </Wrap>
)

export default MelegaSearchBar
