import React, { useMemo } from 'react'
import styled from 'styled-components'
import { usePoolsRuntime } from '../poolsRuntime/PoolsRuntimeContext'

const SIZE = 140
const R = 52
const STROKE = 18
const C = 2 * Math.PI * R
const CX = SIZE / 2

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-height: 0;
`

const DonutCenter = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
`

const Svg = styled.svg`
  width: ${SIZE}px;
  height: ${SIZE}px;
  flex-shrink: 0;
`

const Legend = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
`

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  line-height: 1.2;
  color: rgba(255, 255, 255, 0.7);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
`

const Dot = styled.span<{ $color: string }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  flex-shrink: 0;
`

export const StakeDonutChart: React.FC<{ compact?: boolean }> = ({ compact }) => {
  const { donutSegments } = usePoolsRuntime()
  const segments = useMemo(() => donutSegments.slice(0, 4), [donutSegments])

  const arcs = useMemo(() => {
    let offset = 0
    return segments.map((seg) => {
      const dash = (seg.value / 100) * C
      const item = {
        ...seg,
        dash,
        gap: C - dash,
        offset: -offset,
        color: seg.color === '#E2BC2B' ? '#F2C94C' : seg.color,
      }
      offset += dash
      return item
    })
  }, [segments])

  if (!compact) {
    return null
  }

  return (
    <Wrap data-ps-donut>
      <DonutCenter>
        <Svg viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden>
          <circle cx={CX} cy={CX} r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={STROKE} />
          {arcs.map((seg) => (
            <circle
              key={seg.label}
              cx={CX}
              cy={CX}
              r={R}
              fill="none"
              stroke={seg.color}
              strokeWidth={STROKE}
              strokeDasharray={`${seg.dash} ${seg.gap}`}
              strokeDashoffset={seg.offset}
              transform={`rotate(-90 ${CX} ${CX})`}
              data-ps-donut-segment
            />
          ))}
        </Svg>
      </DonutCenter>
      <Legend>
        {segments.map((seg) => (
          <LegendItem key={seg.label}>
            <Dot $color={seg.color === '#E2BC2B' ? '#F2C94C' : seg.color} />
            {seg.label}
          </LegendItem>
        ))}
      </Legend>
    </Wrap>
  )
}

export default StakeDonutChart
