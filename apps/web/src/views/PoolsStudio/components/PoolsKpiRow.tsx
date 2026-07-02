import React from 'react'
import styled from 'styled-components'
import { formatCompactDisplay } from 'design-system/melega'
import { POOLS_KPIS } from '../poolsStudioData'
import { poolsStudioLayout } from '../poolsStudioTokens'
import { PsKpiCard, PsKpiDelta, PsKpiLabel, PsKpiValue } from './poolsStudioPrimitives'

const Row = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: ${poolsStudioLayout.kpiGap};
  min-width: 0;

  @media (max-width: 1099px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
  }
`

const ValueBlock = styled.div<{ $hasSparkline?: boolean }>`
  position: relative;
  min-height: 38px;
  padding-right: ${({ $hasSparkline }) =>
    $hasSparkline ? poolsStudioLayout.sparklineW + Number.parseInt(poolsStudioLayout.kpiSparkGap, 10) : 0}px;
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
  width: ${poolsStudioLayout.sparklineW}px;
  height: ${poolsStudioLayout.sparklineH}px;
`

function MiniSparkline({ points }: { points: number[] }) {
  const max = Math.max(...points)
  const min = Math.min(...points)
  const range = max - min || 1
  const w = poolsStudioLayout.sparklineW
  const h = poolsStudioLayout.sparklineH
  const d = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w
      const y = h - ((p - min) / range) * (h - 2) - 1
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  return (
    <Sparkline viewBox={`0 0 ${w} ${h}`} data-ps-sparkline aria-hidden>
      <path d={d} fill="none" stroke="#00E676" strokeWidth="1.5" strokeLinecap="round" />
    </Sparkline>
  )
}

export const PoolsKpiRow: React.FC = () => (
  <Row data-ps-kpi-row>
    {POOLS_KPIS.map((kpi) => (
      <PsKpiCard key={kpi.id} data-ps-kpi-card>
        <PsKpiLabel>{kpi.label}</PsKpiLabel>
        <ValueBlock $hasSparkline={!!kpi.sparkline}>
          <ValueRow>
            <PsKpiValue $gold={kpi.gold} data-ps-kpi-value style={kpi.gold ? { fontSize: 18 } : undefined}>
              {kpi.gold ? kpi.value : formatCompactDisplay(kpi.value)}
            </PsKpiValue>
            {kpi.delta ? <PsKpiDelta $positive={kpi.deltaPositive}>{kpi.delta}</PsKpiDelta> : null}
          </ValueRow>
          {kpi.sparkline ? <MiniSparkline points={kpi.sparkline} /> : null}
        </ValueBlock>
      </PsKpiCard>
    ))}
  </Row>
)

export default PoolsKpiRow
