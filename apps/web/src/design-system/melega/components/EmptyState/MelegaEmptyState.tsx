import React from 'react'
import styled, { keyframes } from 'styled-components'
import { colors, typography, spacing } from '../../tokens'
import { layoutStyles } from '../../primitives'
import type { MelegaLayoutProps } from '../../primitives'

const pulse = keyframes`
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.06); }
`

export interface MelegaEmptyStateProps extends MelegaLayoutProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

const Wrap = styled.div<{
  $padding?: MelegaLayoutProps['padding']
  $margin?: MelegaLayoutProps['margin']
}>`
  display: flex;
  align-items: flex-start;
  gap: ${spacing[3]};
  padding: ${spacing[2]} 0;

  ${({ $padding, $margin }) => layoutStyles({ padding: $padding, margin: $margin })}
`

const Icon = styled.span`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: ${colors.goldSoft};
  border: 1px solid rgba(212, 175, 55, 0.35);
  flex-shrink: 0;
  animation: ${pulse} 2.5s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const Title = styled.div`
  font-size: ${typography.fontSize.md};
  font-weight: ${typography.fontWeight.semibold};
  color: ${colors.textPrimary};
`

const Desc = styled.div`
  margin-top: ${spacing[1]};
  font-size: ${typography.fontSize.sm};
  color: ${colors.textMuted};
  line-height: ${typography.lineHeight.normal};
`

const Action = styled.div`
  margin-top: ${spacing[3]};
`

export const MelegaEmptyState: React.FC<MelegaEmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  padding,
  margin,
}) => (
  <Wrap $padding={padding} $margin={margin}>
    {icon ? <span>{icon}</span> : <Icon aria-hidden />}
    <div>
      <Title>{title}</Title>
      {description && <Desc>{description}</Desc>}
      {action && <Action>{action}</Action>}
    </div>
  </Wrap>
)

export default MelegaEmptyState
