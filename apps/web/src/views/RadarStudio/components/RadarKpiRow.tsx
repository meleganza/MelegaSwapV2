import React from 'react'
import styled from 'styled-components'
import { RADAR_KPIS } from '../radarStudioData'
import { RADAR_FONT, radarStudioColors, radarStudioLayout } from '../radarStudioTokens'
import { AnimatedSparkline } from './radarStudioPrimitives'

const Row = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: ${radarStudioLayout.kpiGap};
  min-width: 0;

  @media (max-width: 1099px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 767px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`

const Card = styled.div`
  height: ${radarStudioLayout.kpiHeight};
  min-height: ${radarStudioLayout.kpiHeight};
  border-radius: ${radarStudioLayout.kpiRadius};
  border: 1px solid ${radarStudioColors.border};
  background: ${radarStudioColors.panel};
  padding: ${radarStudioLayout.kpiPadding};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  min-width: 0;
  box-shadow: ${radarStudioColors.shadow};
`

const Top = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const Icon = styled.span`
  font-size: 14px;
  color: ${radarStudioColors.gold};
`

const Label = styled.span`
  font-family: ${RADAR_FONT};
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${radarStudioColors.grey};
`

const ValueRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 10px;
  min-width: 0;
  padding-right: ${radarStudioLayout.sparklineW + 8}px;
`

const Value = styled.span`
  font-family: ${RADAR_FONT};
  font-size: 46px;
  font-weight: 800;
  line-height: 1;
  color: ${radarStudioColors.green};
  white-space: nowrap;
`

const Delta = styled.span<{ $positive?: boolean }>`
  font-family: ${RADAR_FONT};
  font-size: 13px;
  font-weight: 600;
  color: ${({ $positive }) => ($positive ? radarStudioColors.green : radarStudioColors.red)};
  white-space: nowrap;
`

const SparkWrap = styled.div`
  position: absolute;
  right: 16px;
  bottom: 20px;
`

export const RadarKpiRow: React.FC = () => (
  <Row data-rd-kpi-row>
    {RADAR_KPIS.map((kpi) => (
      <Card key={kpi.id} data-rd-kpi-card>
        <Top>
          <Icon>{kpi.icon}</Icon>
          <Label>{kpi.label}</Label>
        </Top>
        <ValueRow>
          <Value data-rd-kpi-value>{kpi.value}</Value>
          <Delta $positive={kpi.deltaPositive}>{kpi.delta}</Delta>
        </ValueRow>
        <SparkWrap>
          <AnimatedSparkline
            points={kpi.sparkline}
            color={kpi.deltaPositive === false ? radarStudioColors.red : radarStudioColors.green}
          />
        </SparkWrap>
      </Card>
    ))}
  </Row>
)

export default RadarKpiRow
