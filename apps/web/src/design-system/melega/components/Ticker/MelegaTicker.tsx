import React, { useRef, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { typography } from '../../tokens'
import type { MelegaLayoutProps } from '../../primitives'
import { layoutStyles } from '../../primitives'

export interface MelegaTickerItem {
  id: string
  primary: string
  secondary?: string
  accent?: string
  href?: string
  icon?: React.ReactNode
  accentPositive?: boolean
  accentUnavailable?: boolean
}

export interface MelegaTickerProps extends MelegaLayoutProps {
  label?: string
  items: MelegaTickerItem[]
  paused?: boolean
  marqueeMinItems?: number
  emptyPrimary?: string
  emptySecondary?: string
  /** Animated live indicator next to the label. */
  showLiveDot?: boolean
}

const melegaTicker = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`

const livePulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.45; transform: scale(0.85); }
`

const Strip = styled.div<{
  $padding?: MelegaLayoutProps['padding']
  $margin?: MelegaLayoutProps['margin']
}>`
  display: flex;
  align-items: center;
  width: 100%;
  height: 44px;
  border-top: none;
  border-bottom: none;
  background: rgba(244, 196, 48, 0.04);
  overflow: hidden;
  box-shadow: none;

  @media (min-width: 768px) {
    height: 48px;
  }

  @media (min-width: 1024px) {
    height: 52px;
  }

  ${({ $padding, $margin }) => layoutStyles({ padding: $padding, margin: $margin })}
`

const TrackWrap = styled.div<{ $scrollable?: boolean }>`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  cursor: grab;
  display: flex;
  align-items: center;

  &:active {
    cursor: grabbing;
  }

  @media (max-width: 767px) {
    overflow-x: ${({ $scrollable }) => ($scrollable ? 'auto' : 'hidden')};
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    &::-webkit-scrollbar {
      display: none;
    }
  }
`

const Track = styled.div<{ $paused?: boolean; $static?: boolean }>`
  display: flex;
  align-items: center;
  width: max-content;
  white-space: nowrap;
  will-change: transform;
  animation: ${({ $static }) => ($static ? 'none' : melegaTicker)} 40s linear infinite;
  animation-play-state: ${({ $paused, $static }) => ($static || $paused ? 'paused' : 'running')};

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const AnchorWrap = styled.div`
  display: inline-flex;
  align-items: center;
  flex: 0 0 auto;
  padding-left: 14px;
  padding-right: 12px;
  white-space: nowrap;

  @media (min-width: 1024px) {
    padding-left: 22px;
    padding-right: 18px;
  }
`

const TrendingAnchor = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: ${typography.fontFamily.body};
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #f4c542;
  flex-shrink: 0;
`

const LiveDot = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #22c55e;
  flex-shrink: 0;
  animation: ${livePulse} 1.6s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const ItemLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-right: 0;
  text-decoration: none;
  color: inherit;
  font-size: 13px;
  flex-shrink: 0;
  white-space: nowrap;
`

const ItemSpan = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-right: 0;
  color: inherit;
  font-size: 13px;
  flex-shrink: 0;
  white-space: nowrap;
`

const ItemIcon = styled.span`
  display: inline-flex;
  width: 18px;
  height: 18px;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  @media (min-width: 1024px) {
    width: 20px;
    height: 20px;
  }

  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }
`

const Primary = styled.span`
  font-weight: 700;
  font-size: 13px;
  color: #ffffff;
`

const Secondary = styled.span`
  font-weight: 500;
  font-size: 12px;
  color: #a8a8a8;
  line-height: 1.3;
`

const Accent = styled.span<{ $positive?: boolean; $unavailable?: boolean }>`
  font-weight: 700;
  font-size: 13px;
  color: ${({ $unavailable, $positive }) =>
    $unavailable ? '#a8a8a8' : $positive === false ? '#ff5252' : '#00e676'};
`

const Bullet = styled.span`
  color: #6b7280;
  font-size: 12px;
  font-weight: 600;
  margin: 0 14px;
  flex-shrink: 0;
  user-select: none;
`

const EmptyRow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0;
  padding: 0 16px 0 0;
  flex: 1;
  min-width: 0;
  white-space: nowrap;
`

const EmptyMessage = styled.span`
  font-weight: 500;
  font-size: 13px;
  color: #a8a8a8;
  white-space: nowrap;
`

export const MelegaTicker: React.FC<MelegaTickerProps> = ({
  label = '🔥 TRENDING',
  items,
  paused: pausedProp,
  marqueeMinItems = 6,
  padding,
  margin,
  disabled,
  emptyPrimary = 'Market activity unavailable',
  emptySecondary,
  showLiveDot = false,
}) => {
  const [hoverPaused, setHoverPaused] = useState(false)
  const [dragPaused, setDragPaused] = useState(false)
  const dragRef = useRef(false)

  const safeItems = Array.isArray(items) ? items : []
  const marqueeEnabled = safeItems.length >= marqueeMinItems

  if (disabled) return null

  const labelNode = (
    <TrendingAnchor aria-hidden>
      <span>{label}</span>
      {showLiveDot ? <LiveDot data-trending-live-dot aria-hidden /> : null}
    </TrendingAnchor>
  )

  if (!safeItems.length) {
    return (
      <Strip $padding={padding} $margin={margin} data-melega-ticker>
        <AnchorWrap>{labelNode}</AnchorWrap>
        <EmptyRow>
          <EmptyMessage>{emptyPrimary}</EmptyMessage>
          {emptySecondary ? <EmptyMessage style={{ marginLeft: 8 }}>{emptySecondary}</EmptyMessage> : null}
        </EmptyRow>
      </Strip>
    )
  }

  const scrollItems = marqueeEnabled ? [...safeItems, ...safeItems] : safeItems
  const paused = pausedProp ?? hoverPaused ?? dragPaused

  const handlePointerDown = () => {
    dragRef.current = true
    setDragPaused(true)
  }

  const handlePointerUp = () => {
    if (dragRef.current) {
      dragRef.current = false
      setDragPaused(false)
    }
  }

  return (
    <Strip
      $padding={padding}
      $margin={margin}
      data-melega-ticker
      onMouseEnter={() => setHoverPaused(true)}
      onMouseLeave={() => {
        setHoverPaused(false)
        setDragPaused(false)
      }}
      onTouchStart={() => setDragPaused(true)}
      onTouchEnd={() => setDragPaused(false)}
      onTouchCancel={() => setDragPaused(false)}
    >
      <AnchorWrap>{labelNode}</AnchorWrap>
      <TrackWrap
        $scrollable={!marqueeEnabled || safeItems.length > 0}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <Track $paused={paused} $static={!marqueeEnabled} data-ticker-track>
          {scrollItems.map((item, i) => (
            <React.Fragment key={`${item.id}-${i}`}>
              {i > 0 ? <Bullet aria-hidden>•</Bullet> : null}
              {item.href ? (
                <ItemLink href={item.href}>
                  {item.icon && <ItemIcon>{item.icon}</ItemIcon>}
                  <Primary>{item.primary}</Primary>
                  {item.secondary ? <Secondary>{item.secondary}</Secondary> : null}
                  {item.accent ? (
                    <Accent $positive={item.accentPositive} $unavailable={item.accentUnavailable}>
                      {item.accent}
                    </Accent>
                  ) : null}
                </ItemLink>
              ) : (
                <ItemSpan>
                  {item.icon && <ItemIcon>{item.icon}</ItemIcon>}
                  <Primary>{item.primary}</Primary>
                  {item.secondary ? <Secondary>{item.secondary}</Secondary> : null}
                  {item.accent ? (
                    <Accent $positive={item.accentPositive} $unavailable={item.accentUnavailable}>
                      {item.accent}
                    </Accent>
                  ) : null}
                </ItemSpan>
              )}
            </React.Fragment>
          ))}
        </Track>
      </TrackWrap>
    </Strip>
  )
}

export default MelegaTicker
