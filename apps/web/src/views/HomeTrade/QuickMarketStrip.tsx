import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { MarketCard } from './useHomeTradeData'
import { ht } from './homeTradeTokens'

const DesktopGrid = styled.div`
  display: none;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;

  @media (min-width: 1024px) {
    display: grid;
  }
`

const MobileGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;

  @media (min-width: 1024px) {
    display: none;
  }
`

const Card = styled(Link)`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: ${ht.surface2};
  border: 1px solid ${ht.borderSoft};
  border-radius: 10px;
  padding: 12px 14px;
  text-decoration: none;
  box-sizing: border-box;
  min-height: 88px;
  overflow: hidden;
  transition: border-color 200ms ease, box-shadow 200ms ease, transform 200ms ease;

  &:hover {
    border-color: ${ht.borderGold};
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35);
    transform: translateY(-1px);
  }

  @media (max-width: 1023px) {
    min-height: 100px;
  }
`

const Label = styled.div`
  font-family: ${ht.fontBody};
  font-size: 12px;
  color: ${ht.textMuted};
  margin-bottom: 2px;
  line-height: 1.3;
`

const Value = styled.div`
  font-family: ${ht.fontBody};
  font-size: 14px;
  font-weight: 600;
  color: ${ht.white};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
`

const Meta = styled.div`
  font-size: 12px;
  color: ${ht.green};
  line-height: 1.3;
`

const Decor = styled.div<{ $type: 'spark' | 'arrow' | 'badge' | 'line' }>`
  position: absolute;
  right: 10px;
  bottom: 10px;
  opacity: 0.7;

  ${({ $type }) =>
    $type === 'spark' &&
    `
    width: 48px;
    height: 20px;
    background: linear-gradient(90deg, transparent 0%, ${ht.goldSoftBg} 30%, ${ht.greenSoftBg} 70%, transparent 100%);
    border-radius: 2px;
    mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 20'%3E%3Cpath d='M0 14 L8 10 L14 16 L22 6 L30 12 L38 4 L48 8' fill='none' stroke='white' stroke-width='2'/%3E%3C/svg%3E");
    mask-size: contain;
    mask-repeat: no-repeat;
  `}

  ${({ $type }) =>
    $type === 'arrow' &&
    `
    font-size: 14px;
    color: ${ht.green};
  `}

  ${({ $type }) =>
    $type === 'badge' &&
    `
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${ht.gold};
    box-shadow: 0 0 8px rgba(212,175,55,0.5);
  `}

  ${({ $type }) =>
    $type === 'line' &&
    `
    width: 40px;
    height: 3px;
    border-radius: 2px;
    background: linear-gradient(90deg, ${ht.goldDark}, ${ht.gold});
    opacity: 0.5;
  `}
`

const decorFor = (id: string): 'spark' | 'arrow' | 'badge' | 'line' => {
  if (id === 'top-pair') return 'spark'
  if (id === 'top-farm') return 'arrow'
  if (id === 'latest-project') return 'badge'
  return 'line'
}

const MarketCardItem: React.FC<{ card: MarketCard }> = ({ card }) => (
  <Card href={card.href}>
    <Label>{card.label}</Label>
    <Value>{card.value}</Value>
    {card.meta && <Meta>{card.meta}</Meta>}
    <Decor $type={decorFor(card.id)} aria-hidden>
      {decorFor(card.id) === 'arrow' && '↑'}
    </Decor>
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
