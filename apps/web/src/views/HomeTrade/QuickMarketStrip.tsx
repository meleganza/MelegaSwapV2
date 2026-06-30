import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { MarketCard } from './useHomeTradeData'
import { ht } from './homeTradeTokens'

const DesktopGrid = styled.div`
  display: none;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-top: 12px;

  @media (min-width: 1024px) {
    display: grid;
  }
`

const MobileScroll = styled.div`
  display: flex;
  gap: 10px;
  overflow-x: auto;
  margin-top: 10px;
  padding-bottom: 4px;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (min-width: 1024px) {
    display: none;
  }
`

const Card = styled(Link)`
  display: block;
  background: ${ht.surface2};
  border: 1px solid ${ht.borderSoft};
  border-radius: 10px;
  padding: 14px;
  text-decoration: none;
  min-width: 168px;
  height: 120px;
  box-sizing: border-box;
  transition: border-color 150ms ease;

  &:hover {
    border-color: ${ht.borderGold};
  }

  @media (min-width: 1024px) {
    min-width: 0;
    height: 94px;
  }
`

const Label = styled.div`
  font-family: ${ht.fontBody};
  font-size: 12px;
  color: ${ht.textMuted};
  margin-bottom: 6px;
`

const Value = styled.div`
  font-family: ${ht.fontBody};
  font-size: 15px;
  font-weight: 600;
  color: ${ht.white};
  margin-bottom: 4px;
`

const Meta = styled.div`
  font-size: 12px;
  color: ${ht.green};
`

const Change = styled.div`
  font-size: 12px;
  color: ${ht.textMuted};
  margin-top: 4px;
`

const Spark = styled.div`
  height: 24px;
  margin-top: 8px;
  background: linear-gradient(90deg, transparent, ${ht.goldSoftBg}, transparent);
  border-radius: 4px;
  opacity: 0.6;
`

const MarketCardItem: React.FC<{ card: MarketCard }> = ({ card }) => (
  <Card href={card.href}>
    <Label>{card.label}</Label>
    <Value>{card.value}</Value>
    {card.meta && <Meta>{card.meta}</Meta>}
    {card.change && <Change>{card.change}</Change>}
    {card.id === 'top-pair' && <Spark aria-hidden />}
  </Card>
)

export const QuickMarketStrip: React.FC<{ cards: MarketCard[] }> = ({ cards }) => {
  if (!cards.length) return null

  return (
    <>
      <DesktopGrid>
        {cards.map((card) => (
          <MarketCardItem key={card.id} card={card} />
        ))}
      </DesktopGrid>
      <MobileScroll>
        {cards.map((card) => (
          <MarketCardItem key={card.id} card={card} />
        ))}
      </MobileScroll>
    </>
  )
}

export default QuickMarketStrip
