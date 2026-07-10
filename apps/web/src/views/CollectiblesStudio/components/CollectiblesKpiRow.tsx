import React from 'react'
import styled from 'styled-components'
import { displayStudioMetric, STUDIO_KPI_VALUE } from 'design-system/melega'
import { useCollectiblesRuntime } from '../collectiblesRuntime/CollectiblesRuntimeContext'
import { collectiblesStudioLayout } from '../collectiblesStudioTokens'
import { KpiIcon } from './collectiblesStudioIcons'
import { CsKpiCard, CsKpiDelta, CsKpiValue, CsLabel } from './collectiblesStudioPrimitives'

const Row = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: ${collectiblesStudioLayout.kpiGap};
  min-width: 0;

  @media (max-width: 1099px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 768px) {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    gap: 12px;
    padding-bottom: 4px;
    -webkit-overflow-scrolling: touch;

    &::-webkit-scrollbar {
      display: none;
    }
  }
`

const Top = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`

const ValueBlock = styled.div`
  position: relative;
  min-height: 56px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding-right: 48px;
`

const DeltaRow = styled.div`
  margin-top: 4px;
`

const Sparkline = styled.svg`
  position: absolute;
  right: 0;
  bottom: 4px;
  width: ${collectiblesStudioLayout.sparklineW}px;
  height: ${collectiblesStudioLayout.sparklineH}px;
`

function MiniSparkline({ points }: { points: number[] }) {
  const max = Math.max(...points)
  const min = Math.min(...points)
  const range = max - min || 1
  const w = collectiblesStudioLayout.sparklineW
  const h = collectiblesStudioLayout.sparklineH
  const d = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w
      const y = h - ((p - min) / range) * (h - 2) - 1
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  return (
    <Sparkline viewBox={`0 0 ${w} ${h}`} data-cs-sparkline aria-hidden>
      <path d={d} fill="none" stroke="#1BE77A" strokeWidth="1.5" strokeLinecap="round" />
    </Sparkline>
  )
}

const MobileCard = styled(CsKpiCard)`
  @media (max-width: 768px) {
    flex: 0 0 220px;
    height: 110px;
    min-height: 110px;
    scroll-snap-align: start;
  }
`

export const CollectiblesKpiRow: React.FC = () => {
  const { kpis } = useCollectiblesRuntime()

  return (
  <Row data-cs-kpi-row>
    {kpis.map((kpi) => (
      <MobileCard key={kpi.id} data-cs-kpi-card>
        <Top>
          <CsLabel>{kpi.label}</CsLabel>
          <KpiIcon icon={kpi.icon} />
        </Top>
        <ValueBlock>
          <CsKpiValue data-cs-kpi-value>{displayStudioMetric(kpi.value)}</CsKpiValue>
          {kpi.delta ? (
            <DeltaRow>
              <CsKpiDelta $positive={kpi.deltaPositive}>{kpi.delta}</CsKpiDelta>
            </DeltaRow>
          ) : null}
          {kpi.sparkline ? <MiniSparkline points={kpi.sparkline} /> : null}
        </ValueBlock>
      </MobileCard>
    ))}
  </Row>
  )
}

export default CollectiblesKpiRow
