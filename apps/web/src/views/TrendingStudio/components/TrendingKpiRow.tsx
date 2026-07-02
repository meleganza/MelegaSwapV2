import React from 'react'
import styled from 'styled-components'
import { TRENDING_KPIS } from '../trendingStudioData'
import { trendingStudioColors, trendingStudioLayout } from '../trendingStudioTokens'
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
  border: 1px solid ${trendingStudioColors.border};
  background: ${trendingStudioColors.panel};
  padding: 14px 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  position: relative;
  min-width: 0;
  box-shadow: ${trendingStudioColors.shadow};
`

const Label = styled.span`
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${trendingStudioColors.gray};
`

const ValueRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 10px;
  min-width: 0;
`

const Value = styled.span`
  font-size: 42px;
  font-weight: 800;
  line-height: 1;
  color: ${trendingStudioColors.green};
  white-space: nowrap;
`

const Delta = styled.span`
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
  color: ${trendingStudioColors.green};
`

const SparkWrap = styled.div`
  position: absolute;
  top: 14px;
  right: 12px;
`

export const TrendingKpiRow: React.FC = () => (
  <Row data-tr-kpi-row>
    {TRENDING_KPIS.map((kpi) => (
      <Card key={kpi.id} data-tr-kpi-card>
        <Label>{kpi.label}</Label>
        <ValueRow>
          <Value data-tr-kpi-value>{kpi.value}</Value>
          <Delta>{kpi.delta}</Delta>
        </ValueRow>
        <SparkWrap>
          <AnimatedSparkline points={kpi.sparkline} />
        </SparkWrap>
      </Card>
    ))}
  </Row>
)

export default TrendingKpiRow
