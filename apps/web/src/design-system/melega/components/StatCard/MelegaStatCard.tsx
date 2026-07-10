import React, { useMemo } from 'react'
import styled, { css, keyframes } from 'styled-components'
import { colors, typography, animation } from '../../tokens'
import { media } from '../../theme'

export interface MelegaStatCardProps {
  label: string
  value: string
  meta?: string
  metaPositive?: boolean
  sparkPoints?: number[]
  href?: string
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
}

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
`

const drawSpark = keyframes`
  0% { stroke-dashoffset: 48; }
  75% { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: 0; }
`

const Card = styled.a<{ $interactive?: boolean }>`
  display: block;
  height: 64px;
  padding: 8px 12px;
  background: #111111;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  text-decoration: none;
  box-shadow: none;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  transition: border-color ${animation.cardHover}, transform 150ms ease;
  cursor: ${({ $interactive }) => ($interactive ? 'pointer' : 'default')};
  animation: ${fadeIn} 180ms ease;

  &:hover {
    ${({ $interactive }) =>
      $interactive &&
      `
      border-color: rgba(212,175,55,0.35);
      transform: translateY(-2px);
    `}
  }

  ${media.mobile} {
    flex: 0 0 210px;
    height: 64px;
  }
`

const Label = styled.div`
  font-size: 11px;
  color: #8a8a8a;
  line-height: 12px;
  height: 12px;
`

const Value = styled.div`
  margin-top: 4px;
  font-size: 15px;
  font-weight: 800;
  color: ${colors.textPrimary};
  line-height: 18px;
  height: 18px;
  max-width: calc(100% - 56px);
  white-space: nowrap;
`

const Meta = styled.div<{ $positive?: boolean }>`
  margin-top: 2px;
  font-size: 12px;
  font-weight: 700;
  color: ${({ $positive }) => ($positive ? colors.green : colors.textSecondary)};
  line-height: 16px;
  height: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: calc(100% - 62px);
`

const Spark = styled.svg`
  position: absolute;
  right: 12px;
  bottom: 12px;
  width: 42px;
  height: 16px;
  pointer-events: none;
`

const SparkPath = styled.path<{ $animated?: boolean }>`
  fill: none;
  stroke: ${colors.gold};
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  ${({ $animated }) =>
    $animated &&
    css`
      stroke-dasharray: 42;
      stroke-dashoffset: 42;
      animation: ${drawSpark} 6s ease-out infinite;
    `}
`

const buildSparkPath = (points: number[]): string => {
  if (points.length < 2) return ''
  const min = Math.min(...points)
  const max = Math.max(...points)
  const range = max - min || 1
  const step = 48 / (points.length - 1)
  return points
    .map((p, i) => {
      const x = i * step
      const y = 14 - ((p - min) / range) * 12
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')
}

const PLACEHOLDER_PATH = 'M0 11 L8 8 L16 12 L24 5 L32 9 L40 6 L48 10'

export const MelegaStatCard: React.FC<MelegaStatCardProps> = ({
  label,
  value,
  meta,
  metaPositive,
  sparkPoints,
  href,
  onClick,
  disabled,
  loading,
}) => {
  const interactive = !!(href || onClick)
  const sparkPath = useMemo(() => {
    if (sparkPoints && sparkPoints.length >= 2) return buildSparkPath(sparkPoints)
    return PLACEHOLDER_PATH
  }, [sparkPoints])
  const animated = true

  const content = (
    <>
      <Label>{label}</Label>
      <Value>{loading ? '…' : value}</Value>
      {meta && <Meta $positive={metaPositive}>{meta}</Meta>}
      {sparkPoints && sparkPoints.length >= 2 ? (
        <Spark viewBox="0 0 48 16" aria-hidden>
          <SparkPath d={sparkPath} $animated={animated} />
        </Spark>
      ) : null}
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
