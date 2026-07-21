import React from 'react'
import styled from 'styled-components'
import {
  MelegaStudioGhostBtn,
  MelegaStudioLiveBadge,
  MelegaStudioLiveDot,
  MelegaStudioPageHeader,
  STUDIO_PAGE_TITLES,
  STUDIO_LIVE_RUNTIME_LABEL,
} from 'design-system/melega'
import { liquidityStudioColors } from '../liquidityStudioTokens'
import { useLiquidityRuntime } from '../liquidityRuntime/LiquidityRuntimeContext'

const TabRow = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  border-bottom: 1px solid ${liquidityStudioColors.rowBorder};
  min-width: 0;
  overflow-x: auto;
`

const Tab = styled.button<{ $active?: boolean }>`
  position: relative;
  padding: 0 0 12px;
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: ${({ $active }) => ($active ? 700 : 500)};
  color: ${({ $active }) => ($active ? liquidityStudioColors.text : liquidityStudioColors.muted)};
  cursor: pointer;
  white-space: nowrap;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 2px;
    border-radius: 1px;
    background: ${({ $active }) => ($active ? liquidityStudioColors.gold : 'transparent')};
  }
`

const TABS: { mode: 'My Positions' | 'Add Liquidity' | 'Remove Liquidity' | 'Simulation'; label: string }[] = [
  { mode: 'My Positions', label: 'My Positions' },
  { mode: 'Add Liquidity', label: 'Explore Liquidity' },
  { mode: 'Remove Liquidity', label: 'Remove Liquidity' },
  { mode: 'Simulation', label: 'Simulation' },
]

export const LiquidityStudioPageHeader: React.FC = () => {
  const { mode, setMode } = useLiquidityRuntime()

  return (
    <MelegaStudioPageHeader
      data-studio-header="liquidity"
      data-ls-wallet-first-header="true"
      title={STUDIO_PAGE_TITLES.liquidity}
      subtitle="Your liquidity positions first — then explore and create new positions."
      badge={
        <MelegaStudioLiveBadge>
          <MelegaStudioLiveDot aria-hidden />
          {STUDIO_LIVE_RUNTIME_LABEL}
        </MelegaStudioLiveBadge>
      }
      actions={
        <MelegaStudioGhostBtn as="a" href="/@melega-dex/" style={{ textDecoration: 'none' }}>
          Open Project Page
        </MelegaStudioGhostBtn>
      }
      footer={
        <TabRow data-testid="ls-mode-tabs">
          {TABS.map((tab) => (
            <Tab
              key={tab.mode}
              type="button"
              $active={mode === tab.mode}
              data-testid={`ls-tab-${tab.mode === 'Add Liquidity' ? 'explore' : tab.mode.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => setMode(tab.mode)}
            >
              {tab.label}
            </Tab>
          ))}
        </TabRow>
      }
    />
  )
}

export default LiquidityStudioPageHeader
