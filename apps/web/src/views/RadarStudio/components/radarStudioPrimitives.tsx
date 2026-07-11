import React from 'react'
import styled from 'styled-components'
import { MelegaLogoSvg } from 'design-system/melega/components/BrandLockup/MelegaLogoSvg'
import { isMarcoSymbol } from 'design-system/melega/constants/brand'
import { heatBlockColor } from '../radarStudioData'
import {
  RADAR_FONT_BODY,
  RADAR_FONT_DISPLAY,
  radarStudioColors,
  radarStudioLayout,
} from '../radarStudioTokens'

export const RdPanel = styled.div<{ $height?: string; $width?: string }>`
  width: ${({ $width }) => $width || '100%'};
  background: ${radarStudioColors.panel};
  border: 1px solid ${radarStudioColors.border};
  border-radius: ${radarStudioLayout.cardRadius};
  box-sizing: border-box;
  overflow: hidden;
  transition: transform ${radarStudioColors.transition} ease, border-color ${radarStudioColors.transition} ease,
    box-shadow ${radarStudioColors.transition} ease;
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
  line-height: 28px;
  font-weight: 800;
  color: ${radarStudioColors.white};
`

export const RdLabel = styled.span`
  font-family: ${RADAR_FONT_BODY};
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${radarStudioColors.label};
  line-height: 14px;
`

export const RdPrimaryBtn = styled.button`
  height: ${radarStudioLayout.eventBtnHeight};
  min-height: ${radarStudioLayout.eventBtnHeight};
  padding: 0;
  border: none;
  border-radius: 10px;
  background: ${radarStudioColors.gold};
  color: #050505;
  font-family: ${RADAR_FONT_BODY};
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  transition: transform 180ms ease, filter 180ms ease;
  white-space: nowrap;

  &:hover {
    filter: brightness(1.06);
  }

  @media (max-width: 767px) {
    min-height: 44px;
    height: 44px;
  }
`

export const RdGhostBtn = styled.button`
  height: ${radarStudioLayout.eventBtnHeight};
  min-height: ${radarStudioLayout.eventBtnHeight};
  padding: 0;
  border-radius: 10px;
  border: 1px solid #3a3a3a;
  background: transparent;
  color: ${radarStudioColors.gold};
  font-family: ${RADAR_FONT_BODY};
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 180ms ease, border-color 180ms ease;
  white-space: nowrap;

  &:hover {
    border-color: ${radarStudioColors.gold};
  }

  @media (max-width: 767px) {
    min-height: 44px;
    height: 44px;
  }
`

export const RdIntelBtn = styled(RdGhostBtn)`
  border-color: rgba(212, 175, 55, 0.45);
`

export const RdOutlineGoldBtn = styled.button`
  height: 44px;
  min-height: 44px;
  width: 178px;
  padding: 0;
  border-radius: 13px;
  border: 1px solid ${radarStudioColors.gold};
  background: ${radarStudioColors.goldBg};
  color: ${radarStudioColors.gold};
  font-family: ${RADAR_FONT_BODY};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
`

export const RdChip = styled.button<{ $active?: boolean }>`
  height: ${radarStudioLayout.filterHeight};
  min-height: ${radarStudioLayout.filterHeight};
  padding: 0 18px;
  border-radius: 999px;
  border: 1px solid ${({ $active }) => ($active ? radarStudioColors.gold : '#252525')};
  background: ${({ $active }) => ($active ? radarStudioColors.gold : '#090909')};
  color: ${({ $active }) => ($active ? '#050505' : radarStudioColors.secondary)};
  font-family: ${RADAR_FONT_BODY};
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: border-color 180ms ease, background 180ms ease;

  &:hover {
    border-color: ${radarStudioColors.gold};
  }
`

