import React, { useMemo } from 'react'
import styled from 'styled-components'
import { poolsStudioColors, poolsStudioLayout } from '../poolsStudioTokens'
import { usePoolsRuntime } from '../poolsRuntime/PoolsRuntimeContext'

const R = 58
const C = 2 * Math.PI * R

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 100%;
`

const Svg = styled.svg`
  width: 150px;
  height: 150px;
`

const Legend = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  color: ${poolsStudioColors.secondary};
  gap: 8px;
`

const Dot = styled.span<{ $color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  flex-shrink: 0;
`

const SustainBar = styled.div`
  width: 100%;
  height: 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
`

const SustainFill = styled.div<{ $pct: number }>`
  height: 100%;
  width: ${({ $pct }) => $pct}%;
  background: ${poolsStudioColors.green};
  border-radius: 999px;
  transition: width 220ms ease-out;
`

export const FeaturedPoolAllocation: React.FC = () => {
  const { featured } = usePoolsRuntime()
  const remainingPct = featured.remainingRewardsPct ?? 0
  const distributedPct = Math.max(0, 100 - remainingPct)

  const segments = useMemo(() => {
    const remDash = (remainingPct / 100) * C
    const distDash = (distributedPct / 100) * C
    return [
      { color: poolsStudioColors.green, dash: remDash, gap: C - remDash, offset: 0, label: 'Remaining' },
      { color: poolsStudioColors.goldBright, dash: distDash, gap: C - distDash, offset: -remDash, label: 'Distributed' },
    ]
  }, [remainingPct, distributedPct])

  return (
    <Wrap data-ps-featured-allocation>
      <Svg viewBox="0 0 140 140" aria-hidden>
        <circle cx="70" cy="70" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="18" />
        {segments.map((seg) => (
          <circle
            key={seg.label}
            cx="70"
            cy="70"
            r={R}
            fill="none"
            stroke={seg.color}
            strokeWidth="18"
            strokeDasharray={`${seg.dash} ${seg.gap}`}
            strokeDashoffset={seg.offset}
            transform="rotate(-90 70 70)"
          />
        ))}
        <text x="70" y="66" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="800">
          {Math.round(remainingPct)}%
        </text>
        <text x="70" y="82" textAnchor="middle" fill={poolsStudioColors.muted} fontSize="10" fontWeight="600">
          Remaining
        </text>
      </Svg>
      <Legend>
        <LegendItem>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Dot $color={poolsStudioColors.green} />
            Remaining rewards
          </span>
          <span>{featured.remainingRewards}</span>
        </LegendItem>
        <LegendItem>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Dot $color={poolsStudioColors.goldBright} />
            Pool usage
          </span>
          <span>{featured.tvl}</span>
        </LegendItem>
      </Legend>
      <div style={{ width: '100%' }}>
        <LegendItem style={{ marginBottom: 6 }}>
          <span>Reward Sustainability</span>
          <span style={{ color: poolsStudioColors.green, fontWeight: 700 }}>{featured.rewardSustainability}</span>
        </LegendItem>
        <SustainBar>
          <SustainFill $pct={featured.sustainabilityScore} />
        </SustainBar>
      </div>
    </Wrap>
  )
}

export default FeaturedPoolAllocation
