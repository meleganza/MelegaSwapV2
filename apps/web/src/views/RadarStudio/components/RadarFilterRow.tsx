import React from 'react'
import styled from 'styled-components'
import { RADAR_FILTER_CHIPS } from '../radarStudioData'
import { useRadarRuntime } from '../radarRuntime/RadarRuntimeContext'
import { radarStudioLayout } from '../radarStudioTokens'
import { RdChip } from './radarStudioPrimitives'

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${radarStudioLayout.filterGap};
  margin-top: ${radarStudioLayout.filterMarginTop};
  overflow-x: auto;
  min-width: 0;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 2px;

  @media (max-width: 767px) {
    flex-wrap: nowrap;
    max-height: 96px;
  }
`

export const RadarFilterRow: React.FC = () => {
  const { filter, setFilter } = useRadarRuntime()

  return (
    <Row data-rd-filter-row>
      {RADAR_FILTER_CHIPS.map((chip) => (
        <RdChip key={chip} type="button" $active={filter === chip} onClick={() => setFilter(chip)}>
          {chip}
        </RdChip>
      ))}
    </Row>
  )
}

export default RadarFilterRow
