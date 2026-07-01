import React, { useState } from 'react'
import styled from 'styled-components'
import { liquidityStudioColors, LIQUIDITY_STUDIO_PREVIEW_LABEL } from '../liquidityStudioTokens'
import { LsPreviewBadge } from './liquidityStudioPrimitives'

const Row = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
  min-width: 0;
`

const Left = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const Title = styled.h1`
  margin: 0;
  font-size: 44px;
  font-weight: 800;
  line-height: 1;
  color: ${liquidityStudioColors.text};
`

const Subtitle = styled.p`
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.3;
  color: ${liquidityStudioColors.subtitle};
  max-width: 720px;
`

const TabRow = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 16px;
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
  const [active, setActive] = useState<(typeof TABS)[number]>('Add Liquidity')

  return (
    <div data-ls-page-header>
      <Row>
        <Left>
          <Title>Liquidity Studio</Title>
          <Subtitle>Build markets, manage liquidity and optimise LP performance.</Subtitle>
        </Left>
        <LsPreviewBadge>{LIQUIDITY_STUDIO_PREVIEW_LABEL}</LsPreviewBadge>
      </Row>
      <TabRow>
        {TABS.map((tab) => (
          <Tab key={tab} type="button" $active={active === tab} onClick={() => setActive(tab)}>
            {tab}
          </Tab>
        ))}
      </TabRow>
    </div>
  )
}

export default LiquidityStudioPageHeader
