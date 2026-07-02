import React from 'react'
import styled from 'styled-components'
import { formatCompactDisplay } from 'design-system/melega'
import { FARMS_KPIS } from '../farmsStudioData'
import { farmsStudioLayout } from '../farmsStudioTokens'
import { FsKpiCard, FsKpiDelta, FsKpiLabel, FsKpiValue } from './farmsStudioPrimitives'

const Row = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: ${farmsStudioLayout.kpiGap};
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
    $hasSparkline ? farmsStudioLayout.sparklineW + Number.parseInt(farmsStudioLayout.kpiSparkGap, 10) : 0}px;
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
  width: ${farmsStudioLayout.sparklineW}px;
  height: ${farmsStudioLayout.sparklineH}px;
`

function MiniSparkline({ points }: { points: number[] }) {
  const max = Math.max(...points)
  const min = Math.min(...points)
  const range = max - min || 1
  const w = farmsStudioLayout.sparklineW
  const h = farmsStudioLayout.sparklineH
  const d = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w
      const y = h - ((p - min) / range) * (h - 2) - 1
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  return (
    <Sparkline viewBox={`0 0 ${w} ${h}`} data-fs-sparkline aria-hidden>
      <path d={d} fill="none" stroke="#00E676" strokeWidth="1.5" strokeLinecap="round" />
    </Sparkline>
  )
}

export const FarmsKpiRow: React.FC = () => (
  <Row data-fs-kpi-row>
    {FARMS_KPIS.map((kpi) => (
      <FsKpiCard key={kpi.id} data-fs-kpi-card>
        <FsKpiLabel>{kpi.label}</FsKpiLabel>
        <ValueBlock $hasSparkline={!!kpi.sparkline}>
          <ValueRow>
            <FsKpiValue $gold={kpi.gold} data-fs-kpi-value style={kpi.gold ? { fontSize: 18 } : undefined}>
              {kpi.gold ? kpi.value : formatCompactDisplay(kpi.value)}
            </FsKpiValue>
            {kpi.delta ? <FsKpiDelta $positive={kpi.deltaPositive}>{kpi.delta}</FsKpiDelta> : null}
          </ValueRow>
          {kpi.sparkline ? <MiniSparkline points={kpi.sparkline} /> : null}
        </ValueBlock>
      </FsKpiCard>
    ))}
  </Row>
)

export default FarmsKpiRow
