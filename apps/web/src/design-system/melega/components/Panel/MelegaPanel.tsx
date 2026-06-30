import React from 'react'
import styled from 'styled-components'
import { colors, typography, spacing, radius } from '../../tokens'
import { layoutStyles } from '../../primitives'
import type { MelegaLayoutProps } from '../../primitives'

export interface MelegaPanelProps extends MelegaLayoutProps, React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const StyledPanel = styled.div<{
  $padding?: MelegaLayoutProps['padding']
  $margin?: MelegaLayoutProps['margin']
  $radius?: MelegaLayoutProps['radius']
}>`
  background: linear-gradient(180deg, ${colors.surface2} 0%, ${colors.surface1} 100%);
  border: 1px solid ${colors.borderStrong};
  border-radius: ${radius.xl};
  padding: ${spacing[4]};
  box-shadow: none;
  font-family: ${typography.fontFamily.body};
  color: ${colors.textPrimary};

  ${({ $padding, $margin, $radius: r }) => layoutStyles({ padding: $padding, margin: $margin, radius: r })}
`

export const MelegaPanel: React.FC<MelegaPanelProps> = ({
  padding,
  margin,
  radius: radiusToken,
  children,
  ...rest
}) => (
  <StyledPanel $padding={padding} $margin={margin} $radius={radiusToken} {...rest}>
    {children}
  </StyledPanel>
)

export default MelegaPanel
