import React from 'react'
import styled from 'styled-components'
import { MelegaStatCard } from 'design-system/melega'
import { MarketCard } from './useHomeTradeData'

const Strip = styled.div`
  margin-top: 0;
`

const MarketGrid = styled.div<{ $count: number }>`
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr;

  @media (min-width: 768px) {
    grid-template-columns: ${({ $count }) =>
      $count === 1 ? 'minmax(0, 520px)' : $count === 2 ? 'repeat(2, minmax(0, 1fr))' : 'repeat(3, minmax(0, 1fr))'};
  }
`

const CardSlot = styled.div`
  min-width: 0;
`

export interface QuickMarketStripProps {
  cards: MarketCard[]
}

export const QuickMarketStrip: React.FC<QuickMarketStripProps> = ({ cards }) => {
  if (cards.length === 0) return null

  return (
    <Strip data-home-market-strip>
      <MarketGrid $count={cards.length}>
        {cards.map((card) => (
          <CardSlot key={card.id}>
            <MelegaStatCard
              label={card.label}
              value={card.value}
              meta={card.meta}
              metaPositive={card.meta?.includes('%') || card.meta?.includes('+')}
              href={card.href}
            />
          </CardSlot>
        ))}
      </MarketGrid>
    </Strip>
  )
}

export default QuickMarketStrip
