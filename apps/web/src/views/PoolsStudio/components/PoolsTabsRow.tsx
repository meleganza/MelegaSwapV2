import React from 'react'
import styled from 'styled-components'
import type { PoolTab } from '../poolsStudioData'
import { poolsStudioColors, poolsStudioLayout } from '../poolsStudioTokens'
import { usePoolsRuntime } from '../poolsRuntime/PoolsRuntimeContext'

const Row = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 28px;
  width: auto;
  flex: 0 0 auto;
  flex-shrink: 0;
  height: ${poolsStudioLayout.tabHeight};
  min-height: ${poolsStudioLayout.tabHeight};
  position: relative;
  z-index: 1;
`

const Tab = styled.button`
  border: none;
  background: transparent;
  padding: 0;
  margin: 0;
  cursor: pointer;
  display: inline-flex;
  align-items: flex-end;
  height: 100%;
  position: relative;
  flex-shrink: 0;
`

const TabLabel = styled.span<{ $active?: boolean }>`
  display: inline-block;
  font-family: Inter, sans-serif;
  font-size: 13px;
  font-weight: ${({ $active }) => ($active ? 700 : 600)};
  line-height: 1;
  color: ${({ $active }) => ($active ? poolsStudioColors.text : poolsStudioColors.tabInactive)};
  white-space: nowrap;
  padding-bottom: 8px;
  border-bottom: 2px solid ${({ $active }) => ($active ? poolsStudioColors.explorerGold : 'transparent')};
`

export const PoolsTabsRow: React.FC = () => {
  const { poolTab, setPoolTab, positionsCount } = usePoolsRuntime()
  const tabs: { id: PoolTab; label: string }[] = [
    { id: 'positions', label: `My Positions (${positionsCount})` },
    { id: 'all', label: 'Explore Pools' },
    { id: 'finished', label: 'Finished' },
  ]

  return (
    <Row data-ps-pool-tabs>
      {tabs.map((tab) => (
        <Tab key={tab.id} type="button" onClick={() => setPoolTab(tab.id)}>
          <TabLabel $active={poolTab === tab.id}>{tab.label}</TabLabel>
        </Tab>
      ))}
    </Row>
  )
}

export default PoolsTabsRow
