import React from 'react'
import styled from 'styled-components'
import { poolsStudioLayout } from '../poolsStudioTokens'
import { usePoolsRuntime } from '../poolsRuntime/PoolsRuntimeContext'
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

const Empty = styled.p`
  grid-column: 1 / -1;
  margin: 0;
  padding: 24px;
  font-size: 13px;
  color: #a8a8a8;
  text-align: center;
`

export const PoolsGrid: React.FC = () => {
  const { pools, loadingLabel } = usePoolsRuntime()

  return (
    <Grid data-ps-pool-grid>
      {loadingLabel ? (
        <Empty>{loadingLabel}</Empty>
      ) : pools.length === 0 ? (
        <Empty>No pools available on this network.</Empty>
      ) : (
        pools.map((pool) => <PoolGridCard key={pool.id} pool={pool} />)
      )}
    </Grid>
  )
}

export default PoolsGrid
