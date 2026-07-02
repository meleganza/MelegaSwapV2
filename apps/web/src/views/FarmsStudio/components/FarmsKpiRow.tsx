import React from 'react'
import styled from 'styled-components'
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

const ValueRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-width: 0;
`

export const FarmsKpiRow: React.FC = () => (
  <Row data-fs-kpi-row>
    {FARMS_KPIS.map((kpi) => (
      <FsKpiCard key={kpi.id} data-fs-kpi-card>
        <FsKpiLabel>{kpi.label}</FsKpiLabel>
        <ValueRow>
          <FsKpiValue $gold={kpi.gold} data-fs-kpi-value>
            {kpi.value}
          </FsKpiValue>
          {kpi.delta ? <FsKpiDelta $positive={kpi.deltaPositive}>{kpi.delta}</FsKpiDelta> : null}
        </ValueRow>
      </FsKpiCard>
    ))}
  </Row>
)

export default FarmsKpiRow
