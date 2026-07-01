import React from 'react'
import styled, { keyframes } from 'styled-components'
import { colors, typography, animation } from '../../tokens'
import { media } from '../../theme'

export interface MelegaStatCardProps {
  label: string
  value: string
  meta?: string
  metaPositive?: boolean
  href?: string
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
}

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
`

const Card = styled.a<{ $interactive?: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 76px;
  padding: 12px;
  background: #111111;
  border: 1px solid ${colors.border};
  border-radius: 12px;
  text-decoration: none;
  box-shadow: none;
  position: relative;
  overflow: hidden;
  transition: border-color ${animation.cardHover}, transform ${animation.cardHover};
  cursor: ${({ $interactive }) => ($interactive ? 'pointer' : 'default')};
  animation: ${fadeIn} 180ms ease;

  &:hover {
    ${({ $interactive }) =>
      $interactive &&
      `
      border-color: rgba(212,175,55,0.35);
      transform: translateY(-1px);
    `}
  }

  ${media.mobile} {
    flex: 0 0 150px;
    height: 96px;
  }
`

const Label = styled.div`
  font-size: 11px;
  color: #8f8f8f;
  line-height: 1.3;
`

const Value = styled.div`
  margin-top: 4px;
  font-size: 15px;
  font-weight: ${typography.fontWeight.extrabold};
  color: ${colors.textPrimary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
`

const Meta = styled.div<{ $positive?: boolean }>`
  margin-top: 2px;
  font-size: 12px;
  color: ${({ $positive }) => ($positive ? colors.green : colors.textSecondary)};
  line-height: 1.3;
`

const Spark = styled.svg`
  position: absolute;
  right: 8px;
  bottom: 8px;
  width: 52px;
  height: 18px;
  opacity: 0.35;
  pointer-events: none;
`

export const MelegaStatCard: React.FC<MelegaStatCardProps> = ({
  label,
  value,
  meta,
  metaPositive,
  href,
  onClick,
  disabled,
  loading,
}) => {
  const interactive = !!(href || onClick)
  const content = (
    <>
      <Label>{label}</Label>
      <Value>{loading ? '…' : value}</Value>
      {meta && <Meta $positive={metaPositive}>{meta}</Meta>}
      <Spark viewBox="0 0 52 18" fill="none" aria-hidden>
        <path
          d="M0 12 L10 8 L16 14 L24 5 L32 11 L40 4 L52 9"
          stroke={colors.gold}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </Spark>
    </>
  )

  if (href && !disabled) {
    return (
      <Card as="a" href={href} $interactive={interactive && !loading} style={{ opacity: disabled || loading ? 0.45 : 1 }}>
        {content}
      </Card>
    )
  }

  return (
    <Card
      as="div"
      onClick={disabled || loading ? undefined : onClick}
      $interactive={interactive && !disabled && !loading}
      style={{ opacity: disabled || loading ? 0.45 : 1 }}
    >
      {content}
    </Card>
  )
}

export default MelegaStatCard
