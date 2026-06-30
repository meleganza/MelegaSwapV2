import React, { useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import styled, { keyframes } from 'styled-components'
import { RibbonItem } from './useHomeTradeData'
import { ht } from './homeTradeTokens'

const scrollAnim = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`

const fadeIn = keyframes`
  from { opacity: 0; box-shadow: 0 0 0 rgba(212, 175, 55, 0); }
  to { opacity: 1; box-shadow: 0 0 12px rgba(212, 175, 55, 0.12); }
`

const DesktopTrack = styled.div`
  display: none;
  margin-top: 12px;
  overflow: hidden;
  height: 58px;
  mask-image: linear-gradient(90deg, transparent, #000 4%, #000 96%, transparent);

  @media (min-width: 1024px) {
    display: block;
  }
`

const DesktopInner = styled.div<{ $paused: boolean }>`
  display: flex;
  gap: 10px;
  width: max-content;
  animation: ${scrollAnim} 48s linear infinite;
  animation-play-state: ${({ $paused }) => ($paused ? 'paused' : 'running')};

  &:hover {
    animation-play-state: paused;
  }
`

const MobileScroll = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  overflow-y: hidden;
  height: 72px;
  margin-top: 10px;
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
  height: 58px;
  width: 220px;
  flex-shrink: 0;
  box-sizing: border-box;
  transition: border-color 200ms ease, box-shadow 200ms ease, transform 200ms ease;
  animation: ${fadeIn} 600ms ease;

  &:hover {
    border-color: ${ht.borderGold};
    box-shadow: 0 4px 16px rgba(212, 175, 55, 0.1);
    transform: translateY(-1px);
  }

  @media (max-width: 1023px) {
    width: 170px;
    height: 72px;
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
  font-size: 15px;
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
    <div style={{ minWidth: 0, flex: 1 }}>
      <Title>{item.title}</Title>
      <Subtitle>{item.subtitle}</Subtitle>
    </div>
  </Card>
)

export const TrendingRibbon: React.FC<{ items: RibbonItem[] }> = ({ items }) => {
  const [paused, setPaused] = useState(false)
  const dragRef = useRef(false)

  const onPointerDown = useCallback(() => {
    dragRef.current = true
    setPaused(true)
  }, [])

  const onPointerUp = useCallback(() => {
    dragRef.current = false
    setPaused(false)
  }, [])

  if (!items.length) return null

  const displayItems = items.slice(0, 5)
  const loopItems = [...displayItems, ...displayItems]

  return (
    <>
      <DesktopTrack
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => !dragRef.current && setPaused(false)}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <DesktopInner $paused={paused}>
          {loopItems.map((item, i) => (
            <RibbonCard key={`${item.id}-${i}`} item={item} />
          ))}
        </DesktopInner>
      </DesktopTrack>
      <MobileScroll>
        {items.map((item) => (
          <RibbonCard key={item.id} item={item} />
        ))}
      </MobileScroll>
    </>
  )
}

export default TrendingRibbon
