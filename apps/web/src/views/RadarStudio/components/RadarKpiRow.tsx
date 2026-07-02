import React from 'react'
import styled from 'styled-components'
import { RADAR_KPIS } from '../radarStudioData'
import { RADAR_FONT_BODY, RADAR_FONT_DISPLAY, radarStudioColors, radarStudioLayout } from '../radarStudioTokens'
import { AnimatedSparkline } from './radarStudioPrimitives'

const SPARKLINES: Record<string, number[]> = {
  indexed: [8, 9, 10, 11, 12, 13, 12, 14],
  signals: [4, 5, 6, 5, 7, 8, 9, 10],
  whales: [2, 3, 2, 4, 3, 5, 4, 6],
  confidence: [5, 6, 7, 8, 7, 9, 10, 11],
  risk: [6, 5, 5, 4, 4, 3, 3, 2],
}

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
`

const Label = styled.span`
  font-family: ${RADAR_FONT_BODY};
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${radarStudioColors.grey};
`

const ValueRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 10px;
  min-width: 0;
  flex-wrap: wrap;
`

const Value = styled.span`
  font-family: ${RADAR_FONT_DISPLAY};
  font-size: 56px;
  font-weight: 700;
  line-height: 1;
  color: ${radarStudioColors.green};
  white-space: nowrap;
`

const Delta = styled.span<{ $positive?: boolean }>`
  font-family: ${RADAR_FONT_BODY};
  font-size: 13px;
  font-weight: 600;
  color: ${({ $positive }) => ($positive ? radarStudioColors.green : radarStudioColors.red)};
  white-space: nowrap;
`

const SparkWrap = styled.div`
  position: absolute;
  right: 16px;
  bottom: 18px;
  opacity: 0.85;
`

export const RadarKpiRow: React.FC = () => (
  <Row data-rd-kpi-row>
    {RADAR_KPIS.map((kpi) => (
      <Card key={kpi.id} data-rd-kpi-card>
        <Label>{kpi.label}</Label>
        <ValueRow>
          <Value data-rd-kpi-value>{kpi.value}</Value>
          <Delta $positive={kpi.deltaPositive}>{kpi.delta}</Delta>
        </ValueRow>
        <SparkWrap>
          <AnimatedSparkline
            points={SPARKLINES[kpi.id]}
            color={kpi.deltaPositive === false ? radarStudioColors.red : radarStudioColors.green}
          />
        </SparkWrap>
      </Card>
    ))}
  </Row>
)

export default RadarKpiRow
