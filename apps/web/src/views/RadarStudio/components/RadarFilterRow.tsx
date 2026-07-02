import React, { useState } from 'react'
import styled from 'styled-components'
import { RADAR_FILTER_CHIPS } from '../radarStudioData'
import { radarStudioLayout } from '../radarStudioTokens'
import { RdChip } from './radarStudioPrimitives'

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${radarStudioLayout.filterGap};
`

export const RadarFilterRow: React.FC = () => {
  const [active, setActive] = useState<string>('All')

  return (
    <Row data-rd-filter-row>
      {RADAR_FILTER_CHIPS.map((chip) => (
        <RdChip key={chip} type="button" $active={active === chip} onClick={() => setActive(chip)}>
          {chip}
        </RdChip>
      ))}
    </Row>
  )
}

export default RadarFilterRow
