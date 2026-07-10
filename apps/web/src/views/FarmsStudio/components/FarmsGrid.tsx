import React from 'react'
import styled from 'styled-components'
import { farmsStudioLayout } from '../farmsStudioTokens'
import { useFarmsRuntime } from '../farmsRuntime/FarmsRuntimeContext'
import FarmGridCard from './FarmGridCard'

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(${farmsStudioLayout.pageGridColumns}, minmax(0, 1fr));
  column-gap: ${farmsStudioLayout.pageGridGap};
  row-gap: ${farmsStudioLayout.pageGridGap};
  margin-top: ${farmsStudioLayout.gridMarginTop};
  width: 100%;
  min-width: 0;

  @media (max-width: 1099px) and (min-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

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

export const FarmsGrid: React.FC = () => {
  const { farms, loadingLabel } = useFarmsRuntime()

  return (
    <Grid data-fs-farm-grid>
      {loadingLabel ? (
        <Empty>{loadingLabel}</Empty>
      ) : farms.length === 0 ? (
        <Empty>No farms available on this network.</Empty>
      ) : (
        farms.map((farm) => <FarmGridCard key={farm.id} farm={farm} />)
      )}
    </Grid>
  )
}

export default FarmsGrid
