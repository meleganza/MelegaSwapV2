import React from 'react'
import styled from 'styled-components'
import { colors, typography, spacing } from '../../tokens'
import { layoutStyles } from '../../primitives'
import type { MelegaLayoutProps } from '../../primitives'

export interface MelegaFeedRowProps extends MelegaLayoutProps {
  icon?: React.ReactNode
  title: string
  subtitle?: string
  trailing?: React.ReactNode
  href?: string
  onClick?: () => void
}

const Row = styled.a<{
  $padding?: MelegaLayoutProps['padding']
  $margin?: MelegaLayoutProps['margin']
  $disabled?: boolean
}>`
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: ${spacing[3]};
  align-items: center;
  min-height: 30px;
  padding: ${spacing[2]} 0;
  border-bottom: 1px solid ${colors.border};
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  box-shadow: none;
  transition: background 150ms ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.02);
  }

  ${({ $padding, $margin }) => layoutStyles({ padding: $padding, margin: $margin })}
  ${({ $disabled }) => $disabled && 'opacity: 0.45; pointer-events: none;'}
`

const Icon = styled.span`
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.gold};
  flex-shrink: 0;
`

const Main = styled.div`
  min-width: 0;
`

const Title = styled.div`
  font-size: ${typography.fontSize.md};
  font-weight: ${typography.fontWeight.semibold};
  color: ${colors.textPrimary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Subtitle = styled.div`
  font-size: ${typography.fontSize.sm};
  color: ${colors.textMuted};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Trailing = styled.div`
  font-size: ${typography.fontSize.sm};
  color: ${colors.textSecondary};
  white-space: nowrap;
`

export const MelegaFeedRow: React.FC<MelegaFeedRowProps> = ({
  icon,
  title,
  subtitle,
  trailing,
  href = '#',
  onClick,
  padding,
  margin,
  disabled,
  loading,
}) => (
  <Row
    href={disabled ? undefined : href}
    onClick={onClick}
    $padding={padding}
    $margin={margin}
    $disabled={disabled || loading}
  >
    <Icon>{loading ? '…' : icon}</Icon>
    <Main>
      <Title>{title}</Title>
      {subtitle && <Subtitle>{subtitle}</Subtitle>}
    </Main>
    {trailing && <Trailing>{trailing}</Trailing>}
  </Row>
)

export default MelegaFeedRow
