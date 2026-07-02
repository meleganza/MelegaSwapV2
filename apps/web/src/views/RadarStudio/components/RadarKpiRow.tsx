import React from 'react'
import styled from 'styled-components'
import { RADAR_KPIS } from '../radarStudioData'
import { RADAR_FONT_BODY, RADAR_FONT_DISPLAY, radarStudioColors, radarStudioLayout } from '../radarStudioTokens'
import { KpiSparkline } from './radarStudioPrimitives'

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
  position: relative;
  height: ${radarStudioLayout.kpiHeight};
  min-height: ${radarStudioLayout.kpiHeight};
  border-radius: ${radarStudioLayout.kpiRadius};
  border: 1px solid ${radarStudioColors.borderMuted};
  background: ${radarStudioColors.panel};
  padding: ${radarStudioLayout.kpiPadding};
  box-sizing: border-box;
  overflow: hidden;

  @media (max-width: 767px) {
    height: 104px;
    min-height: 104px;
  }
`

const Label = styled.span`
  display: block;
  font-family: ${RADAR_FONT_BODY};
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${radarStudioColors.label};
  line-height: 14px;
`

const Value = styled.span<{ $risk?: boolean }>`
  display: block;
  margin-top: 8px;
  font-family: ${RADAR_FONT_DISPLAY};
  font-size: 42px;
  line-height: 48px;
  font-weight: 800;
  color: ${({ $risk }) => ($risk ? radarStudioColors.white : radarStudioColors.green)};
  white-space: nowrap;

  @media (max-width: 767px) {
    font-size: 34px;
    line-height: 38px;
  }
`

const Delta = styled.span<{ $positive?: boolean }>`
  position: absolute;
  left: 18px;
  bottom: 18px;
  font-family: ${RADAR_FONT_BODY};
  font-size: 13px;
  font-weight: 600;
  color: ${({ $positive }) => ($positive ? radarStudioColors.green : radarStudioColors.red)};
  white-space: nowrap;
`

const SparkWrap = styled.div`
  position: absolute;
  right: 18px;
  bottom: 18px;
`

export const RadarKpiRow: React.FC = () => (
  <Row data-rd-kpi-row>
    {RADAR_KPIS.map((kpi) => (
      <Card key={kpi.id} data-rd-kpi-card>
        <Label>{kpi.label}</Label>
        <Value $risk={kpi.id === 'risk'} data-rd-kpi-value>
          {kpi.value}
        </Value>
        <Delta $positive={kpi.deltaPositive}>{kpi.delta}</Delta>
        <SparkWrap>
          <KpiSparkline
            points={SPARKLINES[kpi.id]}
            color={kpi.deltaPositive === false ? radarStudioColors.red : radarStudioColors.green}
          />
        </SparkWrap>
      </Card>
    ))}
  </Row>
)

export default RadarKpiRow
