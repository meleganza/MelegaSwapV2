import React from 'react'
import styled from 'styled-components'
import { displayStudioMetric, isStudioMetricUnavailable, STUDIO_KPI_VALUE } from 'design-system/melega'
import TradeTechnicalDetails from 'views/Trade/components/TradeTechnicalDetails'
import { useRadarRuntime } from '../radarRuntime/RadarRuntimeContext'
import { RADAR_FONT_BODY, RADAR_FONT_DISPLAY, radarStudioColors, radarStudioLayout } from '../radarStudioTokens'
import { KpiSparkline } from './radarStudioPrimitives'

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

const Value = styled.span<{ $risk?: boolean; $unavailable?: boolean }>`
  display: block;
  margin-top: 8px;
  font-family: ${RADAR_FONT_BODY};
  font-size: ${STUDIO_KPI_VALUE.size};
  line-height: ${STUDIO_KPI_VALUE.lineHeight};
  font-weight: ${STUDIO_KPI_VALUE.weight};
  font-variant-numeric: ${STUDIO_KPI_VALUE.fontVariantNumeric};
  color: ${({ $risk, $unavailable }) =>
    $unavailable ? radarStudioColors.muted : $risk ? radarStudioColors.white : radarStudioColors.green};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

export const RadarKpiRow: React.FC = () => {
  const { kpis } = useRadarRuntime()

  return (
    <Row data-rd-kpi-row>
      {kpis.map((kpi) => {
        const display = displayStudioMetric(kpi.value)
        const unavailable = isStudioMetricUnavailable(kpi.value) || kpi.unavailable
        return (
        <Card key={kpi.id} data-rd-kpi-card>
          <Label>{kpi.label}</Label>
          <Value $risk={kpi.id === 'risk'} $unavailable={unavailable} data-rd-kpi-value>
            {display}
          </Value>
          {unavailable ? (
            <TradeTechnicalDetails detail="Radar metrics require wallet activity and DEX indexer when deployed." />
          ) : null}
          {kpi.delta ? <Delta $positive={kpi.deltaPositive}>{kpi.delta}</Delta> : null}
        </Card>
        )
      })}
    </Row>
  )
}

export default RadarKpiRow
