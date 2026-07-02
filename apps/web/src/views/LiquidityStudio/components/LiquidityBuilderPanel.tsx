import React from 'react'
import styled, { keyframes } from 'styled-components'
import { liquidityStudioColors, liquidityStudioLayout } from '../liquidityStudioTokens'
import { LsPanel, LsPanelTitle, LsPrimaryBtn } from './liquidityStudioPrimitives'

const shimmer = keyframes`
  0%, 100% { opacity: 0.55; }
  50% { opacity: 1; }
`

const PairSelect = styled.button`
  width: 100%;
  height: ${liquidityStudioLayout.builderPairHeight};
  min-height: ${liquidityStudioLayout.builderPairHeight};
  border-radius: 12px;
  border: 1px solid ${liquidityStudioColors.border};
  background: ${liquidityStudioColors.surfaceSecondary};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  margin-bottom: 12px;
  cursor: pointer;
  box-sizing: border-box;
`

const PairText = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: ${liquidityStudioColors.text};
`

const Chevron = styled.span`
  display: inline-flex;
  color: ${liquidityStudioColors.muted};
  font-size: 16px;
  line-height: 1;
`

const TokenRow = styled.div`
  position: relative;
  height: ${liquidityStudioLayout.tokenRowHeight};
  min-height: ${liquidityStudioLayout.tokenRowHeight};
  border-radius: 12px;
  border: 1px solid ${liquidityStudioColors.border};
  background: ${liquidityStudioColors.surfaceSecondary};
  padding: 12px 14px;
  box-sizing: border-box;
  margin-bottom: 12px;
`

const TokenLabel = styled.span`
  display: block;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${liquidityStudioColors.muted};
  line-height: 1;
  margin-bottom: 8px;
`

const TokenValue = styled.span`
  display: block;
  font-size: 34px;
  font-weight: 700;
  line-height: 1;
  color: ${liquidityStudioColors.text};
`

const TokenSelect = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  height: 40px;
  min-width: 88px;
  padding: 0 12px;
  border-radius: 12px;
  border: 1px solid ${liquidityStudioColors.border};
  background: #0f0f0f;
  color: ${liquidityStudioColors.text};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
`

const SwapMid = styled.div`
  display: flex;
  justify-content: center;
  margin: 4px auto 12px;
  position: relative;
  z-index: 2;
`

const SwapBtn = styled.button`
  width: ${liquidityStudioLayout.swapIconSize};
  height: ${liquidityStudioLayout.swapIconSize};
  border-radius: 50%;
  border: 1px solid rgba(212, 175, 55, 0.35);
  background: #121212;
  color: ${liquidityStudioColors.goldBright};
  font-size: 14px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`

const RatioHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 26px;
  min-height: 26px;
  margin-bottom: 6px;
  font-size: 11px;
  font-weight: 600;
  color: ${liquidityStudioColors.muted};
`

const RatioBar = styled.div`
  height: 4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
  margin-bottom: 8px;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    width: 50%;
    background: linear-gradient(90deg, ${liquidityStudioColors.goldBright}, ${liquidityStudioColors.gold});
    border-radius: 999px;
    animation: ${shimmer} 6s ease-in-out infinite;
  }
`

const SlippageRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 26px;
  min-height: 26px;
  margin-bottom: 0;
  font-size: 13px;
  font-weight: 600;
`

const SlippageLabel = styled.span`
  color: ${liquidityStudioColors.muted};
`

const SlippageValue = styled.span`
  color: ${liquidityStudioColors.goldBright};
  font-weight: 700;
`

export const LiquidityBuilderPanel: React.FC = () => (
  <LsPanel
    data-ls-panel
    data-ls-builder
    $width={liquidityStudioLayout.leftWidth}
    $height={liquidityStudioLayout.builderHeight}
  >
    <LsPanelTitle>Liquidity Builder</LsPanelTitle>
    <PairSelect type="button">
      <PairText>BNB / MARCO</PairText>
      <Chevron aria-hidden>▾</Chevron>
    </PairSelect>
    <TokenRow>
      <TokenLabel>Token A</TokenLabel>
      <TokenValue>0.0</TokenValue>
      <TokenSelect type="button">BNB</TokenSelect>
    </TokenRow>
    <SwapMid>
      <SwapBtn type="button" aria-label="Swap tokens">
        ⇅
      </SwapBtn>
    </SwapMid>
    <TokenRow>
      <TokenLabel>Token B</TokenLabel>
      <TokenValue>0.0</TokenValue>
      <TokenSelect type="button">MARCO</TokenSelect>
    </TokenRow>
    <RatioHead>
      <span>Ratio</span>
      <span>50 / 50</span>
    </RatioHead>
    <RatioBar aria-hidden />
    <SlippageRow>
      <SlippageLabel>Slippage Tolerance</SlippageLabel>
      <SlippageValue>0.5%</SlippageValue>
    </SlippageRow>
    <LsPrimaryBtn type="button" data-ls-primary-btn>
      Connect Wallet
    </LsPrimaryBtn>
  </LsPanel>
)

export default LiquidityBuilderPanel
