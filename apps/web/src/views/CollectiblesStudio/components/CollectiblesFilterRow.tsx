import React from 'react'
import styled from 'styled-components'
import { FILTER_CHIPS } from '../collectiblesStudioData'
import { useCollectiblesRuntime } from '../collectiblesRuntime/CollectiblesRuntimeContext'
import { collectiblesStudioLayout } from '../collectiblesStudioTokens'
import { CsChip } from './collectiblesStudioPrimitives'

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: ${collectiblesStudioLayout.filterGap};
  min-height: ${collectiblesStudioLayout.filterHeight};
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 2px;

  &::-webkit-scrollbar {
    display: none;
  }
`

export const CollectiblesFilterRow: React.FC = () => {
  const { filter, setFilter } = useCollectiblesRuntime()

  return (
    <Row data-cs-filter-row>
      {FILTER_CHIPS.map((chip) => (
        <CsChip
          key={chip}
          type="button"
          $active={filter === chip}
          data-cs-filter-chip={chip}
          onClick={() => setFilter(chip)}
        >
          {chip}
        </CsChip>
      ))}
    </Row>
  )
}

export default CollectiblesFilterRow
