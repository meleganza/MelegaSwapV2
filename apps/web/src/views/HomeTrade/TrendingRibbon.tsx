import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { RibbonItem } from './useHomeTradeData'
import { ht } from './homeTradeTokens'

const DesktopGrid = styled.div`
  display: none;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  height: 58px;
  margin-top: 18px;

  @media (min-width: 1024px) {
    display: grid;
  }
`

const MobileScroll = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  overflow-y: hidden;
  height: 72px;
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
  display: flex;
  align-items: center;
  gap: 10px;
  background: ${ht.surface2};
  border: 1px solid ${ht.borderSoft};
  border-radius: 10px;
  padding: 0 12px;
  text-decoration: none;
  height: 72px;
  width: 170px;
  flex-shrink: 0;
  box-sizing: border-box;
  transition: border-color 150ms ease;

  &:hover {
    border-color: ${ht.borderGold};
  }

  @media (min-width: 1024px) {
    height: 58px;
    width: auto;
    min-width: 0;
    padding: 0 10px;
  }
`

const IconBox = styled.div<{ $variant: RibbonItem['icon'] }>`
  width: 34px;
  height: 34px;
  border-radius: 8px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $variant }) =>
    $variant === 'trend' ? 'rgba(244, 197, 66, 0.15)' : $variant === 'swap' ? ht.greenSoftBg : ht.goldSoftBg};
  color: ${({ $variant }) => ($variant === 'swap' ? ht.green : ht.gold)};
  font-size: 16px;
`

const TextCol = styled.div`
  min-width: 0;
  flex: 1;
`

const Title = styled.div`
  font-family: ${ht.fontBody};
  font-size: 13px;
  font-weight: 700;
  color: ${ht.white};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Subtitle = styled.div`
  font-size: 12px;
  color: #9e9e9e;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const iconGlyph = (icon: RibbonItem['icon']) => {
  switch (icon) {
    case 'trend':
      return '🔥'
    case 'swap':
      return '↔'
    case 'pool':
      return '◉'
    case 'project':
      return '●'
    default:
      return '→'
  }
}

const RibbonCard: React.FC<{ item: RibbonItem }> = ({ item }) => (
  <Card href={item.href}>
    <IconBox $variant={item.icon}>{iconGlyph(item.icon)}</IconBox>
    <TextCol>
      <Title>{item.title}</Title>
      <Subtitle>{item.subtitle}</Subtitle>
    </TextCol>
  </Card>
)

export const TrendingRibbon: React.FC<{ items: RibbonItem[] }> = ({ items }) => {
  if (!items.length) return null

  return (
    <>
      <DesktopGrid>
        {items.slice(0, 5).map((item) => (
          <RibbonCard key={item.id} item={item} />
        ))}
      </DesktopGrid>
      <MobileScroll>
        {items.map((item) => (
          <RibbonCard key={item.id} item={item} />
        ))}
      </MobileScroll>
    </>
  )
}

export default TrendingRibbon
