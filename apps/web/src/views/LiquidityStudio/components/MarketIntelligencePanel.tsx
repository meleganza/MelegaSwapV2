import React from 'react'
import styled from 'styled-components'
import { liquidityStudioColors, liquidityStudioLayout } from '../liquidityStudioTokens'
import { LsPanel, LsSectionTitle } from './liquidityStudioPrimitives'

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 26px;
  height: 26px;
`

const Label = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: ${liquidityStudioColors.muted};
`

const ValueWrap = styled.span`
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
`

const Value = styled.span`
  font-size: 18px;
  font-weight: 700;
  color: ${liquidityStudioColors.text};
  line-height: 1;
`

const Delta = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: ${liquidityStudioColors.green};
`

const METRICS = [
  { label: 'TVL', value: '$24.56M', delta: '+2.35%' },
  { label: '24H Volume', value: '$3.21M', delta: '+1.12%' },
  { label: 'Pool APR', value: '36.08%', delta: '+0.84%' },
  { label: 'Fees Generated', value: '$9.87K', delta: '+3.40%' },
]

export const MarketIntelligencePanel: React.FC = () => (
  <LsPanel data-ls-panel $height={liquidityStudioLayout.marketIntelHeight}>
    <LsSectionTitle>Market Intelligence</LsSectionTitle>
    {METRICS.map((m) => (
      <Row key={m.label}>
        <Label>{m.label}</Label>
        <ValueWrap>
          <Value>{m.value}</Value>
          <Delta>{m.delta}</Delta>
        </ValueWrap>
      </Row>
    ))}
  </LsPanel>
)

export default MarketIntelligencePanel
