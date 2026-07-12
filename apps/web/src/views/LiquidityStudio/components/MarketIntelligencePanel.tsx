import React, { useMemo } from 'react'
import styled from 'styled-components'
import TradeTechnicalDetails from 'views/Trade/components/TradeTechnicalDetails'
import { liquidityStudioColors, liquidityStudioLayout } from '../liquidityStudioTokens'
import { useLiquidityRuntime } from '../liquidityRuntime/LiquidityRuntimeContext'
import { LsPanel, LsRightLabel, LsRightRow, LsRightValue, LsSectionTitle } from './liquidityStudioPrimitives'

const Delta = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: ${liquidityStudioColors.green};
  margin-left: 6px;
`

const ValueWrap = styled.span`
  display: inline-flex;
  align-items: baseline;
  min-width: 0;
`

const MetricStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-height: 0;
`

const UnavailableWrap = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  min-height: 0;
`

const UnavailableTitle = styled.p`
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: ${liquidityStudioColors.text};
`

const UnavailableReason = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 1.45;
  color: ${liquidityStudioColors.muted};
`

export const MarketIntelligencePanel: React.FC = () => {
  const { terminal, machine } = useLiquidityRuntime()
  const { marketMetrics, marketUnavailableReason } = terminal

  const technicalDetail = useMemo(() => JSON.stringify(machine, null, 2), [machine])

  const hasLiveMetrics = useMemo(
    () => marketMetrics.some((metric) => metric.value && metric.value !== '—'),
    [marketMetrics],
  )

  return (
    <LsPanel
      data-ls-panel
      $width={liquidityStudioLayout.rightWidth}
      $height="100%"
      $radius={liquidityStudioLayout.rightPanelRadius}
      $pad={liquidityStudioLayout.rightPanelPadding}
    >
      <LsSectionTitle>Market intelligence</LsSectionTitle>
      {marketUnavailableReason || !hasLiveMetrics ? (
        <UnavailableWrap data-ls-market-unavailable>
          <UnavailableTitle>Pool metrics not indexed</UnavailableTitle>
          <TradeTechnicalDetails detail={technicalDetail} />
        </UnavailableWrap>
      ) : (
        <MetricStack>
          {marketMetrics.map((m) => (
            <LsRightRow key={m.label}>
              <LsRightLabel>{m.label}</LsRightLabel>
              <ValueWrap>
                <LsRightValue>{m.value}</LsRightValue>
                {m.delta ? <Delta>{m.delta}</Delta> : null}
              </ValueWrap>
            </LsRightRow>
          ))}
        </MetricStack>
      )}
    </LsPanel>
  )
}

export default MarketIntelligencePanel
