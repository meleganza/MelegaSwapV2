import React from 'react'
import styled, { keyframes } from 'styled-components'
import { MelegaLogoSvg } from 'design-system/melega/components/BrandLockup/MelegaLogoSvg'
import { RADAR_FONT, radarStudioColors, radarStudioLayout } from '../radarStudioTokens'

const sparkDraw = keyframes`
  0% { stroke-dashoffset: 140; }
  100% { stroke-dashoffset: 0; }
`

export const RdPanel = styled.div<{ $height?: string }>`
  background: ${radarStudioColors.panel};
  border: 1px solid ${radarStudioColors.border};
  border-radius: 20px;
  box-shadow: ${radarStudioColors.shadow};
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

export const RdSectionTitle = styled.h2`
  margin: 0 0 14px;
  font-family: ${RADAR_FONT};
  font-size: 28px;
  font-weight: 800;
  line-height: 1.1;
  color: ${radarStudioColors.white};
`

export const RdLabel = styled.span`
  font-family: ${RADAR_FONT};
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${radarStudioColors.grey};
`

export const RdPrimaryBtn = styled.button`
  height: ${radarStudioLayout.discoveryBtnHeight};
  min-height: ${radarStudioLayout.discoveryBtnHeight};
  padding: 0 16px;
  border: none;
  border-radius: 10px;
  background: ${radarStudioColors.gold};
  color: #050505;
  font-family: ${RADAR_FONT};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 180ms ease;

  &:hover {
    transform: scale(0.98);
  }
`

export const RdGhostBtn = styled.button`
  height: ${radarStudioLayout.discoveryBtnHeight};
  min-height: ${radarStudioLayout.discoveryBtnHeight};
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid ${radarStudioColors.border};
  background: transparent;
  color: ${radarStudioColors.gold};
  font-family: ${RADAR_FONT};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 180ms ease, border-color 180ms ease;

  &:hover {
    transform: scale(0.98);
    border-color: ${radarStudioColors.gold};
  }
`

export const RdChip = styled.button<{ $active?: boolean }>`
  height: ${radarStudioLayout.filterHeight};
  min-height: ${radarStudioLayout.filterHeight};
  padding: 0 16px;
  border-radius: ${radarStudioLayout.filterRadius};
  border: 1px solid ${({ $active }) => ($active ? radarStudioColors.gold : radarStudioColors.border)};
  background: ${({ $active }) => ($active ? radarStudioColors.gold : 'transparent')};
  color: ${({ $active }) => ($active ? '#050505' : radarStudioColors.grey)};
  font-family: ${RADAR_FONT};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: transform 180ms ease, border-color 180ms ease;

  &:hover {
    transform: scale(0.98);
    border-color: ${radarStudioColors.gold};
  }
`

export const RadarProjectLogo: React.FC<{ name: string; symbol?: string; size?: number }> = ({
  name,
  symbol,
  size = 40,
}) => {
  const isMarco = symbol === 'MARCO' || name === 'MARCO'
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
        border: `1px solid ${radarStudioColors.border}`,
        background: radarStudioColors.panelAlt,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontFamily: RADAR_FONT,
        fontSize: size * 0.32,
        fontWeight: 800,
        color: radarStudioColors.gold,
      }}
    >
      {name.slice(0, 1)}
    </span>
  )
}

const SparkPath = styled.path`
  fill: none;
  stroke: ${radarStudioColors.green};
  stroke-width: 2;
  stroke-linecap: round;
  stroke-dasharray: 140;
  animation: ${sparkDraw} 6s ease-in-out infinite alternate;
`

export const AnimatedSparkline: React.FC<{ points: number[]; width?: number; height?: number; color?: string }> = ({
  points,
  width = radarStudioLayout.sparklineW,
  height = radarStudioLayout.sparklineH,
  color,
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
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} aria-hidden data-rd-sparkline>
      <SparkPath d={d} style={color ? { stroke: color } : undefined} />
    </svg>
  )
}

export const HeatBlocks: React.FC<{ value: number; invert?: boolean }> = ({ value, invert }) => {
  const level =
    (invert ? 100 - value : value) >= 80
      ? radarStudioColors.green
      : (invert ? 100 - value : value) >= 60
        ? radarStudioColors.yellow
        : (invert ? 100 - value : value) >= 40
          ? radarStudioColors.orange
          : radarStudioColors.red
  const filled = Math.round((value / 100) * 10)

  return (
    <span data-rd-heat-blocks style={{ display: 'inline-flex', gap: 2 }}>
      {Array.from({ length: 10 }).map((_, i) => (
        <span
          key={i}
          style={{
            width: 8,
            height: 12,
            borderRadius: 2,
            background: i < filled ? level : 'rgba(255,255,255,0.08)',
            animation: i < filled ? 'rdHeatPulse 5s ease-in-out infinite' : undefined,
            animationDelay: `${i * 0.05}s`,
          }}
        />
      ))}
    </span>
  )
}

export function StatusDot({ level }: { level: 'green' | 'yellow' | 'orange' | 'red' }) {
  const color =
    level === 'green'
      ? radarStudioColors.green
      : level === 'yellow'
        ? radarStudioColors.yellow
        : level === 'orange'
          ? radarStudioColors.orange
          : radarStudioColors.red
  return (
    <span
      style={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: color,
        flexShrink: 0,
      }}
    />
  )
}
