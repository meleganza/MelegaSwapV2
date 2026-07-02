import React from 'react'
import styled from 'styled-components'
import { POOL_PREVIEW_CARDS } from '../poolsStudioData'
import { poolsStudioLayout } from '../poolsStudioTokens'
import PoolGridCard from './PoolGridCard'

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: ${poolsStudioLayout.pageGridGap};
  width: 100%;
  min-width: 0;

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
  }
`

export const PoolsGrid: React.FC = () => (
  <Grid data-ps-pool-grid>
    {POOL_PREVIEW_CARDS.map((pool) => (
      <PoolGridCard key={pool.id} pool={pool} />
    ))}
  </Grid>
)

export default PoolsGrid
