import React from 'react'
import styled from 'styled-components'
import { liquidityStudioColors, liquidityStudioLayout } from '../liquidityStudioTokens'
import { useLiquidityRuntime } from '../liquidityRuntime/LiquidityRuntimeContext'
import { LsPanel, LsRightLabel, LsRightRow, LsRightValue, LsSectionTitle } from './liquidityStudioPrimitives'

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

const LiveBadge = styled.span`
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 8px;
  border-radius: 999px;
  border: 1px solid ${liquidityStudioColors.green};
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${liquidityStudioColors.green};
  background: rgba(0, 230, 118, 0.08);
`

export const AILiquidityAdvisorPanel: React.FC = () => {
  const { terminal } = useLiquidityRuntime()
  const { advisorItems } = terminal

  return (
    <LsPanel
      data-ls-panel
      $width={liquidityStudioLayout.rightWidth}
      $height={liquidityStudioLayout.aiAdvisorHeight}
      $radius={liquidityStudioLayout.rightPanelRadius}
      $pad={liquidityStudioLayout.rightPanelPadding}
    >
      <Head>
        <LsSectionTitle style={{ margin: 0 }}>AI Liquidity Advisor</LsSectionTitle>
        <LiveBadge>LIVE DATA</LiveBadge>
      </Head>
      {advisorItems.map((item) => (
        <LsRightRow key={item.label}>
          <LsRightLabel>{item.label}</LsRightLabel>
          {item.tone === 'gold' ? <Gold>{item.value}</Gold> : <Green>{item.value}</Green>}
        </LsRightRow>
      ))}
    </LsPanel>
  )
}

export default AILiquidityAdvisorPanel
