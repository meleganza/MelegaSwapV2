import React from 'react'
import styled from 'styled-components'
import {
  KPI_ACTIONS,
  KPI_AI_SCORE,
  KPI_INFRASTRUCTURE,
  KPI_NET_WORTH,
  KPI_RADAR,
  KPI_REWARDS,
} from '../commandCenterData'
import { CC_FONT_BODY, CC_FONT_DISPLAY, commandCenterColors } from '../commandCenterTokens'
import { CcPanel } from './commandCenterPrimitives'

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
`

const SmallGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 12px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const KpiCard = styled(CcPanel)`
  padding: 16px;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`

const Label = styled.div`
  font-family: ${CC_FONT_BODY};
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${commandCenterColors.label};
`

const Value = styled.div`
  font-family: ${CC_FONT_DISPLAY};
  font-size: 28px;
  font-weight: 700;
  color: ${commandCenterColors.white};
  line-height: 1.1;
`

const Delta = styled.span<{ $pos?: boolean }>`
  font-family: ${CC_FONT_BODY};
  font-size: 12px;
  font-weight: 700;
  color: ${({ $pos }) => ($pos ? commandCenterColors.green : commandCenterColors.red)};
`

const Sparkline = styled.svg`
  width: 100%;
  height: 28px;
  margin-top: 8px;
`

const Sub = styled.div`
  font-family: ${CC_FONT_BODY};
  font-size: 11px;
  color: ${commandCenterColors.muted};
  margin-top: 4px;
`

const ScoreRing = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 3px solid ${commandCenterColors.green};
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${CC_FONT_DISPLAY};
  font-size: 14px;
  font-weight: 700;
  color: ${commandCenterColors.green};
  margin-top: 8px;
`

function MiniSparkline({ points }: { points: number[] }) {
  const max = Math.max(...points)
  const min = Math.min(...points)
  const range = max - min || 1
  const w = 120
  const h = 28
  const d = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w
      const y = h - ((p - min) / range) * (h - 4) - 2
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  return (
    <Sparkline viewBox={`0 0 ${w} ${h}`} aria-hidden>
      <path d={d} fill="none" stroke={commandCenterColors.gold} strokeWidth="2" strokeLinecap="round" />
    </Sparkline>
  )
}

export const CommandKpiCluster: React.FC = () => (
  <div data-cc-kpi-cluster>
    <Grid>
      <KpiCard>
        <Label>Net Worth</Label>
        <div>
          <Value>{KPI_NET_WORTH.value}</Value>
          <Delta $pos={KPI_NET_WORTH.deltaPositive}>{KPI_NET_WORTH.delta} 24h</Delta>
          <MiniSparkline points={KPI_NET_WORTH.sparkline} />
        </div>
      </KpiCard>
      <KpiCard>
        <Label>Today&apos;s Actions</Label>
        <Value>{KPI_ACTIONS.value}</Value>
        <Sub>{KPI_ACTIONS.label}</Sub>
      </KpiCard>
      <KpiCard>
        <Label>Radar Alerts</Label>
        <Value>{KPI_RADAR.value}</Value>
        <Sub>{KPI_RADAR.label}</Sub>
      </KpiCard>
      <KpiCard>
        <Label>Rewards Pending</Label>
        <Value style={{ fontSize: 22 }}>{KPI_REWARDS.value}</Value>
        <Sub>{KPI_REWARDS.label}</Sub>
      </KpiCard>
    </Grid>
    <SmallGrid>
      <KpiCard>
        <Label>Infrastructure</Label>
        <Value>{KPI_INFRASTRUCTURE.value}</Value>
        <Sub>{KPI_INFRASTRUCTURE.label}</Sub>
      </KpiCard>
      <KpiCard>
        <Label>AI Score</Label>
        <Value>{KPI_AI_SCORE.value}</Value>
        <ScoreRing>{KPI_AI_SCORE.value}</ScoreRing>
        <Sub>{KPI_AI_SCORE.label}</Sub>
      </KpiCard>
    </SmallGrid>
  </div>
)

export default CommandKpiCluster
