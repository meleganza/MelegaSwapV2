import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { MelegaStatCard } from 'design-system/melega'
import { MarketCard } from './useHomeTradeData'
import { homeTradeLayout } from './homeTradeTokens'

const Strip = styled.div`
  margin-top: ${homeTradeLayout.gridGutter};
`

const DesktopGrid = styled.div<{ $cols: number }>`
  display: none;
  grid-template-columns: repeat(${({ $cols }) => $cols}, 1fr);
  gap: 8px;

  @media (min-width: 768px) {
    display: grid;
  }
`

const MobileScroll = styled.div`
  display: flex;
  gap: 8px;
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

export const QuickMarketStrip: React.FC<{ cards: MarketCard[] }> = ({ cards }) => {
  const [slot, setSlot] = useState(0)
  const canRotate = cards.length > 5

  const displayCards = useMemo(() => {
    const pool = canRotate ? [...cards.slice(slot), ...cards.slice(0, slot)] : cards
    return pool.slice(0, 5)
  }, [cards, slot, canRotate])

  useEffect(() => {
    if (!canRotate) return undefined
    const id = window.setInterval(() => setSlot((s) => (s + 1) % cards.length), 6000)
    return () => window.clearInterval(id)
  }, [canRotate, cards.length])

  if (cards.length < 3) return null

  const cols = Math.min(displayCards.length, 5)

  return (
    <Strip data-home-market-strip>
      <DesktopGrid $cols={cols}>
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
