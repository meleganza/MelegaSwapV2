import React from 'react'
import styled from 'styled-components'
import { useCommandRuntime } from '../commandCenterRuntime/CommandRuntimeContext'
import { safeSparklinePoints } from '../commandCenterSafe'
import { CC_FONT_BODY, CC_FONT_DISPLAY, commandCenterColors, commandCenterLayout } from '../commandCenterTokens'
import { CcPanel } from './commandCenterPrimitives'

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: ${commandCenterLayout.kpiGap};
  height: ${commandCenterLayout.heroHeight};
  box-sizing: border-box;

  @media (max-width: 1024px) {
    height: auto;
    grid-template-rows: auto;
  }
`

const KpiCard = styled(CcPanel)`
  padding: 18px;
  min-height: ${commandCenterLayout.kpiCardMinHeight};
  border-radius: ${commandCenterLayout.kpiCardRadius};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-sizing: border-box;
  overflow: hidden;
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
  font-size: clamp(20px, 2.4vw, ${commandCenterLayout.kpiValueMax});
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
  height: 24px;
  margin-top: 6px;
`

const Sub = styled.div`
  font-family: ${CC_FONT_BODY};
  font-size: 11px;
  color: ${commandCenterColors.muted};
  margin-top: 4px;
`

const ScoreWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 4px;
`

const ScoreRing = styled.div`
  width: 44px;
  height: 44px;
  min-width: 44px;
  min-height: 44px;
  border-radius: 50%;
  border: 3px solid ${commandCenterColors.green};
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${CC_FONT_DISPLAY};
  font-size: 13px;
  font-weight: 700;
  color: ${commandCenterColors.green};
  flex-shrink: 0;
`

function MiniSparkline({ points }: { points: number[] }) {
  const safePoints = safeSparklinePoints(points)
  const max = Math.max(...safePoints)
  const min = Math.min(...safePoints)
  const range = max - min || 1
  const w = 120
  const h = 24
  const denom = Math.max(safePoints.length - 1, 1)
  const d = safePoints
    .map((p, i) => {
      const x = (i / denom) * w
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

export const CommandKpiCluster: React.FC = () => {
  const { kpis } = useCommandRuntime()

  return (
    <Grid data-cc-kpi-cluster>
      <KpiCard>
        <Label>Net Worth</Label>
        <div>
          <Value>{kpis.netWorth.value}</Value>
          <Delta $pos={kpis.netWorth.deltaPositive}>{kpis.netWorth.delta} 24h</Delta>
          <MiniSparkline points={kpis.netWorth.sparkline ?? []} />
        </div>
      </KpiCard>
      <KpiCard>
        <Label>Today&apos;s Actions</Label>
        <Value>{kpis.actions.value}</Value>
        <Sub>{kpis.actions.label}</Sub>
      </KpiCard>
      <KpiCard>
        <Label>Radar Alerts</Label>
        <Value>{kpis.radar.value}</Value>
        <Sub>{kpis.radar.label}</Sub>
      </KpiCard>
      <KpiCard>
        <Label>Rewards Pending</Label>
        <Value style={{ fontSize: 22 }}>{kpis.rewards.value}</Value>
        <Sub>{kpis.rewards.label}</Sub>
      </KpiCard>
      <KpiCard>
        <Label>Infrastructure</Label>
        <Value>{kpis.infrastructure.value}</Value>
        <Sub>{kpis.infrastructure.label}</Sub>
      </KpiCard>
      <KpiCard>
        <Label>AI Score</Label>
        <ScoreWrap>
          <ScoreRing aria-label={`AI Score ${kpis.aiScore.value}`}>{kpis.aiScore.value}</ScoreRing>
        </ScoreWrap>
        <Sub>{kpis.aiScore.label}</Sub>
      </KpiCard>
    </Grid>
  )
}

export default CommandKpiCluster
