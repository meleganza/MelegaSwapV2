import React, { useMemo } from 'react'
import styled from 'styled-components'
import { usePoolsRuntime } from '../poolsRuntime/PoolsRuntimeContext'

const EMPTY_DONUT = 178
const EMPTY_STROKE = 14

const LIVE_DONUT = 156
const LIVE_STROKE = 13
const LIVE_R = LIVE_DONUT / 2 - LIVE_STROKE / 2
const LIVE_C = 2 * Math.PI * LIVE_R
const LIVE_CX = LIVE_DONUT / 2

const EmptyWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 0;
  width: 100%;
`

const LiveWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  width: 100%;
  min-height: 0;
  overflow: visible;
`

const DonutWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 18px auto;
  flex-shrink: 0;
`

const LiveSvg = styled.svg`
  width: ${LIVE_DONUT}px;
  height: ${LIVE_DONUT}px;
  display: block;
`

const LiveMetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 16px;
  row-gap: 0;
  width: 100%;
`

const LiveMetricRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 28px;
  min-height: 28px;
  gap: 6px;
  min-width: 0;
  overflow: hidden;
`

const LiveRowLabel = styled.span`
  font-family: Inter, sans-serif;
  font-size: 11px;
  font-weight: 500;
  color: #777777;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 1;
  min-width: 0;
`

const LiveRowValue = styled.span`
  font-family: Inter, sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: right;
  flex-shrink: 0;
  max-width: 55%;
`

const LiveHealthBar = styled.div`
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
  margin-top: 16px;
`

const LiveHealthFill = styled.div<{ $pct: number }>`
  height: 100%;
  width: ${({ $pct }) => Math.min(100, Math.max(0, $pct))}%;
  background: #16e67a;
  border-radius: 4px;
`

const EmptyDonut = styled.div`
  width: ${EMPTY_DONUT}px;
  height: ${EMPTY_DONUT}px;
  border-radius: 50%;
  border: ${EMPTY_STROKE}px solid rgba(255, 255, 255, 0.08);
  box-sizing: border-box;
`

const EmptyRows = styled.div`
  width: 100%;
  margin-top: 14px;
  flex-shrink: 0;
`

const EmptyRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 34px;
  min-height: 34px;
  gap: 8px;
`

const EmptyRowLabel = styled.span`
  font-family: Inter, sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.55);
  white-space: nowrap;
`

const EmptyRowValue = styled.span`
  font-family: Inter, sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  white-space: nowrap;
  text-align: right;
`

const EmptyHealthBlock = styled.div`
  width: 100%;
  margin-top: 4px;
`

const EmptyHealthBar = styled.div`
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
  margin-top: 6px;
`

const EmptyHealthFill = styled.div<{ $pct: number }>`
  height: 100%;
  width: ${({ $pct }) => Math.min(100, Math.max(0, $pct))}%;
  background: #14e67b;
  border-radius: 4px;
`

interface Props {
  empty?: boolean
}

export const FeaturedPoolAllocation: React.FC<Props> = ({ empty }) => {
  const { featured } = usePoolsRuntime()
  const card = featured.card
  const remainingPct = featured.remainingRewardsPct ?? 0
  const distributedPct = Math.max(0, 100 - remainingPct)

  const segments = useMemo(() => {
    const remDash = (remainingPct / 100) * LIVE_C
    const distDash = (distributedPct / 100) * LIVE_C
    return [
      { color: '#16E67A', dash: remDash, gap: LIVE_C - remDash, offset: 0 },
      { color: '#F2C94C', dash: distDash, gap: LIVE_C - distDash, offset: -remDash },
    ]
  }, [remainingPct, distributedPct])

  const healthScore = card?.healthScore ?? card?.sustainabilityScore ?? featured.sustainabilityScore ?? 0
  const weekly = card?.weeklyRewards ?? '—'
  const monthly = card?.monthlyRewards ?? '—'
  const todayEmission = card?.estimatedDailyReward ?? featured.estimatedDailyReward ?? '—'

  if (empty) {
    return (
      <EmptyWrap data-ps-featured-allocation data-ps-featured-allocation-empty>
        <EmptyDonut aria-hidden />
        <EmptyRows>
          {['Remaining rewards', "Today's emission", 'Weekly emission', 'Monthly emission', 'Pool Health', 'Sustainability'].map(
            (label) => (
              <EmptyRow key={label}>
                <EmptyRowLabel>{label}</EmptyRowLabel>
                <EmptyRowValue>—</EmptyRowValue>
              </EmptyRow>
            ),
          )}
          <EmptyHealthBlock>
            <EmptyHealthBar>
              <EmptyHealthFill $pct={0} />
            </EmptyHealthBar>
          </EmptyHealthBlock>
        </EmptyRows>
      </EmptyWrap>
    )
  }

  const metrics = [
    { label: 'Remaining rewards', value: featured.remainingRewards },
    { label: "Today's emission", value: todayEmission },
    { label: 'Weekly emission', value: weekly },
    { label: 'Monthly emission', value: monthly },
    { label: 'Pool Health', value: `${healthScore} / 100` },
    { label: 'Sustainability', value: featured.rewardSustainability },
  ]

  return (
    <LiveWrap data-ps-featured-allocation data-ps-featured-allocation-live>
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
            <circle
              key={i}
              cx={LIVE_CX}
              cy={LIVE_CX}
              r={LIVE_R}
              fill="none"
              stroke={seg.color}
              strokeWidth={LIVE_STROKE}
              strokeDasharray={`${seg.dash} ${seg.gap}`}
              strokeDashoffset={seg.offset}
              transform={`rotate(-90 ${LIVE_CX} ${LIVE_CX})`}
            />
          ))}
        </LiveSvg>
      </DonutWrap>
      <LiveMetricGrid>
        {metrics.map(({ label, value }) => (
          <LiveMetricRow key={label}>
            <LiveRowLabel>{label}</LiveRowLabel>
            <LiveRowValue>{value}</LiveRowValue>
          </LiveMetricRow>
        ))}
      </LiveMetricGrid>
      <LiveHealthBar>
        <LiveHealthFill $pct={healthScore} />
      </LiveHealthBar>
    </LiveWrap>
  )
}

export default FeaturedPoolAllocation
