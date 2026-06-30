import React from 'react'
import styled, { css } from 'styled-components'
import { colors, typography, spacing, radius, animation } from '../../tokens'
import { layoutStyles } from '../../primitives'
import type { MelegaInteractiveProps } from '../../primitives'

export interface MelegaSidebarItemProps extends MelegaInteractiveProps {
  icon?: React.ReactNode
  label: string
  href?: string
  onClick?: () => void
}

const ItemBase = styled.a<{
  $active?: boolean
  $disabled?: boolean
  $loading?: boolean
  $padding?: MelegaInteractiveProps['padding']
  $margin?: MelegaInteractiveProps['margin']
  $radius?: MelegaInteractiveProps['radius']
}>`
  display: flex;
  align-items: center;
  gap: ${spacing[3]};
  height: 32px;
  padding: 0 ${spacing[3]};
  border-radius: ${radius.sm};
  text-decoration: none;
  font-family: ${typography.fontFamily.body};
  font-size: ${typography.fontSize.md};
  font-weight: ${typography.fontWeight.medium};
  color: ${({ $active }) => ($active ? colors.gold : colors.textSecondary)};
  background: ${({ $active }) => ($active ? colors.goldSoft : 'transparent')};
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
        top: 8px;
        bottom: 8px;
        width: 2px;
        border-radius: 2px;
        background: ${colors.gold};
      }
    `}

  &:hover {
    background: ${({ $active }) => ($active ? colors.goldSoft : 'rgba(255,255,255,0.045)')};
    color: ${({ $active }) => ($active ? colors.gold : colors.textPrimary)};
  }

  ${({ $disabled }) => $disabled && 'opacity: 0.45; pointer-events: none;'}
  ${({ $padding, $margin, $radius: r }) => layoutStyles({ padding: $padding, margin: $margin, radius: r })}

  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
`

export const MelegaSidebarItem: React.FC<MelegaSidebarItemProps> = ({
  icon,
  label,
  href = '#',
  active,
  disabled,
  loading,
  padding,
  margin,
  radius: radiusToken,
  onClick,
}) => (
  <ItemBase
    href={disabled ? undefined : href}
    onClick={onClick}
    $active={active}
    $disabled={disabled || loading}
    $loading={loading}
    $padding={padding}
    $margin={margin}
    $radius={radiusToken}
    aria-disabled={disabled || loading}
  >
    {icon}
    {loading ? '…' : label}
  </ItemBase>
)

export default MelegaSidebarItem
