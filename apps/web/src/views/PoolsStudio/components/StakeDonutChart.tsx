import React from 'react'
import styled from 'styled-components'
import { DONUT_SEGMENTS } from '../poolsStudioData'
import { poolsStudioColors, poolsStudioLayout } from '../poolsStudioTokens'

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  min-width: 0;
`

const Svg = styled.svg`
  width: ${poolsStudioLayout.donutDiameter}px;
  height: ${poolsStudioLayout.donutDiameter}px;
  flex-shrink: 0;

  @media (max-width: 767px) {
    width: ${poolsStudioLayout.donutDiameterMobile}px;
    height: ${poolsStudioLayout.donutDiameterMobile}px;
  }
`

const Legend = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 12px;
  width: 100%;
  max-width: 200px;
`

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: ${poolsStudioColors.secondary};
`

const Dot = styled.span<{ $color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  flex-shrink: 0;
`

const R = 70
const C = 2 * Math.PI * R

function buildSegments() {
  let offset = 0
  return DONUT_SEGMENTS.map((seg) => {
    const dash = (seg.value / 100) * C
    const item = { ...seg, dash, gap: C - dash, offset: -offset }
    offset += dash
    return item
  })
}

const segments = buildSegments()

export const StakeDonutChart: React.FC = () => (
  <Wrap data-ps-donut>
    <Svg viewBox="0 0 180 180" aria-hidden>
      <circle cx="90" cy="90" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="22" />
      {segments.map((seg) => (
        <circle
          key={seg.label}
          cx="90"
          cy="90"
          r={R}
          fill="none"
          stroke={seg.color}
          strokeWidth="22"
          strokeDasharray={`${seg.dash} ${seg.gap}`}
          strokeDashoffset={seg.offset}
          transform="rotate(-90 90 90)"
          data-ps-donut-segment
          style={{ transition: 'opacity 150ms ease' }}
        />
      ))}
      <text x="90" y="86" textAnchor="middle" fill="#fff" fontSize="18" fontWeight="800">
        Stake
      </text>
      <text x="90" y="104" textAnchor="middle" fill={poolsStudioColors.muted} fontSize="10" fontWeight="600">
        Distribution
      </text>
    </Svg>
    <Legend>
      {DONUT_SEGMENTS.map((seg) => (
        <LegendItem key={seg.label}>
          <Dot $color={seg.color} />
          {seg.label}
        </LegendItem>
      ))}
    </Legend>
  </Wrap>
)

export default StakeDonutChart