export const RadarProjectLogo: React.FC<{ name: string; symbol?: string; size?: number }> = ({
  name,
  symbol,
  size = 40,
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
        border: `1px solid ${radarStudioColors.border}`,
        background: radarStudioColors.panel,
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

export const HeatBlocks: React.FC<{ value: number; invert?: boolean; count?: number }> = ({
  value,
  invert,
  count = 12,
}) => {
  const filled = Math.round((value / 100) * count)

  return (
    <span data-rd-heat-blocks style={{ display: 'inline-flex', gap: 3 }}>
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          data-rd-heat-block
          style={{
            width: 8,
            height: 22,
            borderRadius: 3,
            background: i < filled ? heatBlockColor(value, invert) : radarStudioColors.heatInactive,
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
  height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  border: 1px solid ${radarStudioColors.border};
  font-family: ${RADAR_FONT_BODY};
  font-size: 11px;
  font-weight: 700;
  color: ${radarStudioColors.secondary};
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
`

const sparkShimmer = `
  @keyframes rdSparkShimmer {
    0% { stroke-dashoffset: 140; opacity: 0.6; }
    50% { opacity: 1; }
    100% { stroke-dashoffset: 0; opacity: 0.6; }
  }
`

export const KpiSparkline: React.FC<{ points: number[]; color?: string }> = ({ points, color = '#00E884' }) => {
  if (!points.length) return null
  const w = 58
  const h = 22
  const max = Math.max(...points)
  const min = Math.min(...points)
  const range = max - min || 1
  const denom = Math.max(points.length - 1, 1)
  const d = points
    .map((p, i) => {
      const x = (i / denom) * w
      const y = h - ((p - min) / range) * (h - 4) - 2
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  return (
    <>
      <style>{sparkShimmer}</style>
      <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} aria-hidden data-rd-sparkline>
        <path
          d={d}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="140"
          style={{ animation: 'rdSparkShimmer 8s ease-in-out infinite alternate' }}
        />
      </svg>
    </>
  )
}

export const OpportunityGauge: React.FC<{ score: number; animated: number }> = ({ score, animated }) => {
  const r = 48
  const c = 2 * Math.PI * r
  const offset = c - (animated / 100) * c

  return (
    <svg
      viewBox="0 0 120 120"
      width={126}
      height={126}
      aria-hidden
      data-rd-gauge
      style={{ display: 'block', flexShrink: 0 }}
    >
      <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
      <circle
        cx="60"
        cy="60"
        r={r}
        fill="none"
        stroke={radarStudioColors.green}
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform="rotate(-90 60 60)"
        style={{ transition: 'stroke-dashoffset 1200ms ease-out' }}
      />
      <text
        x="60"
        y="64"
        textAnchor="middle"
        fontFamily={RADAR_FONT_DISPLAY}
        fontSize="34"
        fontWeight="800"
        fill={radarStudioColors.green}
      >
        {score}
      </text>
    </svg>
  )
}

export const PreviewGauge: React.FC<{ score: number; animated: number }> = ({ score, animated }) => {
  const size = 220
  const r = 88
  const c = 2 * Math.PI * r
  const offset = c - (animated / 100) * c

  return (
    <svg
      viewBox="0 0 220 220"
      width={size}
      height={size}
      aria-hidden
      data-rd-preview-gauge
      style={{ display: 'block', flexShrink: 0 }}
    >
      <circle cx="110" cy="110" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="14" />
      <circle
        cx="110"
        cy="110"
        r={r}
        fill="none"
        stroke={radarStudioColors.green}
        strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform="rotate(-90 110 110)"
        style={{ transition: 'stroke-dashoffset 1200ms ease-out' }}
      />
      <text
        x="110"
        y="108"
        textAnchor="middle"
        fontFamily={RADAR_FONT_DISPLAY}
        fontSize="52"
        fontWeight="800"
        fill={radarStudioColors.green}
      >
        {score}
      </text>
      <text
        x="110"
        y="132"
        textAnchor="middle"
        fontFamily={RADAR_FONT_BODY}
        fontSize="14"
        fontWeight="500"
        fill={radarStudioColors.muted}
      >
        / 100
      </text>
    </svg>
  )
}

export const StatusPill = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  border: 1px solid ${({ $color }) => $color};
  background: ${({ $color }) => `${$color}18`};
  font-family: ${RADAR_FONT_BODY};
  font-size: 11px;
  font-weight: 600;
  color: ${({ $color }) => $color};
  line-height: 1;
`

export const ConfidenceBar: React.FC<{ label: string; value: number; delay?: number }> = ({
  label,
  value,
  delay = 0,
}) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
    <span
      style={{
        width: 72,
        flexShrink: 0,
        fontFamily: RADAR_FONT_BODY,
        fontSize: 11,
        fontWeight: 600,
        color: radarStudioColors.muted,
      }}
    >
      {label}
    </span>
    <span
      style={{
        width: 28,
        flexShrink: 0,
        fontFamily: RADAR_FONT_DISPLAY,
        fontSize: 12,
        fontWeight: 800,
        color: radarStudioColors.green,
        textAlign: 'right',
      }}
    >
      {value}
    </span>
    <span
      style={{
        width: radarStudioLayout.confidenceBarW,
        height: radarStudioLayout.confidenceBarH,
        borderRadius: 3,
        background: radarStudioColors.heatInactive,
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      <span
        data-rd-confidence-bar
        style={{
          display: 'block',
          height: '100%',
          width: `${value}%`,
          background: radarStudioColors.green,
          animationDelay: `${delay}ms`,
          transition: 'width 600ms ease-out',
        }}
      />
    </span>
  </div>
)
