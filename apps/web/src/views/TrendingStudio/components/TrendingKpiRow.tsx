import React from 'react'
import styled from 'styled-components'
import { useTrendingRuntime } from '../trendingRuntime/TrendingRuntimeContext'
import { trendingStudioLayout } from '../trendingStudioTokens'
import { AnimatedSparkline } from './trendingStudioPrimitives'

const Row = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: ${trendingStudioLayout.kpiGap};
  min-width: 0;

  @media (max-width: 1099px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 767px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`

const Card = styled.div`
  height: ${trendingStudioLayout.kpiHeight};
  min-height: ${trendingStudioLayout.kpiHeight};
  border-radius: ${trendingStudioLayout.kpiRadius};
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: #111111;
  padding: 14px 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  position: relative;
  min-width: 0;
`

const Label = styled.span`
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #8a8a8a;
`

const Value = styled.span`
  font-size: 42px;
  font-weight: 800;
  line-height: 1;
  color: #00e676;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const SparkWrap = styled.div`
  position: absolute;
  top: 14px;
  right: 12px;
`

export const TrendingKpiRow: React.FC = () => {
  const { kpis } = useTrendingRuntime()

  return (
    <Row data-tr-kpi-row>
      {kpis.map((kpi) => (
        <Card key={kpi.id} data-tr-kpi-card>
          <Label>{kpi.label}</Label>
          <Value data-tr-kpi-value>{kpi.value}</Value>
          <SparkWrap>
            <AnimatedSparkline points={kpi.sparkline} />
          </SparkWrap>
        </Card>
      ))}
    </Row>
  )
}

export default TrendingKpiRow
