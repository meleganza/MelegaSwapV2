import React from 'react'
import { MelegaTicker } from 'design-system/melega'
import useDexTrendingTicker from './useDexTrendingTicker'

export const TrendingRibbon: React.FC = () => {
  const { items, isIndexing } = useDexTrendingTicker()

  return (
    <MelegaTicker
      label="TRENDING ON MELEGA DEX"
      items={items ?? []}
      emptyPrimary={isIndexing ? 'Indexing Melega DEX activity' : undefined}
      emptySecondary={isIndexing ? 'Pairs, swaps, farms and pools will appear here automatically' : undefined}
    />
  )
}

export default TrendingRibbon
