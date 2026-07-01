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
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 12px;

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`

const Label = styled.span`
  color: ${liquidityStudioColors.muted};
  font-weight: 600;
`

const Value = styled.span`
  color: ${liquidityStudioColors.text};
  font-weight: 700;
  text-align: right;
`

const Risk = styled.span`
  color: ${liquidityStudioColors.goldBright};
  font-weight: 700;
  text-align: right;
`

const ITEMS = [
  { label: 'Pool Health', value: 'Stable' },
  { label: 'Best Opportunity', value: 'MARCO / BNB' },
  { label: 'Risk', value: 'Low', risk: true },
]

export const AILiquidityAdvisorPanel: React.FC = () => (
  <Panel data-ls-panel>
    <Head>
      <Title>AI Liquidity Advisor</Title>
      <Badge>{LIQUIDITY_STUDIO_PREVIEW_LABEL}</Badge>
    </Head>
    {ITEMS.map((item) => (
      <Row key={item.label}>
        <Label>{item.label}</Label>
        {item.risk ? <Risk>{item.value}</Risk> : <Value>{item.value}</Value>}
      </Row>
    ))}
  </Panel>
)

export default AILiquidityAdvisorPanel
