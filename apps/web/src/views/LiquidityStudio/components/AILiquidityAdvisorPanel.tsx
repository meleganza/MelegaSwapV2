import React from 'react'
import styled from 'styled-components'
import { liquidityStudioColors, liquidityStudioLayout } from '../liquidityStudioTokens'
import { useLiquidityRuntime } from '../liquidityRuntime/LiquidityRuntimeContext'
import { LsPanel, LsRightLabel, LsRightRow, LsSectionTitle } from './liquidityStudioPrimitives'

const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
  flex-shrink: 0;
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

const Muted = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: ${liquidityStudioColors.muted};
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

const Body = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  min-height: 0;
`

export const AILiquidityAdvisorPanel: React.FC = () => {
  const { terminal } = useLiquidityRuntime()
  const { advisorItems, advisorUnavailableReason } = terminal

  return (
    <LsPanel
      data-ls-panel
      $width={liquidityStudioLayout.rightWidth}
      $height="100%"
      $radius={liquidityStudioLayout.rightPanelRadius}
      $pad={liquidityStudioLayout.rightPanelPadding}
    >
      <Head>
        <LsSectionTitle style={{ margin: 0 }}>AI Liquidity Advisor</LsSectionTitle>
        {!advisorUnavailableReason ? <LiveBadge>LIVE DATA</LiveBadge> : null}
      </Head>
      <Body>
        {advisorItems.map((item) => (
          <LsRightRow key={item.label}>
            <LsRightLabel>{item.label}</LsRightLabel>
            {item.tone === 'gold' ? (
              <Gold>{item.value}</Gold>
            ) : item.tone === 'muted' ? (
              <Muted>{item.value}</Muted>
            ) : (
              <Green>{item.value}</Green>
            )}
          </LsRightRow>
        ))}
        {advisorUnavailableReason ? (
          <Muted style={{ marginTop: 8, fontSize: 12, lineHeight: 1.45 }}>
            {advisorUnavailableReason}
          </Muted>
        ) : null}
      </Body>
    </LsPanel>
  )
}

export default AILiquidityAdvisorPanel
