import React from 'react'
import styled from 'styled-components'
import { colors, typography, spacing, radius, animation } from '../../tokens'
import { focusRing, layoutStyles } from '../../primitives'
import type { MelegaLayoutProps } from '../../primitives'

export interface MelegaTokenSelectorProps extends MelegaLayoutProps {
  symbol: string
  icon?: React.ReactNode
  onClick?: () => void
}

const Btn = styled.button<{
  $padding?: MelegaLayoutProps['padding']
  $margin?: MelegaLayoutProps['margin']
  $radius?: MelegaLayoutProps['radius']
  $disabled?: boolean
  $loading?: boolean
}>`
  display: inline-flex;
  align-items: center;
  gap: ${spacing[2]};
  height: 34px;
  padding: 0 ${spacing[3]};
  border-radius: ${radius.full};
  border: 1px solid ${colors.border};
  background: rgba(0, 0, 0, 0.1);
  color: ${colors.textPrimary};
  font-family: ${typography.fontFamily.body};
  font-size: ${typography.fontSize.lg};
  font-weight: ${typography.fontWeight.bold};
  cursor: pointer;
  box-shadow: none;
  transition:
    border-color ${animation.hover},
    background ${animation.hover};

  &:hover:not(:disabled) {
    border-color: ${colors.borderStrong};
    background: rgba(255, 255, 255, 0.05);
  }

  ${({ $disabled, $loading }) => ($disabled || $loading) && 'opacity: 0.45; pointer-events: none;'}
  ${({ $padding, $margin, $radius: r }) => layoutStyles({ padding: $padding, margin: $margin, radius: r })}
  ${focusRing}
`

const IconSlot = styled.span`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: ${colors.surface3};
  border: 1px solid ${colors.border};

  img,
  svg {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`

export const MelegaTokenSelector: React.FC<MelegaTokenSelectorProps> = ({
  symbol,
  icon,
  onClick,
  disabled,
  loading,
  padding,
  margin,
  radius: radiusToken,
}) => (
  <Btn
    type="button"
    onClick={onClick}
    $disabled={disabled}
    $loading={loading}
    $padding={padding}
    $margin={margin}
    $radius={radiusToken}
    disabled={disabled || loading}
    aria-label={`Select token ${symbol}`}
  >
    {icon && <IconSlot>{icon}</IconSlot>}
    {loading ? '…' : symbol}
  </Btn>
)

export default MelegaTokenSelector
