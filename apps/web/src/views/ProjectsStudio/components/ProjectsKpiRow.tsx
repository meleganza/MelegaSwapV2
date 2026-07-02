import React from 'react'
import styled from 'styled-components'
import { formatCompactDisplay } from 'design-system/melega'
import { PROJECTS_KPIS } from '../projectsStudioData'
import { projectsStudioLayout } from '../projectsStudioTokens'
import { PrKpiCard, PrKpiDelta, PrKpiLabel, PrKpiValue } from './projectsStudioPrimitives'

const Row = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: ${projectsStudioLayout.kpiGap};
  min-width: 0;

  @media (max-width: 1099px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 767px) {
    grid-template-columns: repeat(2, 1fr);
  }
`

const ValueBlock = styled.div<{ $hasSparkline?: boolean }>`
  position: relative;
  min-height: 38px;
  padding-right: ${({ $hasSparkline }) =>
    $hasSparkline ? projectsStudioLayout.sparklineW + Number.parseInt(projectsStudioLayout.kpiSparkGap, 10) : 0}px;
  display: flex;
  align-items: center;
`

const ValueRow = styled.div`
  display: flex;
  align-items: baseline;
  min-width: 0;
  flex: 1;
`

const Sparkline = styled.svg`
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: ${projectsStudioLayout.sparklineW}px;
  height: ${projectsStudioLayout.sparklineH}px;
`

function MiniSparkline({ points }: { points: number[] }) {
  const max = Math.max(...points)
  const min = Math.min(...points)
  const range = max - min || 1
  const w = projectsStudioLayout.sparklineW
  const h = projectsStudioLayout.sparklineH
  const d = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w
      const y = h - ((p - min) / range) * (h - 2) - 1
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  return (
    <Sparkline viewBox={`0 0 ${w} ${h}`} data-pr-sparkline aria-hidden>
      <path d={d} fill="none" stroke="#00E676" strokeWidth="1.5" strokeLinecap="round" />
    </Sparkline>
  )
}

export const ProjectsKpiRow: React.FC = () => (
  <Row data-pr-kpi-row>
    {PROJECTS_KPIS.map((kpi) => (
      <PrKpiCard key={kpi.id} data-pr-kpi-card>
        <PrKpiLabel>{kpi.label}</PrKpiLabel>
        <ValueBlock $hasSparkline={!!kpi.sparkline}>
          <ValueRow>
            <PrKpiValue $gold={kpi.gold} data-pr-kpi-value style={kpi.gold ? { fontSize: 18 } : undefined}>
              {kpi.gold ? kpi.value : formatCompactDisplay(kpi.value)}
            </PrKpiValue>
            {kpi.delta ? <PrKpiDelta $positive={kpi.deltaPositive}>{kpi.delta}</PrKpiDelta> : null}
          </ValueRow>
          {kpi.sparkline ? <MiniSparkline points={kpi.sparkline} /> : null}
        </ValueBlock>
      </PrKpiCard>
    ))}
  </Row>
)

export default ProjectsKpiRow
