import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { MarketCard } from './useHomeTradeData'
import { ht } from './homeTradeTokens'

const DesktopGrid = styled.div`
  display: none;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-top: 14px;

  @media (min-width: 1024px) {
    display: grid;
  }
`

const MobileGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-top: 12px;

  @media (min-width: 1024px) {
    display: none;
  }
`

const Card = styled(Link)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: ${ht.surface2};
  border: 1px solid ${ht.borderSoft};
  border-radius: 10px;
  padding: 14px;
  text-decoration: none;
  box-sizing: border-box;
  min-height: 116px;
  transition: border-color 150ms ease;

  &:hover {
    border-color: ${ht.borderGold};
  }

  @media (min-width: 1024px) {
    min-height: 88px;
    height: 88px;
  }
`

const Label = styled.div`
  font-family: ${ht.fontBody};
  font-size: 12px;
  color: ${ht.textMuted};
  margin-bottom: 4px;
`

const Value = styled.div`
  font-family: ${ht.fontBody};
  font-size: 15px;
  font-weight: 600;
  color: ${ht.white};
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Meta = styled.div`
  font-size: 12px;
  color: ${ht.green};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Change = styled.div`
  font-size: 12px;
  color: ${ht.textMuted};
  margin-top: 2px;
`

const MarketCardItem: React.FC<{ card: MarketCard }> = ({ card }) => (
  <Card href={card.href}>
    <Label>{card.label}</Label>
    <Value>{card.value}</Value>
    {card.meta && <Meta>{card.meta}</Meta>}
    {card.change && <Change>{card.change}</Change>}
  </Card>
)

export const QuickMarketStrip: React.FC<{ cards: MarketCard[] }> = ({ cards }) => {
  if (!cards.length) return null

  return (
    <>
      <DesktopGrid>
        {cards.slice(0, 4).map((card) => (
          <MarketCardItem key={card.id} card={card} />
        ))}
      </DesktopGrid>
      <MobileGrid>
        {cards.slice(0, 4).map((card) => (
          <MarketCardItem key={card.id} card={card} />
        ))}
      </MobileGrid>
    </>
  )
}

export default QuickMarketStrip
