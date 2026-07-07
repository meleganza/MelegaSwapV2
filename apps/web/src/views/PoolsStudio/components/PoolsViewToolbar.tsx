import React from 'react'
import styled from 'styled-components'
import { poolsStudioColors, poolsStudioLayout } from '../poolsStudioTokens'
import { usePoolsRuntime } from '../poolsRuntime/PoolsRuntimeContext'
import PoolsFilterRow from './PoolsFilterRow'
import PoolsTabsRow from './PoolsTabsRow'
import type { PoolsSortMode } from '../poolsStudioData'

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow: visible;
  container-type: inline-size;
  container-name: pools-toolbar;
`

const RowOne = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  align-items: stretch;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow: visible;
  min-height: ${poolsStudioLayout.toolbarHeight};
  row-gap: 12px;

  @container pools-toolbar (min-width: 680px) {
    grid-template-columns: auto auto;
    justify-content: space-between;
    align-items: center;
    height: ${poolsStudioLayout.toolbarHeight};
    min-height: ${poolsStudioLayout.toolbarHeight};
    row-gap: 0;
  }
`

const TabsGroup = styled.div`
  display: flex;
  width: 100%;
  flex: 0 0 auto;
  flex-shrink: 0;
  overflow: visible;

  @container pools-toolbar (min-width: 680px) {
    width: auto;
  }
`

const ControlsGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  flex: 0 0 auto;
  flex-shrink: 0;
  overflow: visible;
  flex-wrap: wrap;

  @container pools-toolbar (min-width: 680px) {
    width: auto;
    flex-wrap: nowrap;
  }
`

const Switch = styled.div`
  display: inline-flex;
  align-items: center;
  width: ${poolsStudioLayout.viewSwitchWidth};
  height: ${poolsStudioLayout.viewSwitchHeight};
  border-radius: 10px;
  border: 1px solid ${poolsStudioColors.chipBorder};
  overflow: hidden;
  flex-shrink: 0;
`

const SwitchBtn = styled.button<{ $active?: boolean }>`
  width: 48px;
  min-width: 48px;
  height: 100%;
  border: none;
  background: ${({ $active }) => ($active ? poolsStudioColors.explorerGold : 'transparent')};
  color: ${({ $active }) => ($active ? '#050505' : poolsStudioColors.tabInactive)};
  font-family: Inter, sans-serif;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  flex-shrink: 0;
`

const SortSelect = styled.select`
  width: ${poolsStudioLayout.sortSelectWidth};
  height: ${poolsStudioLayout.viewSwitchHeight};
  border-radius: 10px;
  border: 1px solid ${poolsStudioColors.chipBorder};
  background: ${poolsStudioColors.cardElevated};
  color: ${poolsStudioColors.text};
  font-family: Inter, sans-serif;
  font-size: 13px;
  font-weight: 600;
  padding: 0 12px;
  cursor: pointer;
  flex-shrink: 0;
`

const FilterBtn = styled.button`
  width: ${poolsStudioLayout.filterBtnWidth};
  height: ${poolsStudioLayout.viewSwitchHeight};
  border-radius: 10px;
  border: 1px solid ${poolsStudioColors.explorerGold};
  background: transparent;
  color: ${poolsStudioColors.explorerGold};
  font-family: Inter, sans-serif;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  flex-shrink: 0;
`

const ChipsWrap = styled.div`
  margin-top: ${poolsStudioLayout.toolbarChipsGap};
  width: 100%;
  overflow: visible;
`

const SORT_OPTIONS: { value: PoolsSortMode; label: string }[] = [
  { value: 'apr', label: 'Sort: Health Score' },
  { value: 'tvl', label: 'Sort: Highest TVL' },
  { value: 'budget', label: 'Sort: Reward Budget' },
  { value: 'newest', label: 'Sort: Newest' },
]

const Controls: React.FC = () => {
  const { viewMode, setViewMode, sortMode, setSortMode } = usePoolsRuntime()

  return (
    <>
      <Switch data-ps-view-switch>
        <SwitchBtn type="button" $active={viewMode === 'grid'} onClick={() => setViewMode('grid')}>
          Grid
        </SwitchBtn>
        <SwitchBtn type="button" $active={viewMode === 'list'} onClick={() => setViewMode('list')}>
          List
        </SwitchBtn>
      </Switch>
      <SortSelect value={sortMode} onChange={(e) => setSortMode(e.target.value as PoolsSortMode)} aria-label="Sort pools">
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </SortSelect>
      <FilterBtn type="button">Filter</FilterBtn>
    </>
  )
}

export const PoolsViewToolbar: React.FC = () => (
  <Wrap data-ps-view-toolbar data-r708-toolbar data-r708b-toolbar>
    <RowOne data-ps-toolbar-row-one>
      <TabsGroup data-ps-toolbar-tabs-group>
        <PoolsTabsRow />
      </TabsGroup>
      <ControlsGroup data-ps-toolbar-controls-group>
        <Controls />
      </ControlsGroup>
    </RowOne>
    <ChipsWrap data-ps-toolbar-chips-wrap>
      <PoolsFilterRow />
    </ChipsWrap>
  </Wrap>
)

export default PoolsViewToolbar
