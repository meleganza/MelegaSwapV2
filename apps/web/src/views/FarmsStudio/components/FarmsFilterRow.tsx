import React from 'react'
import styled from 'styled-components'
import { FARM_FILTER_CHIPS } from '../farmsStudioData'
import { farmsStudioColors, farmsStudioLayout } from '../farmsStudioTokens'
import { useFarmsRuntime } from '../farmsRuntime/FarmsRuntimeContext'

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: ${farmsStudioLayout.filterHeight};
  margin-top: ${farmsStudioLayout.filterMarginTop};
  overflow-x: auto;
  min-width: 0;
  padding-bottom: 2px;
`

const Chip = styled.button<{ $active?: boolean }>`
  height: 32px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid
    ${({ $active }) => ($active ? farmsStudioColors.goldBorder : farmsStudioColors.border)};
  background: ${({ $active }) => ($active ? farmsStudioColors.goldBg : 'transparent')};
  color: ${({ $active }) => ($active ? farmsStudioColors.goldBright : farmsStudioColors.text)};
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
  transition: border-color 140ms ease, background 140ms ease;
`

export const FarmsFilterRow: React.FC = () => {
  const { filter, setFilter } = useFarmsRuntime()

  return (
    <Row data-fs-filters>
      {FARM_FILTER_CHIPS.map((chip) => (
        <Chip key={chip} type="button" $active={filter === chip} onClick={() => setFilter(chip)}>
          {chip}
        </Chip>
      ))}
    </Row>
  )
}

export default FarmsFilterRow
