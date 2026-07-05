import React from 'react'
import styled from 'styled-components'
import { premiumUiValue, PREMIUM_EMPTY } from 'design-system/melega/tokens/premiumStudio'
import { useTrendingRuntime } from '../trendingRuntime/TrendingRuntimeContext'
import { trendingStudioColors, trendingStudioLayout } from '../trendingStudioTokens'
import { AnimatedSparkline } from './trendingStudioPrimitives'

const Row = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: ${trendingStudioLayout.cardGap};
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
  padding: 24px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  position: relative;
  min-width: 0;
  transition: border-color ${trendingStudioLayout.hoverTransition} ease;

  &:hover {
    border-color: ${trendingStudioColors.cardBorderHover};
  }
`

const Label = styled.span`
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${trendingStudioColors.gray};
  padding-right: 72px;
`

const Value = styled.span<{ $muted?: boolean }>`
  font-size: ${({ $muted }) => ($muted ? '18px' : '36px')};
  font-weight: 800;
  line-height: 1;
  color: ${({ $muted }) => ($muted ? trendingStudioColors.gray : trendingStudioColors.green)};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Subline = styled.span`
  font-size: 13px;
  color: ${trendingStudioColors.gray};
  line-height: 1.35;
`

const SparkWrap = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  pointer-events: none;
`

export const TrendingKpiRow: React.FC = () => {
  const { kpis } = useTrendingRuntime()

  return (
    <Row data-tr-kpi-row>
      {kpis.map((kpi) => {
        const display = premiumUiValue(kpi.value)
        const muted = display === PREMIUM_EMPTY
        return (
          <Card key={kpi.id} data-tr-kpi-card>
            <Label>{kpi.label}</Label>
            <Value $muted={muted} data-tr-kpi-value>
              {display}
            </Value>
            {muted ? <Subline>Awaiting live intelligence feed</Subline> : null}
            <SparkWrap>
              <AnimatedSparkline points={kpi.sparkline} />
            </SparkWrap>
          </Card>
        )
      })}
    </Row>
  )
}

export default TrendingKpiRow
