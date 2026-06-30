import React from 'react'
import styled, { css } from 'styled-components'
import { colors, typography, spacing, radius } from '../../tokens'
import { media } from '../../theme'
import { layoutStyles } from '../../primitives'
import type { MelegaLayoutProps } from '../../primitives'

export type MelegaCardSize = 'sm' | 'md' | 'lg'

export interface MelegaCardProps extends MelegaLayoutProps, React.HTMLAttributes<HTMLDivElement> {
  size?: MelegaCardSize
  interactive?: boolean
  children: React.ReactNode
}

const sizeStyles: Record<MelegaCardSize, ReturnType<typeof css>> = {
  sm: css`
    padding: ${spacing[3]};
    min-height: 74px;
  `,
  md: css`
    padding: ${spacing[4]};
    min-height: 108px;
  `,
  lg: css`
    padding: ${spacing[5]};
    min-height: 138px;
  `,
}

const StyledCard = styled.div<{
  $size: MelegaCardSize
  $interactive?: boolean
  $padding?: MelegaLayoutProps['padding']
  $margin?: MelegaLayoutProps['margin']
  $radius?: MelegaLayoutProps['radius']
}>`
  background: ${colors.surface2};
  border: 1px solid ${colors.border};
  border-radius: ${radius.lg};
  box-shadow: none;
  font-family: ${typography.fontFamily.body};
  color: ${colors.textPrimary};
  transition: border-color 150ms ease, background 150ms ease;

  ${({ $size }) => sizeStyles[$size]}
  ${({ $padding, $margin, $radius: r }) => layoutStyles({ padding: $padding, margin: $margin, radius: r })}

  ${({ $interactive }) =>
    $interactive &&
    css`
      cursor: pointer;

      &:hover {
        border-color: ${colors.borderStrong};
        background: ${colors.surface3};
      }
    `}

  ${media.mobile} {
    border-radius: ${radius.xl};
  }
`

export const MelegaCard: React.FC<MelegaCardProps> = ({
  size = 'md',
  interactive,
  padding,
  margin,
  radius: radiusToken,
  children,
  ...rest
}) => (
  <StyledCard
    $size={size}
    $interactive={interactive}
    $padding={padding}
    $margin={margin}
    $radius={radiusToken}
    {...rest}
  >
    {children}
  </StyledCard>
)

export default MelegaCard
