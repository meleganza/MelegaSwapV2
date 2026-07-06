import React from 'react'
import styled from 'styled-components'
import { POOL_FILTER_CHIPS } from '../poolsStudioData'
import { poolsStudioColors, poolsStudioLayout } from '../poolsStudioTokens'
import { usePoolsRuntime } from '../poolsRuntime/PoolsRuntimeContext'

const Row = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 10px;
  min-height: ${poolsStudioLayout.filterHeight};
  align-items: center;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }
`

const Chip = styled.button<{ $active?: boolean }>`
  height: 36px;
  padding: 0 16px;
  border-radius: 999px;
  border: 1px solid ${({ $active }) => ($active ? poolsStudioColors.gold : poolsStudioColors.border)};
  background: ${({ $active }) => ($active ? poolsStudioColors.gold : 'transparent')};
  color: ${({ $active }) => ($active ? '#050505' : poolsStudioColors.secondary)};
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: border-color 150ms ease, background 150ms ease;

  &:hover {
    border-color: ${poolsStudioColors.gold};
  }
`

export const PoolsFilterRow: React.FC = () => {
  const { filter, setFilter } = usePoolsRuntime()

  return (
    <Row data-ps-filters>
      {POOL_FILTER_CHIPS.map((chip) => (
        <Chip key={chip} type="button" $active={filter === chip} onClick={() => setFilter(chip)}>
          {chip}
        </Chip>
      ))}
    </Row>
  )
}

export default PoolsFilterRow
