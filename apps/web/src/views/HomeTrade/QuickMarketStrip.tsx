import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import styled, { keyframes } from 'styled-components'
import { MarketCard } from './useHomeTradeData'
import { ht } from './homeTradeTokens'

const fadeSlide = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`

const DesktopGrid = styled.div`
  display: none;
  margin-top: 12px;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;

  @media (min-width: 1024px) {
    display: grid;
  }
`

const MobileScroll = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  margin-top: 12px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (min-width: 1024px) {
    display: none;
  }
`

const Card = styled(Link)`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: #111111;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 12px;
  text-decoration: none;
  box-sizing: border-box;
  height: 74px;
  overflow: hidden;
  transition: border-color 180ms ease, transform 180ms ease;

  &:hover {
    border-color: rgba(212, 175, 55, 0.35);
    transform: translateY(-1px);
  }

  @media (max-width: 1023px) {
    flex: 0 0 156px;
    height: 112px;
  }
`

const Rotator = styled.div`
  animation: ${fadeSlide} 400ms ease;
`

const Label = styled.div`
  font-family: ${ht.fontBody};
  font-size: 11px;
  color: #8f8f8f;
  line-height: 1.3;
`

const Value = styled.div`
  font-family: ${ht.fontBody};
  font-size: 15px;
  font-weight: 700;
  color: ${ht.white};
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
`

const Meta = styled.div<{ $positive?: boolean }>`
  font-size: 12px;
  color: ${({ $positive }) => ($positive !== false ? ht.green : '#9e9e9e')};
  line-height: 1.3;
  margin-top: 2px;
`

const Spark = styled.svg`
  position: absolute;
  right: 8px;
  bottom: 8px;
  width: 48px;
  height: 18px;
  opacity: 0.28;
  pointer-events: none;
`

const MarketCardItem: React.FC<{ card: MarketCard }> = ({ card }) => (
  <Card href={card.href}>
    <Rotator key={`${card.id}-${card.value}`}>
      <Label>{card.label}</Label>
      <Value>{card.value}</Value>
      {card.meta && <Meta $positive={card.meta.includes('%') || card.meta.includes('+')}>{card.meta}</Meta>}
    </Rotator>
    <Spark viewBox="0 0 48 18" fill="none" aria-hidden>
      <path
        d="M0 12 L8 8 L14 14 L22 5 L30 11 L38 4 L48 9"
        stroke={ht.gold}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Spark>
  </Card>
)

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

  return (
    <>
      <DesktopGrid>
        {displayCards.map((card) => (
          <MarketCardItem key={`${card.id}-${slot}`} card={card} />
        ))}
      </DesktopGrid>
      <MobileScroll>
        {cards.slice(0, 4).map((card) => (
          <MarketCardItem key={card.id} card={card} />
        ))}
      </MobileScroll>
    </>
  )
}

export default QuickMarketStrip
