import styled from 'styled-components'

export type TradeWorkspaceTab = 'swap' | 'bridge'

interface SmartSwapBridgeTabsProps {
  active: TradeWorkspaceTab
  onChange: (tab: TradeWorkspaceTab) => void
}

const Tabs = styled.div`
  display: inline-grid;
  grid-template-columns: repeat(2, minmax(84px, 1fr));
  align-items: end;
  gap: 3px;
  padding: 4px 4px 0;
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-bottom-color: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: 14px 14px 0 0;
  background: ${({ theme }) => theme.colors.backgroundAlt};
`

const Tab = styled.button<{ $active: boolean }>`
  position: relative;
  min-height: 38px;
  padding: 0 16px;
  border: 0;
  border-radius: 10px 10px 0 0;
  color: ${({ $active, theme }) => ($active ? theme.colors.primary : theme.colors.textSubtle)};
  background: ${({ $active, theme }) => ($active ? theme.colors.background : 'transparent')};
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: color 120ms ease, background 120ms ease, transform 120ms ease;

  &::after {
    content: '';
    position: absolute;
    right: 0;
    bottom: -1px;
    left: 0;
    height: 2px;
    background: ${({ $active, theme }) => ($active ? theme.colors.primary : 'transparent')};
  }

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: -2px;
  }

  @media (max-width: 575px) {
    min-height: 36px;
    padding: 0 12px;
    font-size: 12px;
  }
`

export default function SmartSwapBridgeTabs({ active, onChange }: SmartSwapBridgeTabsProps) {
  return (
    <Tabs role="tablist" aria-label="Trade actions">
      <Tab
        type="button"
        role="tab"
        aria-selected={active === 'swap'}
        $active={active === 'swap'}
        onClick={() => onChange('swap')}
      >
        ⚡ Smart Swap
      </Tab>
      <Tab
        type="button"
        role="tab"
        aria-selected={active === 'bridge'}
        $active={active === 'bridge'}
        onClick={() => onChange('bridge')}
      >
        MARCO Bridge
      </Tab>
    </Tabs>
  )
}
