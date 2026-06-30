import React, { useRef, useState } from 'react'
import Link from 'next/link'
import styled, { keyframes } from 'styled-components'
import { RibbonItem } from './useHomeTradeData'
import { ht } from './homeTradeTokens'

const scrollAnim = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`

const Strip = styled.div`
  display: flex;
  align-items: center;
  height: 38px;
  margin-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  background: linear-gradient(
    90deg,
    rgba(212, 175, 55, 0.04),
    rgba(255, 255, 255, 0.015),
    rgba(212, 175, 55, 0.04)
  );
  overflow: hidden;

  @media (min-width: 1024px) {
    height: 46px;
    margin-top: 14px;
    margin-bottom: 12px;
  }
`

const Label = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  padding-left: 14px;
  margin-right: 16px;
  font-family: ${ht.fontBody};
  font-size: 13px;
  font-weight: 700;
  color: ${ht.gold};

  @media (max-width: 1023px) {
    font-size: 12px;
    margin-right: 12px;
  }
`

const TrackWrap = styled.div`
  flex: 1;
  overflow: hidden;
  mask-image: linear-gradient(90deg, transparent, #000 3%, #000 97%, transparent);
`

const Track = styled.div<{ $paused: boolean }>`
  display: flex;
  align-items: center;
  gap: 22px;
  width: max-content;
  white-space: nowrap;
  animation: ${scrollAnim} 45s linear infinite;
  animation-play-state: ${({ $paused }) => ($paused ? 'paused' : 'running')};

  @media (min-width: 1024px) {
    gap: 28px;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const Item = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  flex-shrink: 0;
`

const ItemIcon = styled.span`
  font-size: 16px;
  line-height: 1;
`

const Primary = styled.span`
  font-family: ${ht.fontBody};
  font-size: 13px;
  font-weight: 700;
  color: ${ht.white};

  @media (max-width: 1023px) {
    font-size: 12px;
  }
`

const Secondary = styled.span`
  font-size: 12px;
  color: ${ht.textMuted};
`

const Positive = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: ${ht.green};
`

const Dot = styled.span`
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: ${ht.gold};
  flex-shrink: 0;
`

const iconGlyph = (icon: RibbonItem['icon']) => {
  switch (icon) {
    case 'trend':
      return '⚡'
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

const TickerItem: React.FC<{ item: RibbonItem }> = ({ item }) => (
  <Item href={item.href}>
    <ItemIcon>{iconGlyph(item.icon)}</ItemIcon>
    <Primary>{item.title}</Primary>
    {item.subtitle && <Secondary>{item.subtitle}</Secondary>}
    {item.meta && <Positive>{item.meta}</Positive>}
  </Item>
)

export const TrendingRibbon: React.FC<{ items: RibbonItem[] }> = ({ items }) => {
  const [paused, setPaused] = useState(false)
  const dragRef = useRef(false)

  if (!items.length) return null

  const displayItems = items.slice(0, 6)
  const loopItems = [...displayItems, ...displayItems]

  return (
    <Strip
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => !dragRef.current && setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <Label>
        <span aria-hidden>⚡</span>
        Trending
      </Label>
      <TrackWrap>
        <Track $paused={paused}>
          {loopItems.map((item, i) => (
            <React.Fragment key={`${item.id}-${i}`}>
              <TickerItem item={item} />
              {i < loopItems.length - 1 && <Dot aria-hidden />}
            </React.Fragment>
          ))}
        </Track>
      </TrackWrap>
    </Strip>
  )
}

export default TrendingRibbon
