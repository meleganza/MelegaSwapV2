import React, { forwardRef } from 'react'
import styled, { css } from 'styled-components'
import { colors, typography, animation } from '../../tokens'

export interface MelegaSidebarItemProps {
  icon?: React.ReactNode
  label: string
  href?: string
  active?: boolean
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
}

const ItemBase = styled.a<{
  $active?: boolean
  $disabled?: boolean
}>`
  display: flex;
  align-items: center;
  gap: 10px;
  height: 28px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid transparent;
  text-decoration: none;
  font-family: ${typography.fontFamily.body};
  font-size: 13px;
  font-weight: 500;
  color: ${({ $active }) => ($active ? colors.gold : '#B5B5B5')};
  background: ${({ $active }) => ($active ? 'rgba(212,175,55,0.12)' : 'transparent')};
  position: relative;
  cursor: pointer;
  transition:
    background 150ms ease,
    color 150ms ease,
    border-color 150ms ease;
  box-shadow: none;

  ${({ $active }) =>
    $active &&
    css`
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 6px;
        bottom: 6px;
        width: 2px;
        border-radius: 2px;
        background: #d4af37;
      }
    `}

  &:hover {
    background: ${({ $active }) => ($active ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.045)')};
    color: ${({ $active }) => ($active ? colors.gold : colors.textPrimary)};
    border-color: rgba(212, 175, 55, 0.35);
  }

  ${({ $active }) =>
    $active &&
    css`
      svg {
        color: ${colors.gold};
        stroke: ${colors.gold};
      }
    `}

  ${({ $disabled }) => $disabled && 'opacity: 0.45; pointer-events: none;'}

  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    stroke-width: 1.7;
  }

  @media (max-height: 899px) {
    height: 26px;
    font-size: 12px;

    &::before {
      top: 5px;
      bottom: 5px;
    }
  }
`

export const MelegaSidebarItem = forwardRef<HTMLAnchorElement, MelegaSidebarItemProps>(
  ({ icon, label, href = '#', active, disabled, loading, onClick }, ref) => (
    <ItemBase
      ref={ref}
      href={disabled ? undefined : href}
      onClick={onClick}
      $active={active}
      $disabled={disabled || loading}
      aria-disabled={disabled || loading}
    >
      {icon}
      {loading ? '…' : label}
    </ItemBase>
  ),
)

MelegaSidebarItem.displayName = 'MelegaSidebarItem'

export default MelegaSidebarItem
