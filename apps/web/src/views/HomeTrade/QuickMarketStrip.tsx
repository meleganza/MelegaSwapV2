import React from 'react'
import styled from 'styled-components'
import { MelegaStatCard } from 'design-system/melega'
import { MarketCard } from './useHomeTradeData'
import { homeTradeLayout } from './homeTradeTokens'

const Strip = styled.div`
  margin-top: 0;
`

const DesktopGrid = styled.div`
  display: none;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;

  @media (min-width: 768px) {
    display: grid;
  }
`

const CardSlot = styled.div`
  min-width: 0;
`

const MobileScroll = styled.div`
  display: flex;
  gap: ${homeTradeLayout.columnGap};
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (min-width: 768px) {
    display: none;
  }
`

export const QuickMarketStrip: React.FC<{ cards: MarketCard[]; isIndexing?: boolean }> = ({
  cards,
  isIndexing = false,
}) => {
  const displayCards = cards.slice(0, 4)

  if (displayCards.length === 0) {
    const emptyMeta = isIndexing ? 'Waiting for indexing' : 'No recent activity yet'
    return (
      <Strip data-home-market-strip>
        <DesktopGrid>
          {['Top Volume', 'Top Farm', 'Latest Listing', 'Market Pulse'].map((label) => (
            <CardSlot key={label}>
              <MelegaStatCard label={label} value="—" meta={emptyMeta} />
            </CardSlot>
          ))}
        </DesktopGrid>
      </Strip>
    )
  }

  return (
    <Strip data-home-market-strip>
      <DesktopGrid>
        {displayCards.map((card) => (
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
      </DesktopGrid>
      <MobileScroll>
        {displayCards.map((card) => (
          <MelegaStatCard
            key={card.id}
            label={card.label}
            value={card.value}
            meta={card.meta}
            metaPositive={card.meta?.includes('%') || card.meta?.includes('+')}
            href={card.href}
          />
        ))}
      </MobileScroll>
    </Strip>
  )
}

export default QuickMarketStrip
