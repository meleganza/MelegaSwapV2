import React from 'react'
import styled from 'styled-components'
import { liquidityStudioColors, liquidityStudioLayout } from '../liquidityStudioTokens'

const Panel = styled.div`
  width: 100%;
  max-width: ${liquidityStudioLayout.leftWidth};
  background: ${liquidityStudioColors.panelGradient};
  border: 1px solid ${liquidityStudioColors.border};
  border-radius: ${liquidityStudioLayout.panelRadius};
  padding: ${liquidityStudioLayout.panelPadding};
  box-sizing: border-box;
`

const Title = styled.h2`
  margin: 0 0 14px;
  font-size: 24px;
  font-weight: 800;
  line-height: 1.1;
  color: ${liquidityStudioColors.text};
`

const PairSelect = styled.div`
  height: ${liquidityStudioLayout.builderPairHeight};
  min-height: ${liquidityStudioLayout.builderPairHeight};
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: #171717;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 700;
  color: ${liquidityStudioColors.text};
  margin-bottom: 12px;
`

const TokenRow = styled.div`
  height: ${liquidityStudioLayout.tokenRowHeight};
  min-height: ${liquidityStudioLayout.tokenRowHeight};
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: #171717;
  padding: 12px 14px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-bottom: 10px;
`

const TokenLabel = styled.span`
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${liquidityStudioColors.muted};
`

const TokenValue = styled.span`
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
  color: ${liquidityStudioColors.text};
`

const RatioRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 600;
  color: ${liquidityStudioColors.muted};
  margin: 4px 0 6px;
`

const RatioBar = styled.div`
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
  margin-bottom: 14px;
`

const RatioFill = styled.div`
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, ${liquidityStudioColors.goldBright}, ${liquidityStudioColors.gold});
`

const ConnectBtn = styled.button`
  width: 100%;
  height: ${liquidityStudioLayout.connectButtonHeight};
  border: none;
  border-radius: 12px;
  background: linear-gradient(180deg, #f4c542 0%, #d4af37 100%);
  color: #050505;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
`

export const LiquidityBuilderPanel: React.FC = () => (
  <Panel data-ls-panel data-ls-builder>
    <Title>Liquidity Builder</Title>
    <PairSelect>BNB / MARCO</PairSelect>
    <TokenRow>
      <TokenLabel>Token A</TokenLabel>
      <TokenValue>0.0</TokenValue>
    </TokenRow>
    <TokenRow>
      <TokenLabel>Token B</TokenLabel>
      <TokenValue>0.0</TokenValue>
    </TokenRow>
    <RatioRow>
      <span>Ratio</span>
      <span>50 / 50</span>
    </RatioRow>
    <RatioBar aria-hidden>
      <RatioFill />
    </RatioBar>
    <ConnectBtn type="button" data-ls-primary-btn>
      Connect Wallet
    </ConnectBtn>
  </Panel>
)

export default LiquidityBuilderPanel
