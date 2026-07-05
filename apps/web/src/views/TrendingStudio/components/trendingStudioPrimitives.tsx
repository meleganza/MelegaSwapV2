import React from 'react'
import styled, { keyframes } from 'styled-components'
import { MelegaTokenAvatar } from 'design-system/melega/components/MelegaTokenAvatar/MelegaTokenAvatar'
import { isMarcoSymbol, MARCO_BSC_ADDRESS, MARCO_BSC_CHAIN_ID } from 'design-system/melega/constants/brand'
import { trendingStudioColors, trendingStudioLayout, TRENDING_FONT_DISPLAY } from '../trendingStudioTokens'

const sparkDraw = keyframes`
  0% { stroke-dashoffset: 120; }
  100% { stroke-dashoffset: 0; }
`

export const TrPanel = styled.div<{ $height?: string }>`
  background: ${trendingStudioColors.panel};
  border: 1px solid ${trendingStudioColors.border};
  border-radius: ${trendingStudioLayout.trendingCardRadius};
  box-sizing: border-box;
  overflow: hidden;
  transition: border-color ${trendingStudioLayout.hoverTransition} ease;
  ${({ $height }) =>
    $height
      ? `
    height: ${$height};
    min-height: ${$height};
  `
      : ''}

  &:hover {
    border-color: ${trendingStudioColors.cardBorderHover};
  }
`

export const TrSectionTitle = styled.h2`
  margin: 0 0 14px;
  font-family: ${TRENDING_FONT_DISPLAY};
  font-size: 32px;
  font-weight: 700;
  line-height: 1.1;
  color: ${trendingStudioColors.white};
`

export const TrLabel = styled.span`
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${trendingStudioColors.gray};
`

export const TrPrimaryBtn = styled.button`
  height: ${trendingStudioLayout.trendingBtnHeight};
  min-height: ${trendingStudioLayout.trendingBtnHeight};
  padding: 0 18px;
  border: none;
  border-radius: 12px;
  background: ${trendingStudioColors.yellow};
  color: #050505;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: filter ${trendingStudioLayout.hoverTransition} ease;

  &:hover {
    filter: brightness(1.05);
  }
`

export const TrGhostBtn = styled.button`
  height: ${trendingStudioLayout.trendingBtnHeight};
  min-height: ${trendingStudioLayout.trendingBtnHeight};
  padding: 0 18px;
  border-radius: 12px;
  border: 1px solid ${trendingStudioColors.border};
  background: transparent;
  color: ${trendingStudioColors.yellow};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: border-color ${trendingStudioLayout.hoverTransition} ease;

  &:hover {
    border-color: ${trendingStudioColors.yellow};
  }
`

export const TrChip = styled.button<{ $active?: boolean }>`
  height: ${trendingStudioLayout.tagHeight};
  min-height: ${trendingStudioLayout.tagHeight};
  padding: 0 ${trendingStudioLayout.filterPaddingX};
  border-radius: ${trendingStudioLayout.filterRadius};
  border: 1px solid ${({ $active }) => ($active ? trendingStudioColors.yellow : trendingStudioColors.border)};
  background: ${({ $active }) => ($active ? trendingStudioColors.yellow : 'transparent')};
  color: ${({ $active }) => ($active ? '#050505' : trendingStudioColors.gray)};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: border-color ${trendingStudioLayout.hoverTransition} ease, background ${trendingStudioLayout.hoverTransition} ease;

  &:hover {
    border-color: ${trendingStudioColors.yellow};
  }
`

export const TrStatusBadge = styled.span<{ $status: 'verified' | 'indexed' | 'live' }>`
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  border: 1px solid
    ${({ $status }) =>
      $status === 'verified'
        ? trendingStudioColors.green
        : $status === 'live'
          ? trendingStudioColors.yellow
          : trendingStudioColors.border};
  color: ${({ $status }) =>
    $status === 'verified'
      ? trendingStudioColors.green
      : $status === 'live'
        ? trendingStudioColors.yellow
        : trendingStudioColors.gray};
  animation: trBadgePulse 2.4s ease-in-out infinite;
`

export const TrendingProjectLogo: React.FC<{ name: string; symbol?: string; size?: number }> = ({
  name,
  symbol,
  size = 64,
}) => (
  <MelegaTokenAvatar
    name={name}
    symbol={symbol}
    size={size}
    address={isMarcoSymbol(symbol, name) ? MARCO_BSC_ADDRESS : undefined}
    chainId={isMarcoSymbol(symbol, name) ? MARCO_BSC_CHAIN_ID : undefined}
    radius="circle"
  />
)

const SparkPath = styled.path`
  fill: none;
  stroke: ${trendingStudioColors.green};
  stroke-width: 2;
  stroke-linecap: round;
  stroke-dasharray: 120;
  animation: ${sparkDraw} 4s ease-in-out infinite alternate;
`

export const AnimatedSparkline: React.FC<{ points: number[]; width?: number; height?: number }> = ({
  points,
  width = trendingStudioLayout.sparklineW,
  height = trendingStudioLayout.sparklineH,
}) => {
  const max = Math.max(...points)
  const min = Math.min(...points)
  const range = max - min || 1
  const d = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * width
      const y = height - ((p - min) / range) * (height - 4) - 2
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      aria-hidden
      data-tr-sparkline
      style={{ display: 'block', flexShrink: 0 }}
    >
      <SparkPath d={d} />
    </svg>
  )
}

export const HeatBar: React.FC<{ value: number }> = ({ value }) => {
  const level =
    value >= 80 ? trendingStudioColors.green : value >= 60 ? trendingStudioColors.yellow : value >= 40 ? trendingStudioColors.orange : trendingStudioColors.red
  const segments = 8
  const filled = Math.round((value / 100) * segments)

  return (
    <span
      data-tr-heat-bar
      style={{ display: 'inline-flex', gap: 2, alignItems: 'center', minWidth: 72 }}
      aria-hidden
    >
      {Array.from({ length: segments }).map((_, i) => (
        <span
          key={i}
          style={{
            width: 7,
            height: 12,
            borderRadius: 2,
            background: i < filled ? level : 'rgba(255,255,255,0.08)',
            opacity: i < filled ? 1 : 0.35,
            animation: i < filled ? 'trHeatPulse 2.8s ease-in-out infinite' : undefined,
            animationDelay: `${i * 0.08}s`,
          }}
        />
      ))}
    </span>
  )
}
