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
  gap: 9px;
  height: 28px;
  padding: 0 10px;
  border-radius: 8px;
  text-decoration: none;
  font-family: ${typography.fontFamily.body};
  font-size: 13px;
  font-weight: ${typography.fontWeight.medium};
  color: ${({ $active }) => ($active ? colors.gold : '#A8A8A8')};
  background: ${({ $active }) => ($active ? 'rgba(212,175,55,0.13)' : 'transparent')};
  position: relative;
  cursor: pointer;
  transition:
    background ${animation.hover},
    color ${animation.hover};
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
        background: ${colors.gold};
      }
    `}

  &:hover {
    background: ${({ $active }) => ($active ? 'rgba(212,175,55,0.13)' : 'rgba(255,255,255,0.045)')};
    color: ${({ $active }) => ($active ? colors.gold : colors.textPrimary)};
  }

  ${({ $disabled }) => $disabled && 'opacity: 0.45; pointer-events: none;'}

  svg {
    width: 15px;
    height: 15px;
    flex-shrink: 0;
    stroke-width: 1.7;
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
