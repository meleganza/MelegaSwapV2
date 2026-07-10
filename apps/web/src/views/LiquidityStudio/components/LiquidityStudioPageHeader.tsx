import React from 'react'
import styled from 'styled-components'
import {
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

const TABS = ['Add Liquidity', 'Remove Liquidity', 'My Positions', 'Simulation'] as const

export const LiquidityStudioPageHeader: React.FC = () => {
  const { mode, setMode } = useLiquidityRuntime()

  return (
    <MelegaStudioPageHeader
      data-studio-header="liquidity"
      title={STUDIO_PAGE_TITLES.liquidity}
      subtitle="Build markets, manage liquidity and optimise LP performance."
      badge={
        <MelegaStudioLiveBadge>
          <MelegaStudioLiveDot aria-hidden />
          {STUDIO_LIVE_RUNTIME_LABEL}
        </MelegaStudioLiveBadge>
      }
      footer={
        <TabRow>
          {TABS.map((tab) => (
            <Tab key={tab} type="button" $active={mode === tab} onClick={() => setMode(tab)}>
              {tab}
            </Tab>
          ))}
        </TabRow>
      }
    />
  )
}

export default LiquidityStudioPageHeader
