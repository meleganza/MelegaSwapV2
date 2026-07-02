import React, { useState } from 'react'
import styled from 'styled-components'
import { TRENDING_FILTER_CHIPS } from '../trendingStudioData'
import { trendingStudioLayout } from '../trendingStudioTokens'
import { TrChip } from './trendingStudioPrimitives'

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${trendingStudioLayout.filterGap};
`

export const TrendingFilterRow: React.FC = () => {
  const [active, setActive] = useState<string>('All')

  return (
    <Row data-tr-filter-row>
      {TRENDING_FILTER_CHIPS.map((chip) => (
        <TrChip key={chip} type="button" $active={active === chip} onClick={() => setActive(chip)}>
          {chip}
        </TrChip>
      ))}
    </Row>
  )
}

export default TrendingFilterRow
