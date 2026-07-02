import React, { useState } from 'react'
import styled from 'styled-components'
import { POOL_FILTER_CHIPS } from '../poolsStudioData'
import { poolsStudioColors, poolsStudioLayout } from '../poolsStudioTokens'

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  min-height: ${poolsStudioLayout.filterHeight};
  align-items: center;
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
  transition: border-color 150ms ease, opacity 150ms ease, background 150ms ease;

  &:hover {
    border-color: ${poolsStudioColors.gold};
    opacity: 0.92;
  }
`

export const PoolsFilterRow: React.FC = () => {
  const [active, setActive] = useState<string>('All')

  return (
    <Row data-ps-filters>
      {POOL_FILTER_CHIPS.map((chip) => (
        <Chip key={chip} type="button" $active={active === chip} onClick={() => setActive(chip)}>
          {chip}
        </Chip>
      ))}
    </Row>
  )
}

export default PoolsFilterRow
