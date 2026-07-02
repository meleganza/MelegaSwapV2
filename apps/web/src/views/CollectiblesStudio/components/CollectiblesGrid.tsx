import React from 'react'
import styled from 'styled-components'
import { COLLECTION_CARDS } from '../collectiblesStudioData'
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

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
  }
`

export const CollectiblesGrid: React.FC = () => (
  <Grid data-cs-grid>
    {COLLECTION_CARDS.map((collection) => (
      <CollectibleGridCard key={collection.id} collection={collection} />
    ))}
  </Grid>
)

export default CollectiblesGrid
