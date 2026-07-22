import React from 'react'
import styled, { css } from 'styled-components'
import { colors, typography, spacing, radius } from '../../tokens'
import { layoutStyles } from '../../primitives'
import type { MelegaLayoutProps } from '../../primitives'

export type MelegaBadgeVariant = 'ready' | 'live' | 'waiting' | 'error' | 'legacy'

export interface MelegaBadgeProps extends MelegaLayoutProps {
  variant?: MelegaBadgeVariant
  dot?: boolean
  children: React.ReactNode
}

const variantStyles: Record<MelegaBadgeVariant, ReturnType<typeof css>> = {
  ready: css`
    color: ${colors.green};
    border-color: rgba(34, 197, 94, 0.35);
    background: rgba(34, 197, 94, 0.1);
  `,
  live: css`
    color: ${colors.green};
    border-color: rgba(34, 197, 94, 0.35);
    background: rgba(34, 197, 94, 0.1);
  `,
  waiting: css`
    color: ${colors.gold};
    border-color: rgba(244, 196, 48, 0.35);
    background: ${colors.goldSoft};
  `,
  error: css`
    color: ${colors.red};
    border-color: rgba(239, 68, 68, 0.35);
    background: rgba(239, 68, 68, 0.1);
  `,
  legacy: css`
    color: ${colors.textSecondary};
    border-color: ${colors.border};
    background: ${colors.surface3};
  `,
}

const Dot = styled.span<{ $color: string }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  flex-shrink: 0;
`

const StyledBadge = styled.span<{
  $variant: MelegaBadgeVariant
  $padding?: MelegaLayoutProps['padding']
  $margin?: MelegaLayoutProps['margin']
  $radius?: MelegaLayoutProps['radius']
}>`
  display: inline-flex;
  align-items: center;
  gap: ${spacing[2]};
  height: 26px;
  padding: 0 ${spacing[3]};
  border-radius: ${radius.full};
  border: 1px solid;
  font-family: ${typography.fontFamily.body};
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.semibold};
  line-height: 1;
  white-space: nowrap;
  box-shadow: none;

  ${({ $variant }) => variantStyles[$variant]}
  ${({ $padding, $margin, $radius: r }) => layoutStyles({ padding: $padding, margin: $margin, radius: r })}
`

const dotColor: Record<MelegaBadgeVariant, string> = {
  ready: colors.green,
  live: colors.green,
  waiting: colors.gold,
  error: colors.red,
  legacy: colors.textMuted,
}

export const MelegaBadge: React.FC<MelegaBadgeProps> = ({
  variant = 'ready',
  dot,
  padding,
  margin,
  radius: radiusToken,
  children,
}) => (
  <StyledBadge $variant={variant} $padding={padding} $margin={margin} $radius={radiusToken}>
    {dot && <Dot $color={dotColor[variant]} aria-hidden />}
    {children}
  </StyledBadge>
)

export default MelegaBadge
