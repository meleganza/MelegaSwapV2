import React from 'react'
import styled from 'styled-components'
import { formatCompactDisplay } from 'design-system/melega'
import { poolsStudioLayout } from '../poolsStudioTokens'
import { usePoolsRuntime } from '../poolsRuntime/PoolsRuntimeContext'
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

const ValueBlock = styled.div`
  position: relative;
  min-height: 38px;
  display: flex;
  align-items: center;
`

const ValueRow = styled.div`
  display: flex;
  align-items: baseline;
  min-width: 0;
  flex: 1;
`

const LoadingLine = styled.span`
  font-size: 12px;
  color: #a8a8a8;
`

export const PoolsKpiRow: React.FC = () => {
  const { kpis, loadingLabel } = usePoolsRuntime()

  return (
    <Row data-ps-kpi-row>
      {loadingLabel ? (
        <PsKpiCard data-ps-kpi-card>
          <LoadingLine>{loadingLabel}</LoadingLine>
        </PsKpiCard>
      ) : (
        kpis.map((kpi) => (
          <PsKpiCard key={kpi.id} data-ps-kpi-card>
            <PsKpiLabel>{kpi.label}</PsKpiLabel>
            <ValueBlock>
              <ValueRow>
                <PsKpiValue $gold={kpi.gold} data-ps-kpi-value style={kpi.gold ? { fontSize: 18 } : undefined}>
                  {kpi.gold ? kpi.value : formatCompactDisplay(kpi.value)}
                </PsKpiValue>
                {kpi.delta ? <PsKpiDelta $positive={kpi.deltaPositive}>{kpi.delta}</PsKpiDelta> : null}
              </ValueRow>
            </ValueBlock>
          </PsKpiCard>
        ))
      )}
    </Row>
  )
}

export default PoolsKpiRow
