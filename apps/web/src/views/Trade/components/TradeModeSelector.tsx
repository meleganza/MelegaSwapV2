import React from 'react'
import styled from 'styled-components'
import { colors } from 'design-system/melega'
import type { TradeMode } from '../tradeTokens'

const Shell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const Segmented = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 4px;
  background: #111111;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
`

const Tab = styled.button<{ $active?: boolean; $smart?: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 44px;
  border: 1px solid ${({ $active, $smart }) =>
    $active && $smart ? 'rgba(212, 175, 55, 0.55)' : $active ? 'rgba(255, 255, 255, 0.12)' : 'transparent'};
  border-radius: 10px;
  background: ${({ $active, $smart }) =>
    $active && $smart ? 'rgba(212, 175, 55, 0.1)' : $active ? '#1a1a1a' : 'transparent'};
  color: ${({ $active }) => ($active ? colors.textPrimary : '#8a8a8a')};
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition:
    border-color 150ms ease,
    background 150ms ease,
    color 150ms ease,
    box-shadow 150ms ease;
  box-shadow: ${({ $active, $smart }) => ($active && $smart ? '0 0 20px rgba(212, 175, 55, 0.08)' : 'none')};

  &:hover {
    color: ${colors.textPrimary};
  }
`

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 18px;
  padding: 0 6px;
  border-radius: 6px;
  background: rgba(212, 175, 55, 0.18);
  color: ${colors.gold};
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.06em;
`

const AiDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${colors.gold};
  box-shadow: 0 0 8px rgba(244, 197, 66, 0.6);
`

const Description = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.45;
  color: #9e9e9e;
`

export interface TradeModeSelectorProps {
  mode: TradeMode
  onChange: (mode: TradeMode) => void
}

export const TradeModeSelector: React.FC<TradeModeSelectorProps> = ({ mode, onChange }) => (
  <Shell data-trade-mode-selector>
    <Segmented role="tablist" aria-label="Swap mode">
      <Tab
        type="button"
        role="tab"
        aria-selected={mode === 'standard'}
        $active={mode === 'standard'}
        onClick={() => onChange('standard')}
      >
        STANDARD
      </Tab>
      <Tab
        type="button"
        role="tab"
        aria-selected={mode === 'smartswap'}
        $active={mode === 'smartswap'}
        $smart
        onClick={() => onChange('smartswap')}
      >
        <AiDot aria-hidden />
        SMARTSWAP
        <Badge>NEW</Badge>
      </Tab>
    </Segmented>
    <Description>
      {mode === 'smartswap'
        ? 'Finds the best available route across Melega DEX and supported liquidity sources.'
        : 'Best route across supported liquidity on the Melega router.'}
    </Description>
  </Shell>
)

export default TradeModeSelector
