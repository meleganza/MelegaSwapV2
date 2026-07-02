import React from 'react'
import styled from 'styled-components'
import { liquidityStudioColors, liquidityStudioLayout } from '../liquidityStudioTokens'
import { LsPanel, LsRightLabel, LsRightRow, LsRightValue, LsSectionTitle } from './liquidityStudioPrimitives'

const Delta = styled.span`
  font-size: 12px;
  font-weight: 800;
  color: ${liquidityStudioColors.green};
  margin-left: 6px;
`

const ValueWrap = styled.span`
  display: inline-flex;
  align-items: baseline;
`

const METRICS = [
  { label: 'TVL', value: '$24.56M', delta: '+2.35%' },
  { label: '24H Volume', value: '$3.21M', delta: '+1.12%' },
  { label: 'Pool APR', value: '36.08%', delta: '+0.84%' },
  { label: 'Fees Generated', value: '$9.87K', delta: '+3.40%' },
]

export const MarketIntelligencePanel: React.FC = () => (
  <LsPanel
    data-ls-panel
    $width={liquidityStudioLayout.rightWidth}
    $height={liquidityStudioLayout.marketIntelHeight}
    $radius={liquidityStudioLayout.rightPanelRadius}
    $pad={liquidityStudioLayout.rightPanelPadding}
  >
    <LsSectionTitle>Market Intelligence</LsSectionTitle>
    {METRICS.map((m) => (
      <LsRightRow key={m.label}>
        <LsRightLabel>{m.label}</LsRightLabel>
        <ValueWrap>
          <LsRightValue>{m.value}</LsRightValue>
          <Delta>{m.delta}</Delta>
        </ValueWrap>
      </LsRightRow>
    ))}
  </LsPanel>
)

export default MarketIntelligencePanel
