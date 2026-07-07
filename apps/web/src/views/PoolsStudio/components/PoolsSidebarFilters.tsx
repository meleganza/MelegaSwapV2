import React from 'react'
import styled from 'styled-components'
import { POOL_FILTER_CHIPS } from '../poolsStudioData'
import { poolsStudioColors, poolsStudioLayout } from '../poolsStudioTokens'
import { usePoolsRuntime } from '../poolsRuntime/PoolsRuntimeContext'

const Title = styled.h3`
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${poolsStudioColors.text};
`

const Wrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

const Chip = styled.button<{ $active?: boolean }>`
  height: ${poolsStudioLayout.filterPillHeight};
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid ${({ $active }) => ($active ? poolsStudioColors.gold : poolsStudioColors.border)};
  background: ${({ $active }) => ($active ? poolsStudioColors.gold : 'transparent')};
  color: ${({ $active }) => ($active ? '#050505' : poolsStudioColors.secondary)};
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: border-color ${poolsStudioLayout.hoverTransition} ease, background ${poolsStudioLayout.hoverTransition} ease,
    transform 150ms ease;

  &:hover {
    border-color: ${poolsStudioColors.gold};
    transform: scale(1.02);
  }
`

export const PoolsSidebarFilters: React.FC = () => {
  const { filter, setFilter } = usePoolsRuntime()

  return (
    <div data-ps-sidebar-filter-list>
      <Title>Filters</Title>
      <Wrap>
        {POOL_FILTER_CHIPS.map((chip) => (
          <Chip key={chip} type="button" $active={filter === chip} onClick={() => setFilter(chip)}>
            {chip}
          </Chip>
        ))}
      </Wrap>
    </div>
  )
}

export default PoolsSidebarFilters
