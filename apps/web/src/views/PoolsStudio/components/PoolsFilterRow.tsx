import React from 'react'
import styled from 'styled-components'
import { POOL_FILTER_CHIPS } from '../poolsStudioData'
import { poolsStudioColors, poolsStudioLayout } from '../poolsStudioTokens'
import { usePoolsRuntime } from '../poolsRuntime/PoolsRuntimeContext'

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${poolsStudioLayout.filterGap};
  align-items: center;
  width: 100%;
  overflow: visible;
`

const Chip = styled.button<{ $active?: boolean }>`
  height: ${poolsStudioLayout.filterPillHeight};
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid ${poolsStudioColors.chipBorder};
  background: ${({ $active }) => ($active ? poolsStudioColors.explorerGold : poolsStudioColors.card)};
  color: ${({ $active }) => ($active ? '#050505' : poolsStudioColors.tabInactive)};
  font-family: Inter, sans-serif;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
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
