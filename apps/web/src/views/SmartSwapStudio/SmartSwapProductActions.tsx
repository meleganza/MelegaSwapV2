import React from 'react'
import styled from 'styled-components'

export type SmartSwapProductAction = 'swap' | 'bridge'

const Tabs = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 4px;
  width: min(100%, 300px);
  min-height: 52px;
  padding: 4px;
  border-radius: 999px;
  background: #f1f0eb;

  @media (max-width: 430px) {
    width: min(100%, 270px);
  }
`

const Tab = styled.button<{ $active: boolean }>`
  position: relative;
  z-index: 1;
  flex: 1 1 0;
  min-width: 0;
  min-height: 44px;
  padding: 0 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 0;
  border-radius: 999px;
  background: ${({ $active }) => ($active ? '#ffffff' : 'transparent')};
  box-shadow: ${({ $active }) => ($active ? 'inset 0 -2px 0 #f3c928, 0 2px 8px rgba(23, 24, 23, 0.05)' : 'none')};
  color: ${({ $active }) => ($active ? '#171817' : '#72736e')};
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.01em;
  white-space: nowrap;
  cursor: pointer;
  transition: color 140ms ease, background 140ms ease;

  svg {
    width: 22px;
    height: 22px;
    flex: 0 0 22px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.75;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  &:focus-visible {
    outline: 2px solid rgba(243, 201, 40, 0.62);
    outline-offset: 2px;
  }

  .smart-swap-tab-new {
    display: inline-flex;
    align-items: center;
    height: 15px;
    padding: 0 5px;
    border-radius: 999px;
    background: #fff2bd;
    color: #171817;
    font-size: 8px;
    font-weight: 800;
    letter-spacing: 0.03em;
  }
`

const SwapGlyph = () => (
  <svg viewBox="0 0 24 24" aria-hidden>
    <path d="M4 8h15M15 4l4 4-4 4M20 16H5M9 12l-4 4 4 4" />
  </svg>
)

const BridgeGlyph = () => (
  <svg viewBox="0 0 24 24" aria-hidden>
    <path d="M3 17c0-5 4-9 9-9s9 4 9 9M7 17c0-2.8 2.2-5 5-5s5 2.2 5 5" />
  </svg>
)

const ACTIONS: Array<{ id: SmartSwapProductAction; label: string }> = [
  { id: 'swap', label: 'Swap' },
  { id: 'bridge', label: 'Bridge' },
]

export const SmartSwapProductTabs: React.FC<{
  value: SmartSwapProductAction
  onChange: (action: SmartSwapProductAction) => void
  bridgeLabel?: string
  showBridgeNewBadge?: boolean
}> = ({ value, onChange, bridgeLabel = 'Bridge', showBridgeNewBadge = false }) => (
  <Tabs role="tablist" aria-label="Trade actions" data-smart-swap-product-tabs data-folder-tabs>
    {ACTIONS.map((action) => (
      <Tab
        key={action.id}
        type="button"
        role="tab"
        aria-selected={value === action.id}
        aria-label={action.id === 'swap' ? 'Smart Swap' : bridgeLabel}
        $active={value === action.id}
        onClick={() => onChange(action.id)}
      >
        {action.id === 'bridge' ? <BridgeGlyph /> : <SwapGlyph />}
        {action.id === 'bridge' ? bridgeLabel : action.label}
        {action.id === 'bridge' && showBridgeNewBadge ? <span className="smart-swap-tab-new">NEW</span> : null}
      </Tab>
    ))}
  </Tabs>
)
