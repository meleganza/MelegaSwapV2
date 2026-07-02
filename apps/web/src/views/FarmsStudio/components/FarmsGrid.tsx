import React from 'react'
import styled from 'styled-components'
import { FARM_PREVIEW_CARDS } from '../farmsStudioData'
import { farmsStudioLayout } from '../farmsStudioTokens'
import FarmGridCard from './FarmGridCard'

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(${farmsStudioLayout.pageGridColumns}, minmax(0, 1fr));
  column-gap: ${farmsStudioLayout.pageGridGap};
  row-gap: ${farmsStudioLayout.pageGridGap};
  margin-top: ${farmsStudioLayout.gridMarginTop};
  width: 100%;
  min-width: 0;

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
  }
`

export const FarmsGrid: React.FC = () => (
  <Grid data-fs-farm-grid>
    {FARM_PREVIEW_CARDS.map((farm) => (
      <FarmGridCard key={farm.id} farm={farm} />
    ))}
  </Grid>
)

export default FarmsGrid
