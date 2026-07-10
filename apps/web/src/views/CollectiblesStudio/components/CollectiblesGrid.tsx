import React from 'react'
import styled from 'styled-components'
import { useCollectiblesRuntime } from '../collectiblesRuntime/CollectiblesRuntimeContext'
import { collectiblesStudioLayout } from '../collectiblesStudioTokens'
import CollectibleGridCard from './CollectibleGridCard'

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: ${collectiblesStudioLayout.gridGap};
  min-width: 0;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 14px;
  }
`

export const CollectiblesGrid: React.FC = () => {
  const { cards } = useCollectiblesRuntime()

  return (
  <Grid id="cs-collections" data-cs-grid>
    {cards.map((collection) => (
      <CollectibleGridCard key={collection.id} collection={collection} />
    ))}
  </Grid>
  )
}

export default CollectiblesGrid
