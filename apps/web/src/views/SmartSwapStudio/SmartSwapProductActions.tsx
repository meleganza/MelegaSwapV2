import React from 'react'
import styled from 'styled-components'

export type SmartSwapProductAction = 'swap' | 'bridge'

const Tabs = styled.div`
  position: relative;
  display: flex;
  align-items: flex-end;
  gap: 5px;
  width: min(100%, 310px);
  min-height: 43px;
  padding: 0 5px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  @media (max-width: 430px) {
    width: 100%;
  }
`

const Tab = styled.button<{ $active: boolean }>`
  position: relative;
  z-index: 1;
  min-width: 118px;
  min-height: 42px;
  padding: 0 17px;
  margin-bottom: -1px;
  border: 1px solid ${({ $active }) => ($active ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.06)')};
  border-bottom-color: ${({ $active }) => ($active ? '#141414' : 'rgba(255, 255, 255, 0.1)')};
  border-radius: 13px 13px 0 0;
  background: ${({ $active }) =>
    $active
      ? 'linear-gradient(180deg, rgba(30, 30, 29, 0.99), #141414)'
      : 'linear-gradient(180deg, rgba(14, 15, 15, 0.9), rgba(8, 9, 9, 0.82))'};
  color: ${({ $active }) => ($active ? '#ffffff' : 'rgba(255, 255, 255, 0.48)')};
  font-size: 12px;
  font-weight: 800;
  letter-spacing: -0.01em;
  white-space: nowrap;
  cursor: pointer;
  transition: color 140ms ease, border-color 140ms ease, background 140ms ease, transform 140ms ease;

  &:first-child {
    color: ${({ $active }) => ($active ? '#f4c430' : 'rgba(244, 196, 48, 0.56)')};
  }

  &:hover {
    color: ${({ $active }) => ($active ? '#ffffff' : 'rgba(255, 255, 255, 0.78)')};
    border-color: rgba(244, 196, 48, 0.2);
  }

  &:active {
    transform: translateY(1px);
  }

  &:focus-visible {
    outline: 2px solid rgba(244, 196, 48, 0.62);
    outline-offset: 2px;
  }

  @media (max-width: 430px) {
    flex: 1;
    min-width: 0;
  }
`

const ACTIONS: Array<{ id: SmartSwapProductAction; label: string }> = [
  { id: 'swap', label: '⚡ Smart Swap' },
  { id: 'bridge', label: 'Bridge' },
]

export const SmartSwapProductTabs: React.FC<{
  value: SmartSwapProductAction
  onChange: (action: SmartSwapProductAction) => void
}> = ({ value, onChange }) => (
  <Tabs role="tablist" aria-label="Trade actions" data-smart-swap-product-tabs data-folder-tabs>
    {ACTIONS.map((action) => (
      <Tab
        key={action.id}
        type="button"
        role="tab"
        aria-selected={value === action.id}
        $active={value === action.id}
        onClick={() => onChange(action.id)}
      >
        {action.label}
      </Tab>
    ))}
  </Tabs>
)
