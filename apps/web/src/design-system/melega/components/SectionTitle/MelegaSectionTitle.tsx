import React from 'react'
import styled from 'styled-components'
import { colors, typography, spacing } from '../../tokens'
import { layoutStyles } from '../../primitives'
import type { MelegaLayoutProps } from '../../primitives'

export interface MelegaSectionTitleProps extends MelegaLayoutProps {
  title: string
  action?: React.ReactNode
  subtitle?: string
}

const Row = styled.div<{
  $padding?: MelegaLayoutProps['padding']
  $margin?: MelegaLayoutProps['margin']
}>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${spacing[3]};
  margin-bottom: ${spacing[3]};

  ${({ $padding, $margin }) => layoutStyles({ padding: $padding, margin: $margin })}
`

const Title = styled.h2`
  margin: 0;
  font-family: ${typography.fontFamily.body};
  font-size: ${typography.fontSize['3xl']};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.textPrimary};
  line-height: ${typography.lineHeight.tight};
`

const Subtitle = styled.p`
  margin: ${spacing[1]} 0 0;
  font-size: ${typography.fontSize.base};
  color: ${colors.textSecondary};
`

const Action = styled.div`
  font-size: ${typography.fontSize.md};
  color: ${colors.gold};
  flex-shrink: 0;
`

export const MelegaSectionTitle: React.FC<MelegaSectionTitleProps> = ({
  title,
  subtitle,
  action,
  padding,
  margin,
}) => (
  <div>
    <Row $padding={padding} $margin={margin}>
      <div>
        <Title>{title}</Title>
        {subtitle && <Subtitle>{subtitle}</Subtitle>}
      </div>
      {action && <Action>{action}</Action>}
    </Row>
  </div>
)

export default MelegaSectionTitle
