import React from 'react'
import styled from 'styled-components'
import { useBuildRuntime } from '../buildRuntime/BuildRuntimeContext'
import { BS_FONT_BODY, BS_FONT_DISPLAY, buildStudioColors, buildStudioLayout } from '../buildStudioTokens'
import { MiniSparkline } from './buildStudioPrimitives'

const Row = styled.div`
  display: flex;
  gap: ${buildStudioLayout.kpiGap};
  min-width: 0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 4px;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 768px) {
    scroll-snap-type: x mandatory;
  }
`

const Card = styled.div`
  width: ${buildStudioLayout.kpiWidth};
  min-width: ${buildStudioLayout.kpiWidth};
  height: ${buildStudioLayout.kpiHeight};
  padding: 16px;
  border-radius: ${buildStudioLayout.cardRadius};
  background: ${buildStudioColors.panel};
  border: 1px solid ${buildStudioColors.border};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-shrink: 0;
  transition: border-color ${buildStudioLayout.transition} ease, transform ${buildStudioLayout.transition} ease;

  &:hover {
    border-color: ${buildStudioColors.gold};
    transform: translateY(-6px);
  }

  @media (max-width: 768px) {
    width: 220px;
    min-width: 220px;
    height: 110px;
    scroll-snap-align: start;
  }
`

const Label = styled.span`
  font-family: ${BS_FONT_BODY};
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: ${buildStudioColors.label};
`

const Bottom = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 8px;
`

const ValueCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const Value = styled.span`
  font-family: ${BS_FONT_DISPLAY};
  font-size: 50px;
  font-weight: 700;
  line-height: 1;
  color: ${buildStudioColors.white};
  letter-spacing: -1px;

  @media (max-width: 768px) {
    font-size: 40px;
  }
`

const Delta = styled.span<{ $positive?: boolean }>`
  font-family: ${BS_FONT_BODY};
  font-size: 18px;
  font-weight: 600;
  color: ${({ $positive }) => ($positive ? buildStudioColors.green : buildStudioColors.red)};
`

export const BuildKpiRow: React.FC = () => {
  const { kpis } = useBuildRuntime()

  return (
    <Row data-bs-kpi-row>
      {kpis.map((kpi) => (
        <Card key={kpi.id} data-bs-kpi-card>
          <Label>{kpi.label}</Label>
          <Bottom>
            <ValueCol>
              <Value>{kpi.value}</Value>
              {kpi.delta ? <Delta $positive={kpi.deltaPositive}>{kpi.delta}</Delta> : null}
            </ValueCol>
            <MiniSparkline points={kpi.sparkline} />
          </Bottom>
        </Card>
      ))}
    </Row>
  )
}

export default BuildKpiRow
