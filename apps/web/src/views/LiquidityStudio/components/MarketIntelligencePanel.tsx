import React from 'react'
import styled from 'styled-components'
import { liquidityStudioColors, liquidityStudioLayout, LIQUIDITY_STUDIO_PREVIEW_LABEL } from '../liquidityStudioTokens'

const Panel = styled.div`
  background: ${liquidityStudioColors.panel};
  border: 1px solid ${liquidityStudioColors.border};
  border-radius: ${liquidityStudioLayout.panelRadius};
  padding: ${liquidityStudioLayout.panelPadding};
  box-sizing: border-box;
`

const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
`

const Title = styled.h3`
  margin: 0;
  font-size: 15px;
  font-weight: 800;
  color: ${liquidityStudioColors.text};
`

const Badge = styled.span`
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: ${liquidityStudioColors.muted};
`

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 28px;
  font-size: 12px;
  line-height: 1.2;

  & + & {
    margin-top: 4px;
  }
`

const Label = styled.span`
  color: ${liquidityStudioColors.muted};
`

const Value = styled.span`
  color: ${liquidityStudioColors.text};
  font-weight: 700;
`

const METRICS = [
  { label: 'TVL', value: '$2.4M' },
  { label: '24H Volume', value: '$186K' },
  { label: 'Pool APR', value: '12.4%' },
  { label: 'Fees Generated', value: '$4.2K' },
]

export const MarketIntelligencePanel: React.FC = () => (
  <Panel data-ls-panel>
    <Head>
      <Title>Market Intelligence</Title>
      <Badge>{LIQUIDITY_STUDIO_PREVIEW_LABEL}</Badge>
    </Head>
    {METRICS.map((m) => (
      <Row key={m.label}>
        <Label>{m.label}</Label>
        <Value>{m.value}</Value>
      </Row>
    ))}
  </Panel>
)

export default MarketIntelligencePanel
