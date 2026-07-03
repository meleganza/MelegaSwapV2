import React from 'react'
import styled from 'styled-components'
import { useCollectiblesRuntime } from '../collectiblesRuntime/CollectiblesRuntimeContext'
import { collectiblesStudioLayout } from '../collectiblesStudioTokens'
import CollectibleGridCard from './CollectibleGridCard'

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(${collectiblesStudioLayout.gridColumns}, minmax(0, 1fr));
  gap: ${collectiblesStudioLayout.gridGap};
  min-width: 0;

  @media (max-width: 1099px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

export const CollectiblesGrid: React.FC = () => {
  const { cards } = useCollectiblesRuntime()

  return (
  <Grid data-cs-grid>
    {cards.map((collection) => (
      <CollectibleGridCard key={collection.id} collection={collection} />
    ))}
  </Grid>
  )
}

export default CollectiblesGrid
