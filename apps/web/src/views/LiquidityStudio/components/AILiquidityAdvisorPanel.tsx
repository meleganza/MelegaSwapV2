import React from 'react'
import styled from 'styled-components'
import { liquidityStudioColors, liquidityStudioLayout } from '../liquidityStudioTokens'
import {
  LsPanel,
  LsPreviewBadge,
  LsRightLabel,
  LsRightRow,
  LsRightValue,
  LsSectionTitle,
} from './liquidityStudioPrimitives'

const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
`

const Green = styled.span`
  font-size: 14px;
  font-weight: 800;
  color: ${liquidityStudioColors.green};
`

const Gold = styled.span`
  font-size: 14px;
  font-weight: 800;
  color: ${liquidityStudioColors.gold};
`

const ITEMS = [
  { label: 'Pool Health', value: 'Stable', tone: 'green' as const },
  { label: 'Best Opportunity', value: 'MARCO / BNB', tone: 'gold' as const },
  { label: 'Risk', value: 'Low', tone: 'green' as const },
]

export const AILiquidityAdvisorPanel: React.FC = () => (
  <LsPanel
    data-ls-panel
    $width={liquidityStudioLayout.rightWidth}
    $height={liquidityStudioLayout.aiAdvisorHeight}
    $radius={liquidityStudioLayout.rightPanelRadius}
    $pad={liquidityStudioLayout.rightPanelPadding}
  >
    <Head>
      <LsSectionTitle style={{ margin: 0 }}>AI Liquidity Advisor</LsSectionTitle>
      <LsPreviewBadge style={{ height: 20, padding: '0 8px', fontSize: 9 }}>PREVIEW</LsPreviewBadge>
    </Head>
    {ITEMS.map((item) => (
      <LsRightRow key={item.label}>
        <LsRightLabel>{item.label}</LsRightLabel>
        {item.tone === 'gold' ? <Gold>{item.value}</Gold> : <Green>{item.value}</Green>}
      </LsRightRow>
    ))}
  </LsPanel>
)

export default AILiquidityAdvisorPanel
