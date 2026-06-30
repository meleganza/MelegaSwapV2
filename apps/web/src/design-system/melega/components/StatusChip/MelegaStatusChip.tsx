import React from 'react'
import styled, { css } from 'styled-components'
import { colors, typography, spacing, radius } from '../../tokens'
import { layoutStyles } from '../../primitives'
import type { MelegaLayoutProps } from '../../primitives'

export type MelegaStatusChipVariant = 'neutral' | 'success' | 'warning' | 'error' | 'gold'

export interface MelegaStatusChipProps extends MelegaLayoutProps {
  variant?: MelegaStatusChipVariant
  children: React.ReactNode
}

const variantStyles: Record<MelegaStatusChipVariant, ReturnType<typeof css>> = {
  neutral: css`
    color: ${colors.textSecondary};
    background: ${colors.surface3};
    border-color: ${colors.border};
  `,
  success: css`
    color: ${colors.green};
    background: rgba(34, 197, 94, 0.1);
    border-color: rgba(34, 197, 94, 0.3);
  `,
  warning: css`
    color: ${colors.gold};
    background: ${colors.goldSoft};
    border-color: rgba(212, 175, 55, 0.35);
  `,
  error: css`
    color: ${colors.red};
    background: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.35);
  `,
  gold: css`
    color: ${colors.gold};
    background: ${colors.goldSoft};
    border-color: rgba(212, 175, 55, 0.45);
  `,
}

const StyledChip = styled.span<{
  $variant: MelegaStatusChipVariant
  $padding?: MelegaLayoutProps['padding']
  $margin?: MelegaLayoutProps['margin']
  $radius?: MelegaLayoutProps['radius']
}>`
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 ${spacing[3]};
  border-radius: ${radius.full};
  border: 1px solid;
  font-family: ${typography.fontFamily.body};
  font-size: ${typography.fontSize.md};
  font-weight: ${typography.fontWeight.medium};
  line-height: 1;
  box-shadow: none;

  ${({ $variant }) => variantStyles[$variant]}
  ${({ $padding, $margin, $radius: r }) => layoutStyles({ padding: $padding, margin: $margin, radius: r })}
`

export const MelegaStatusChip: React.FC<MelegaStatusChipProps> = ({
  variant = 'neutral',
  padding,
  margin,
  radius: radiusToken,
  children,
}) => (
  <StyledChip $variant={variant} $padding={padding} $margin={margin} $radius={radiusToken}>
    {children}
  </StyledChip>
)

export default MelegaStatusChip
