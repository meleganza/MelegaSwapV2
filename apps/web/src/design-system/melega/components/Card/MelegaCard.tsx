import React from 'react'
import styled, { css } from 'styled-components'
import { colors, typography, spacing, radius, ds001Colors, ds001Layout, ds001Shadows } from '../../tokens'
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
    min-height: 80px;
  `,
  md: css`
    padding: ${ds001Layout.cardPadding};
    min-height: 112px;
  `,
  lg: css`
    padding: ${spacing[8]};
    min-height: 128px;
  `,
}

const StyledCard = styled.div<{
  $size: MelegaCardSize
  $interactive?: boolean
  $padding?: MelegaLayoutProps['padding']
  $margin?: MelegaLayoutProps['margin']
  $radius?: MelegaLayoutProps['radius']
}>`
  background: ${ds001Colors.surface};
  border: 1px solid ${ds001Colors.border};
  border-radius: ${radius.card};
  box-shadow: ${ds001Shadows.default};
  font-family: ${typography.fontFamily.body};
  color: ${colors.textPrimary};
  transition:
    border-color ${ds001Layout.cardTransition},
    background ${ds001Layout.cardTransition},
    box-shadow ${ds001Layout.cardTransition};

  ${({ $size }) => sizeStyles[$size]}
  ${({ $padding, $margin, $radius: r }) => layoutStyles({ padding: $padding, margin: $margin, radius: r })}

  ${({ $interactive }) =>
    $interactive &&
    css`
      cursor: pointer;

      &:hover {
        border-color: ${ds001Colors.cardHoverBorder};
        background: ${ds001Colors.cardHoverBackground};
        box-shadow: ${ds001Shadows.hover};
      }
    `}

  ${media.mobile} {
    border-radius: ${radius.card};
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
