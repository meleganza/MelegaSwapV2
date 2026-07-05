import React from 'react'
import styled from 'styled-components'
import { FILTER_CATEGORIES, FILTER_CHAINS, FILTER_SORT } from '../radarStudioData'
import { useRadarRuntime } from '../radarRuntime/RadarRuntimeContext'
import { RADAR_FONT_BODY, radarStudioColors, radarStudioLayout } from '../radarStudioTokens'

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
`

const Chip = styled.button<{ $active?: boolean }>`
  height: ${radarStudioLayout.filterPillHeight};
  padding: 0 18px;
  border-radius: 999px;
  border: 1px solid ${({ $active }) => ($active ? radarStudioColors.gold : radarStudioColors.cardBorder)};
  background: ${({ $active }) => ($active ? radarStudioColors.gold : radarStudioColors.card)};
  color: ${({ $active }) => ($active ? '#050505' : radarStudioColors.secondary)};
  font-family: ${RADAR_FONT_BODY};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 180ms ease, background 180ms ease;
  white-space: nowrap;

  &:hover {
    border-color: ${radarStudioColors.gold};
  }
`

export const RadarFilterRow: React.FC = () => {
  const { filter, setFilter } = useRadarRuntime()

  const setChip = (chip: string) => setFilter(chip as typeof filter)

  return (
    <Wrap data-rd-filters>
      <Row data-rd-filter-chains>
        {FILTER_CHAINS.map((chip) => (
          <Chip key={chip} type="button" $active={filter === chip} onClick={() => setChip(chip)}>
            {chip}
          </Chip>
        ))}
      </Row>
      <Row data-rd-filter-categories>
        {FILTER_CATEGORIES.map((chip) => (
          <Chip key={chip} type="button" $active={filter === chip} onClick={() => setChip(chip)}>
            {chip}
          </Chip>
        ))}
      </Row>
      <Row data-rd-filter-sort>
        {FILTER_SORT.map((chip) => (
          <Chip key={chip} type="button" $active={filter === chip} onClick={() => setChip(chip)}>
            {chip}
          </Chip>
        ))}
      </Row>
    </Wrap>
  )
}

export default RadarFilterRow
