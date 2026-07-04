import React from 'react'
import styled, { keyframes } from 'styled-components'
import { MelegaLogoSvg } from 'design-system/melega/components/BrandLockup/MelegaLogoSvg'
import { isMarcoSymbol } from 'design-system/melega/constants/brand'
import { typography } from 'design-system/melega'
import { trendingStudioColors, trendingStudioLayout } from '../trendingStudioTokens'

const sparkDraw = keyframes`
  0% { stroke-dashoffset: 120; }
  100% { stroke-dashoffset: 0; }
`

export const TrPanel = styled.div<{ $height?: string }>`
  background: ${trendingStudioColors.panel};
  border: 1px solid ${trendingStudioColors.border};
  border-radius: ${trendingStudioLayout.trendingCardRadius};
  box-shadow: ${trendingStudioColors.shadow};
  box-sizing: border-box;
  overflow: hidden;
  ${({ $height }) =>
    $height
      ? `
    height: ${$height};
    min-height: ${$height};
  `
      : ''}
`

export const TrSectionTitle = styled.h2`
  margin: 0 0 14px;
  font-family: ${typography.fontFamily.body};
  font-size: 28px;
  font-weight: 800;
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
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 180ms ease;

  &:hover {
    transform: scale(0.98);
  }

  &:active {
    transform: scale(0.98);
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
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: transform 180ms ease, border-color 180ms ease;

  &:hover {
    transform: scale(0.98);
    border-color: ${trendingStudioColors.yellow};
  }
`

export const TrChip = styled.button<{ $active?: boolean }>`
  height: ${trendingStudioLayout.filterHeight};
  min-height: ${trendingStudioLayout.filterHeight};
  padding: 0 ${trendingStudioLayout.filterPaddingX};
  border-radius: ${trendingStudioLayout.filterRadius};
  border: 1px solid ${({ $active }) => ($active ? trendingStudioColors.yellow : trendingStudioColors.border)};
  background: ${({ $active }) => ($active ? trendingStudioColors.yellow : 'transparent')};
  color: ${({ $active }) => ($active ? '#050505' : trendingStudioColors.gray)};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: transform 180ms ease, background 180ms ease;

  &:hover {
    transform: scale(0.98);
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
}) => {
  const isMarco = isMarcoSymbol(symbol, name)
  if (isMarco) {
    return (
      <span style={{ flexShrink: 0, display: 'inline-flex', borderRadius: '50%', overflow: 'hidden' }}>
        <MelegaLogoSvg size={size} />
      </span>
    )
  }

  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: `1px solid ${trendingStudioColors.border}`,
        background: trendingStudioColors.panelAlt,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontSize: size * 0.32,
        fontWeight: 800,
        color: trendingStudioColors.yellow,
      }}
    >
      {name.slice(0, 1)}
    </span>
  )
}

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
