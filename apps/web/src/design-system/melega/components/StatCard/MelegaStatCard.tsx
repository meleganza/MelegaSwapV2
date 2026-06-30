import React from 'react'
import styled from 'styled-components'
import { colors, typography, spacing, radius } from '../../tokens'
import { media } from '../../theme'
import { layoutStyles } from '../../primitives'
import type { MelegaLayoutProps } from '../../primitives'

export interface MelegaStatCardProps extends MelegaLayoutProps {
  label: string
  value: string
  meta?: string
  metaPositive?: boolean
  href?: string
  onClick?: () => void
}

const Card = styled.a<{
  $interactive?: boolean
  $padding?: MelegaLayoutProps['padding']
  $margin?: MelegaLayoutProps['margin']
  $radius?: MelegaLayoutProps['radius']
}>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 74px;
  padding: ${spacing[3]};
  background: ${colors.surface2};
  border: 1px solid ${colors.border};
  border-radius: ${radius.md};
  text-decoration: none;
  box-shadow: none;
  transition: border-color 150ms ease, transform 150ms ease;
  cursor: ${({ $interactive }) => ($interactive ? 'pointer' : 'default')};

  &:hover {
    ${({ $interactive }) =>
      $interactive &&
      `
      border-color: rgba(212,175,55,0.35);
      transform: translateY(-1px);
    `}
  }

  ${({ $padding, $margin, $radius: r }) => layoutStyles({ padding: $padding, margin: $margin, radius: r })}

  ${media.mobile} {
    flex: 0 0 156px;
    height: 112px;
  }
`

const Label = styled.div`
  font-size: ${typography.fontSize.xs};
  color: ${colors.textMuted};
`

const Value = styled.div`
  margin-top: ${spacing[1]};
  font-size: ${typography.fontSize['2xl']};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.textPrimary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Meta = styled.div<{ $positive?: boolean }>`
  margin-top: 2px;
  font-size: ${typography.fontSize.sm};
  color: ${({ $positive }) => ($positive ? colors.green : colors.textSecondary)};
`

export const MelegaStatCard: React.FC<MelegaStatCardProps> = ({
  label,
  value,
  meta,
  metaPositive,
  href,
  onClick,
  padding,
  margin,
  radius: radiusToken,
  disabled,
  loading,
}) => {
  const interactive = !!(href || onClick)
  const content = (
    <>
      <Label>{label}</Label>
      <Value>{loading ? '…' : value}</Value>
      {meta && <Meta $positive={metaPositive}>{meta}</Meta>}
    </>
  )

  if (href && !disabled) {
    return (
      <Card
        as="a"
        href={href}
        $interactive={interactive && !loading}
        $padding={padding}
        $margin={margin}
        $radius={radiusToken}
        style={{ opacity: disabled || loading ? 0.45 : 1 }}
      >
        {content}
      </Card>
    )
  }

  return (
    <Card
      as="div"
      onClick={disabled || loading ? undefined : onClick}
      $interactive={interactive && !disabled && !loading}
      $padding={padding}
      $margin={margin}
      $radius={radiusToken}
      style={{ opacity: disabled || loading ? 0.45 : 1 }}
    >
      {content}
    </Card>
  )
}

export default MelegaStatCard
