import React from 'react'
import styled, { keyframes } from 'styled-components'
import { MelegaLogoSvg } from 'design-system/melega/components/BrandLockup/MelegaLogoSvg'
import { heatBlockColor } from '../radarStudioData'
import {
  RADAR_FONT_BODY,
  RADAR_FONT_DISPLAY,
  radarStudioColors,
  radarStudioLayout,
} from '../radarStudioTokens'

const sparkShimmer = keyframes`
  0% { stroke-dashoffset: 140; opacity: 0.6; }
  50% { opacity: 1; }
  100% { stroke-dashoffset: 0; opacity: 0.6; }
`

export const RdPanel = styled.div<{ $height?: string }>`
  background: ${radarStudioColors.panel};
  border: 1px solid ${radarStudioColors.border};
  border-radius: ${radarStudioLayout.cardRadius};
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
  font-family: ${RADAR_FONT_DISPLAY};
  font-size: 22px;
  font-weight: 800;
  line-height: 1.1;
  color: ${radarStudioColors.white};
`

export const RdLabel = styled.span`
  font-family: ${RADAR_FONT_BODY};
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${radarStudioColors.grey};
`

export const RdPrimaryBtn = styled.button`
  height: ${radarStudioLayout.eventBtnHeight};
  min-height: ${radarStudioLayout.eventBtnHeight};
  padding: 0 14px;
  border: none;
  border-radius: 10px;
  background: ${radarStudioColors.gold};
  color: #050505;
  font-family: ${RADAR_FONT_BODY};
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 180ms ease;
  white-space: nowrap;

  &:hover {
    transform: scale(0.98);
  }

  @media (max-width: 767px) {
    min-height: 44px;
    height: 44px;
  }
`

export const RdGhostBtn = styled.button`
  height: ${radarStudioLayout.eventBtnHeight};
  min-height: ${radarStudioLayout.eventBtnHeight};
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid ${radarStudioColors.border};
  background: transparent;
  color: ${radarStudioColors.gold};
  font-family: ${RADAR_FONT_BODY};
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 180ms ease, border-color 180ms ease;
  white-space: nowrap;

  &:hover {
    transform: scale(0.98);
    border-color: ${radarStudioColors.gold};
  }

  @media (max-width: 767px) {
    min-height: 44px;
    height: 44px;
  }
`

export const RdOutlineGoldBtn = styled(RdGhostBtn)`
  border-color: ${radarStudioColors.gold};
`

export const RdChip = styled.button<{ $active?: boolean }>`
  height: ${radarStudioLayout.filterHeight};
  min-height: ${radarStudioLayout.filterHeight};
  padding: 0 16px;
  border-radius: 999px;
  border: 1px solid ${({ $active }) => ($active ? radarStudioColors.gold : radarStudioColors.border)};
  background: ${({ $active }) => ($active ? radarStudioColors.gold : 'transparent')};
  color: ${({ $active }) => ($active ? '#050505' : radarStudioColors.secondary)};
  font-family: ${RADAR_FONT_BODY};
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: transform 180ms ease, border-color 180ms ease, background 180ms ease;

  &:hover {
    transform: translateY(-1px);
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
        fontFamily: RADAR_FONT_DISPLAY,
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
  animation: ${sparkShimmer} 8s ease-in-out infinite alternate;
`

export const AnimatedSparkline: React.FC<{ points: number[]; width?: number; height?: number; color?: string }> = ({
  points,
  width = 56,
  height = 20,
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

export const HeatBlocks: React.FC<{ value: number; invert?: boolean; count?: number }> = ({
  value,
  invert,
  count = 12,
}) => {
  const filled = Math.round((value / 100) * count)

  return (
    <span data-rd-heat-blocks style={{ display: 'inline-flex', gap: 2 }}>
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          data-rd-heat-block
          style={{
            width: 6,
            height: 10,
            borderRadius: 2,
            background: i < filled ? heatBlockColor(value, invert) : 'rgba(255,255,255,0.08)',
            animationDelay: `${i * 0.08}s`,
          }}
        />
      ))}
    </span>
  )
}

export function StatusDot({ level }: { level: 'green' | 'yellow' | 'orange' | 'red' }) {
  const color = heatBlockColor(
    level === 'green' ? 90 : level === 'yellow' ? 65 : level === 'orange' ? 45 : 20,
  )
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

export const SignalChip = styled.span`
  height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  border: 1px solid ${radarStudioColors.border};
  font-family: ${RADAR_FONT_BODY};
  font-size: 10px;
  font-weight: 700;
  color: ${radarStudioColors.secondary};
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
`
