import React from 'react'
import styled from 'styled-components'
import { tradeColors } from '../tradeTokens'
import { BsOutlineBtn } from 'views/BuildStudio/components/buildStudioPrimitives'

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  z-index: 1200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
`

const Panel = styled.div`
  width: min(480px, 100%);
  max-height: min(80vh, 560px);
  overflow-y: auto;
  border-radius: 18px;
  border: 1px solid ${tradeColors.border};
  background: #121212;
  padding: 22px;
  box-sizing: border-box;
`

const Title = styled.h2`
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 800;
  color: #ffffff;
`

const Sub = styled.p`
  margin: 0 0 14px;
  font-size: 14px;
  line-height: 1.55;
  color: ${tradeColors.muted};
`

const List = styled.ol`
  margin: 0 0 16px;
  padding-left: 18px;
  font-size: 14px;
  line-height: 1.6;
  color: #c8c8c8;

  li {
    margin-bottom: 8px;
  }
`

const Note = styled.p`
  margin: 0 0 16px;
  font-size: 12px;
  color: ${tradeColors.muted};
  line-height: 1.5;
`

const CloseBtn = styled.button`
  width: 100%;
  height: 42px;
  border-radius: 12px;
  border: 1px solid ${tradeColors.border};
  background: rgba(255, 255, 255, 0.04);
  color: ${tradeColors.goldBright};
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
`

interface Props {
  open: boolean
  onClose: () => void
}

export const TradeHowItWorksPanel: React.FC<Props> = ({ open, onClose }) => {
  if (!open) return null

  return (
    <Overlay data-trade-how-it-works-overlay onClick={onClose} role="presentation">
      <Panel data-trade-how-it-works-panel onClick={(e) => e.stopPropagation()} role="dialog">
        <Title>How Trade works</Title>
        <Sub>
          Melega Trade routes swaps through live SmartSwap and MelegaSwap V2 quotes. Settlement references are handed
          off to Treasury Runtime after confirmation — the DEX never computes settlement truth.
        </Sub>
        <List>
          <li>Connect wallet and select input/output tokens on SmartSwap.</li>
          <li>Approve the input token when prompted.</li>
          <li>Review route, price impact, and minimum received.</li>
          <li>Confirm swap — receipt appears in History tab.</li>
          <li>Check Settlement Status in the right rail for treasury handoff state.</li>
          <li>Use the Router tab to compare SmartSwap vs V2 route availability.</li>
        </List>
        <Note>Limit orders are not live yet. The Limit Orders tab explains what is coming.</Note>
        <CloseBtn type="button" onClick={onClose}>
          Close
        </CloseBtn>
      </Panel>
    </Overlay>
  )
}

export default TradeHowItWorksPanel
