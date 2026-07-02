import React from 'react'
import styled from 'styled-components'
import { FARM_PREVIEW_CARDS } from '../farmsStudioData'
import { farmsStudioLayout } from '../farmsStudioTokens'
import FarmGridCard from './FarmGridCard'

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${farmsStudioLayout.gridGap};
  margin-top: ${farmsStudioLayout.gridMarginTop};
  min-width: 0;

  @media (max-width: 1099px) {
    grid-template-columns: repeat(2, 1fr);
  }

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
