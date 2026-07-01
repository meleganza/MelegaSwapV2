import React, { useEffect, useMemo, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { MelegaStatCard } from 'design-system/melega'
import { MarketCard } from './useHomeTradeData'
import { homeTradeLayout } from './homeTradeTokens'

const fadeCross = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

const Strip = styled.div`
  margin-top: 0;
`

const DesktopGrid = styled.div`
  display: none;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;

  @media (min-width: 768px) {
    display: grid;
  }
`

const CardSlot = styled.div<{ $animating?: boolean }>`
  min-width: 0;
  animation: ${({ $animating }) => ($animating ? fadeCross : 'none')} 250ms ease;
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

const ROTATION_LABELS = [
  'Top Pair',
  'Top Token',
  'Top Farm',
  'Top Pool',
  'Latest Listing',
  'Top Volume',
] as const

const labelForCard = (card: MarketCard): string => {
  if (card.label === 'Top Pair') return 'Top Pair'
  if (card.label === 'Top Farm') return 'Top Farm'
  if (card.label.includes('Pool')) return 'Top Pool'
  if (card.label.includes('Project')) return 'Latest Listing'
  return card.label
}

export const QuickMarketStrip: React.FC<{ cards: MarketCard[] }> = ({ cards }) => {
  const [slot, setSlot] = useState(0)
  const [animating, setAnimating] = useState(false)

  const pool = useMemo(() => {
    if (!cards.length) return []
    const extended = [...cards]
    while (extended.length < 6) {
      extended.push(...cards)
    }
    return extended.slice(0, Math.max(6, cards.length))
  }, [cards])

  const displayCards = useMemo(() => {
    if (pool.length <= 4) return pool.slice(0, 4)
    const result: MarketCard[] = []
    for (let i = 0; i < 4; i += 1) {
      const idx = (slot + i) % pool.length
      const card = pool[idx]
      const rotLabel = ROTATION_LABELS[(slot + i) % ROTATION_LABELS.length]
      result.push({ ...card, label: rotLabel || labelForCard(card) })
    }
    return result
  }, [pool, slot])

  useEffect(() => {
    if (pool.length <= 4) return undefined
    const id = window.setInterval(() => {
      setAnimating(true)
      setSlot((s) => (s + 1) % pool.length)
      window.setTimeout(() => setAnimating(false), 260)
    }, 8000)
    return () => window.clearInterval(id)
  }, [pool.length])

  if (cards.length < 3) return null

  return (
    <Strip data-home-market-strip>
      <DesktopGrid>
        {displayCards.map((card) => (
          <CardSlot key={`${card.id}-${slot}-${card.label}`} $animating={animating}>
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
