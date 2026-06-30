import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { MelegaStatCard, spacing } from 'design-system/melega'
import { MarketCard } from './useHomeTradeData'
import { homeTradeLayout } from './homeTradeTokens'

const DesktopGrid = styled.div`
  display: none;
  margin-top: ${spacing[3]};
  grid-template-columns: repeat(4, 1fr);
  gap: ${spacing[2]};

  @media (min-width: 768px) {
    display: grid;
  }
`

const MobileScroll = styled.div`
  display: flex;
  gap: ${spacing[2]};
  overflow-x: auto;
  margin-top: ${spacing[3]};
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (min-width: 768px) {
    display: none;
  }
`

export const QuickMarketStrip: React.FC<{ cards: MarketCard[] }> = ({ cards }) => {
  const [slot, setSlot] = useState(0)
  const canRotate = cards.length > 4

  const displayCards = useMemo(() => {
    if (!canRotate) return cards.slice(0, 4)
    const rotated = [...cards.slice(slot), ...cards.slice(0, slot)]
    return rotated.slice(0, 4)
  }, [cards, slot, canRotate])

  useEffect(() => {
    if (!canRotate) return undefined
    const id = window.setInterval(() => setSlot((s) => (s + 1) % cards.length), 5000)
    return () => window.clearInterval(id)
  }, [canRotate, cards.length])

  if (!cards.length) return null

  const renderCard = (card: MarketCard) => (
    <MelegaStatCard
      key={card.id}
      label={card.label}
      value={card.value}
      meta={card.meta}
      metaPositive={card.meta?.includes('%') || card.meta?.includes('+')}
      href={card.href}
    />
  )

  return (
    <div data-home-market-strip style={{ maxWidth: homeTradeLayout.contentMax }}>
      <DesktopGrid>
        {displayCards.map((card) => (
          <MelegaStatCard
            key={`${card.id}-${slot}`}
            label={card.label}
            value={card.value}
            meta={card.meta}
            metaPositive={card.meta?.includes('%') || card.meta?.includes('+')}
            href={card.href}
          />
        ))}
      </DesktopGrid>
      <MobileScroll>{cards.slice(0, 4).map(renderCard)}</MobileScroll>
    </div>
  )
}

export default QuickMarketStrip
