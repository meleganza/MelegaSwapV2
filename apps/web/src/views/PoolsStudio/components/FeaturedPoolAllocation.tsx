import React, { useMemo } from 'react'
import styled, { keyframes } from 'styled-components'
import { usePoolsRuntime } from '../poolsRuntime/PoolsRuntimeContext'
import { poolsFeaturedHero } from '../poolsStudioTokens'

const LIVE_DONUT = poolsFeaturedHero.donutDiameter
const LIVE_STROKE = 9
const LIVE_R = LIVE_DONUT / 2 - LIVE_STROKE / 2
const LIVE_C = 2 * Math.PI * LIVE_R
const LIVE_CX = LIVE_DONUT / 2

const donutDraw = keyframes`
  from {
    stroke-dashoffset: ${LIVE_C};
    opacity: 0.35;
  }
  to {
    stroke-dashoffset: var(--donut-offset);
    opacity: 1;
  }
`

const LiveWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  width: 100%;
  height: 100%;
  min-height: 0;
  box-sizing: border-box;
`

const DonutWrap = styled.div`
  position: relative;
  width: ${LIVE_DONUT}px;
  height: ${LIVE_DONUT}px;
  margin: 4px auto 0;
  flex-shrink: 0;
  align-self: center;
`

const LiveSvg = styled.svg`
  width: ${LIVE_DONUT}px;
  height: ${LIVE_DONUT}px;
  display: block;
`

const AnimatedArc = styled.circle`
  animation: ${donutDraw} 1.2s ease-out 1 forwards;
`

const DonutCenter = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
`

const DonutScore = styled.span`
  font-family: Inter, sans-serif;
  font-size: 22px;
  font-weight: 700;
  line-height: 1;
  color: #ffffff;
`

const DonutHealthLabel = styled.span`
  margin-top: 4px;
  font-family: Inter, sans-serif;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: #8a8a8a;
`

const RewardRows = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${poolsFeaturedHero.rewardRowGap};
  width: 100%;
  max-width: 188px;
  margin-top: 18px;
`

const RewardRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
`

const RewardLabel = styled.span`
  font-family: Inter, sans-serif;
  font-size: 11px;
  font-weight: 500;
  color: #8a8a8a;
  white-space: nowrap;
`

const RewardValue = styled.span`
  font-family: Inter, sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: right;
  max-width: 58%;
`

const HealthBarTrack = styled.div`
  width: ${poolsFeaturedHero.healthBarWidth};
  height: ${poolsFeaturedHero.healthBarHeight};
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
  margin-top: 18px;
  min-height: ${poolsFeaturedHero.healthBarHeight};
  flex-shrink: 0;
`

const HealthBarFill = styled.div<{ $pct: number }>`
  height: 100%;
  width: ${({ $pct }) => Math.min(100, Math.max(0, $pct))}%;
  border-radius: 999px;
  background: #19f08a;
`

export const FeaturedPoolAllocation: React.FC = () => {
  const { featured } = usePoolsRuntime()
  const card = featured.card
  const remainingPct = featured.remainingRewardsPct ?? 0
  const distributedPct = Math.max(0, 100 - remainingPct)

  const segments = useMemo(() => {
    const remDash = (remainingPct / 100) * LIVE_C
    const distDash = (distributedPct / 100) * LIVE_C
    return [
      { color: '#19F08A', dash: remDash, gap: LIVE_C - remDash, offset: 0 },
      { color: '#F4C430', dash: distDash, gap: LIVE_C - distDash, offset: -remDash },
    ]
  }, [remainingPct, distributedPct])

  const healthScore = card?.healthScore ?? card?.sustainabilityScore ?? featured.sustainabilityScore ?? 0
  const weekly = card?.weeklyRewards ?? '—'
  const monthly = card?.monthlyRewards ?? '—'
  const todayRewards = card?.estimatedDailyReward ?? featured.estimatedDailyReward ?? '—'

  const rows = [
    { label: 'Remaining Rewards', value: featured.remainingRewards ?? card?.remainingRewards ?? '—' },
    { label: "Today's Rewards", value: todayRewards },
    { label: 'Weekly Rewards', value: weekly },
    { label: 'Monthly Rewards', value: monthly },
  ]

  return (
    <LiveWrap data-ps-featured-allocation data-ps-featured-allocation-live data-r721-hero-donut>
      <DonutWrap data-ps-live-donut>
        <LiveSvg viewBox={`0 0 ${LIVE_DONUT} ${LIVE_DONUT}`} aria-hidden>
          <circle
            cx={LIVE_CX}
            cy={LIVE_CX}
            r={LIVE_R}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={LIVE_STROKE}
          />
          {segments.map((seg, i) => (
            <AnimatedArc
              key={i}
              cx={LIVE_CX}
              cy={LIVE_CX}
              r={LIVE_R}
              fill="none"
              stroke={seg.color}
              strokeWidth={LIVE_STROKE}
              strokeLinecap="round"
              strokeDasharray={`${seg.dash} ${seg.gap}`}
              strokeDashoffset={seg.offset}
              style={{ '--donut-offset': `${seg.offset}` } as React.CSSProperties}
              transform={`rotate(-90 ${LIVE_CX} ${LIVE_CX})`}
            />
          ))}
        </LiveSvg>
        <DonutCenter data-ps-donut-health-center>
          <DonutScore data-ps-donut-health-score>{healthScore}</DonutScore>
          <DonutHealthLabel>HEALTH</DonutHealthLabel>
        </DonutCenter>
      </DonutWrap>
      <RewardRows data-ps-hero-reward-rows>
        {rows.map(({ label, value }) => (
          <RewardRow key={label}>
            <RewardLabel>{label}</RewardLabel>
            <RewardValue>{value}</RewardValue>
          </RewardRow>
        ))}
      </RewardRows>
      <HealthBarTrack data-ps-hero-health-bar>
        <HealthBarFill $pct={healthScore} />
      </HealthBarTrack>
    </LiveWrap>
  )
}

export default FeaturedPoolAllocation
