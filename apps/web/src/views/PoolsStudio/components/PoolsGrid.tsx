import React from 'react'
import styled from 'styled-components'
import { poolsStudioColors, poolsStudioLayout } from '../poolsStudioTokens'
import { usePoolsRuntime } from '../poolsRuntime/PoolsRuntimeContext'
import PoolGridCard from './PoolGridCard'

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, ${poolsStudioLayout.poolCardWidth});
  column-gap: ${poolsStudioLayout.cardGap};
  row-gap: ${poolsStudioLayout.poolCardRowGap};
  width: fit-content;
  max-width: 100%;
  min-width: 0;
  margin-top: ${poolsStudioLayout.gapExplorerGrid};

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    width: 100%;
  }
`

const EmptyState = styled.div`
  margin-top: ${poolsStudioLayout.gapExplorerGrid};
  width: 100%;
  height: ${poolsStudioLayout.emptyGridHeight};
  min-height: ${poolsStudioLayout.emptyGridHeight};
  border-radius: 18px;
  border: 1px solid ${poolsStudioColors.explorerEmptyBorder};
  background: ${poolsStudioColors.card};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 16px 24px;
  box-sizing: border-box;
  text-align: center;
`

const EmptyTitle = styled.p`
  margin: 0;
  font-family: Inter, sans-serif;
  font-size: 14px;
  line-height: 20px;
  font-weight: 600;
  color: ${poolsStudioColors.explorerEmptyMain};
`

const EmptySub = styled.p`
  margin: 0;
  font-family: Inter, sans-serif;
  font-size: 13px;
  line-height: 18px;
  font-weight: 500;
  color: ${poolsStudioColors.explorerEmptySecondary};
`

const Loading = styled(EmptyState)`
  font-family: Inter, sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: ${poolsStudioColors.explorerEmptyMain};
`

export const PoolsGrid: React.FC = () => {
  const { pools, loadingLabel } = usePoolsRuntime()

  if (loadingLabel) {
    return <Loading>{loadingLabel}</Loading>
  }

  if (pools.length === 0) {
    return (
      <EmptyState data-ps-pool-grid data-ps-pool-grid-empty data-r708-empty-grid>
        <EmptyTitle>No sustainable live pools match the current filters.</EmptyTitle>
        <EmptySub>Check Finished Pools or create a funded reward pool.</EmptySub>
      </EmptyState>
    )
  }

  return (
    <Grid data-ps-pool-grid data-r708-pool-grid data-r717-pool-grid>
      {pools.map((pool) => (
        <PoolGridCard key={pool.id} pool={pool} />
      ))}
    </Grid>
  )
}

export default PoolsGrid
