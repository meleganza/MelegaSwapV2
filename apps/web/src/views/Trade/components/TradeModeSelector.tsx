import React from 'react'
import styled from 'styled-components'
import { colors } from 'design-system/melega'
import type { SwapExperienceMode } from '../swapExperience'
import { SWAP_EXPERIENCE_LABEL } from '../swapExperience'

const Shell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  flex-shrink: 0;
  position: relative;
  z-index: 2;
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
  min-height: 44px;
  height: 44px;
  border: 1px solid
    ${({ $active, $smart }) =>
      $active && $smart
        ? 'rgba(244, 196, 48, 0.55)'
        : $active
          ? 'rgba(255, 255, 255, 0.12)'
          : 'transparent'};
  border-radius: 10px;
  background: ${({ $active, $smart }) =>
    $active && $smart ? 'rgba(244, 196, 48, 0.1)' : $active ? '#1a1a1a' : 'transparent'};
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
  box-shadow: ${({ $active, $smart }) =>
    $active && $smart ? '0 0 20px rgba(244, 196, 48, 0.08)' : 'none'};

  &:hover {
    color: ${colors.textPrimary};
  }

  &:focus-visible {
    outline: 2px solid ${colors.gold};
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`

const Description = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 1.45;
  color: #9e9e9e;
`

export interface TradeModeSelectorProps {
  mode: SwapExperienceMode
  onChange: (mode: SwapExperienceMode) => void
}

/**
 * Instant | Smart selector — both experiences use SmartSwapForm (same engine).
 */
export const TradeModeSelector: React.FC<TradeModeSelectorProps> = ({ mode, onChange }) => (
  <Shell data-trade-mode-selector data-swap-experience={mode}>
    <Segmented role="tablist" aria-label="Swap mode">
      <Tab
        type="button"
        role="tab"
        id="swap-mode-instant"
        aria-selected={mode === 'instant'}
        aria-controls="smart-swap-execution"
        aria-label={SWAP_EXPERIENCE_LABEL.instant}
        $active={mode === 'instant'}
        onClick={() => onChange('instant')}
      >
        Instant
      </Tab>
      <Tab
        type="button"
        role="tab"
        id="swap-mode-smart"
        aria-selected={mode === 'smart'}
        aria-controls="smart-swap-execution"
        aria-label={SWAP_EXPERIENCE_LABEL.smart}
        $active={mode === 'smart'}
        $smart
        onClick={() => onChange('smart')}
      >
        Smart
      </Tab>
    </Segmented>
    <Description>
      {mode === 'smart'
        ? 'Optimized route with execution preview, fee transparency, and readiness checks before wallet confirmation.'
        : 'Fast direct swap on the same Melega DEX engine — without the Smart transparency stack.'}
    </Description>
  </Shell>
)

export default TradeModeSelector
