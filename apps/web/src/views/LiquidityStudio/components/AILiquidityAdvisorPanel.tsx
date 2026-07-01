import React from 'react'
import styled from 'styled-components'
import { liquidityStudioColors, liquidityStudioLayout } from '../liquidityStudioTokens'
import { LsPanel, LsSectionTitle, LsPreviewBadge } from './liquidityStudioPrimitives'

const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
`

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 28px;
  font-size: 12px;
`

const Label = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: ${liquidityStudioColors.muted};
`

const Stable = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: ${liquidityStudioColors.green};
`

const Gold = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: ${liquidityStudioColors.goldBright};
`

const ITEMS = [
  { label: 'Pool Health', value: 'Stable', tone: 'green' as const },
  { label: 'Best Opportunity', value: 'MARCO / BNB', tone: 'gold' as const },
  { label: 'Risk', value: 'Low', tone: 'green' as const },
]

export const AILiquidityAdvisorPanel: React.FC = () => (
  <LsPanel data-ls-panel $height={liquidityStudioLayout.aiAdvisorHeight}>
    <Head>
      <LsSectionTitle style={{ margin: 0 }}>AI Liquidity Advisor</LsSectionTitle>
      <LsPreviewBadge style={{ height: 20, padding: '0 8px', fontSize: 9 }}>PREVIEW</LsPreviewBadge>
    </Head>
    {ITEMS.map((item) => (
      <Row key={item.label}>
        <Label>{item.label}</Label>
        {item.tone === 'gold' ? <Gold>{item.value}</Gold> : <Stable>{item.value}</Stable>}
      </Row>
    ))}
  </LsPanel>
)

export default AILiquidityAdvisorPanel
