import React, { useRef, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { colors, typography } from '../../tokens'
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
}

const melegaTicker = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`

const Strip = styled.div<{
  $padding?: MelegaLayoutProps['padding']
  $margin?: MelegaLayoutProps['margin']
}>`
  display: flex;
  align-items: center;
  width: 100%;
  height: 48px;
  border-top: 1px solid rgba(244, 196, 48, 0.1);
  border-bottom: 1px solid rgba(244, 196, 48, 0.1);
  background: rgba(244, 196, 48, 0.035);
  overflow: hidden;
  box-shadow: none;

  @media (min-width: 768px) {
    height: 52px;
  }

  @media (min-width: 1024px) {
    height: 56px;
  }

  ${({ $padding, $margin }) => layoutStyles({ padding: $padding, margin: $margin })}
`

const TrackWrap = styled.div`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  cursor: grab;
  display: flex;
  align-items: center;

  &:active {
    cursor: grabbing;
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
  padding-left: 18px;
  padding-right: 16px;
  white-space: nowrap;

  @media (min-width: 1024px) {
    padding-left: 28px;
    padding-right: 24px;
  }
`

const TrendingAnchor = styled.span`
  display: inline-flex;
  align-items: center;
  font-family: ${typography.fontFamily.body};
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #f4c542;
  flex-shrink: 0;
`

const ItemLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 9px;
  margin-right: 30px;
  text-decoration: none;
  color: inherit;
  font-size: 14px;
  flex-shrink: 0;
  white-space: nowrap;
`

const ItemSpan = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 9px;
  margin-right: 30px;
  color: inherit;
  font-size: 14px;
  flex-shrink: 0;
  white-space: nowrap;
`

const ItemIcon = styled.span`
  display: inline-flex;
  width: 20px;
  height: 20px;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  @media (min-width: 1024px) {
    width: 22px;
    height: 22px;
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
  font-size: 13px;
  color: #a8a8a8;
  line-height: 1.3;
`

const Accent = styled.span<{ $positive?: boolean; $unavailable?: boolean }>`
  font-weight: 700;
  font-size: 14px;
  color: ${({ $unavailable, $positive }) =>
    $unavailable ? '#a8a8a8' : $positive === false ? '#ff5252' : '#00e676'};
`

const Dot = styled.span`
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: ${colors.gold};
  flex-shrink: 0;
  margin: 0 12px;
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
  label = 'Trending',
  items,
  paused: pausedProp,
  marqueeMinItems = 6,
  padding,
  margin,
  disabled,
  emptyPrimary = 'Market ranking temporarily unavailable',
  emptySecondary,
}) => {
  const [hoverPaused, setHoverPaused] = useState(false)
  const [dragPaused, setDragPaused] = useState(false)
  const dragRef = useRef(false)

  const safeItems = Array.isArray(items) ? items : []
  const marqueeEnabled = safeItems.length >= marqueeMinItems

  if (disabled) return null

  if (!safeItems.length) {
    return (
      <Strip $padding={padding} $margin={margin} data-melega-ticker>
        <AnchorWrap>
          <TrendingAnchor aria-hidden>{label}</TrendingAnchor>
          <Dot aria-hidden />
          <EmptyRow>
            <EmptyMessage>{emptyPrimary}</EmptyMessage>
            {emptySecondary ? <EmptyMessage style={{ marginLeft: 8 }}>{emptySecondary}</EmptyMessage> : null}
          </EmptyRow>
        </AnchorWrap>
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
      <AnchorWrap>
        <TrendingAnchor aria-hidden>{label}</TrendingAnchor>
      </AnchorWrap>
      <TrackWrap
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <Track $paused={paused} $static={!marqueeEnabled} data-ticker-track>
          {scrollItems.map((item, i) => (
            <React.Fragment key={`${item.id}-${i}`}>
              {item.href ? (
                <ItemLink href={item.href}>
                  {item.icon && <ItemIcon>{item.icon}</ItemIcon>}
                  <Primary>{item.primary}</Primary>
                  {item.secondary && <Secondary>{item.secondary}</Secondary>}
                  {item.accent && (
                    <Accent $positive={item.accentPositive} $unavailable={item.accentUnavailable}>
                      {item.accent}
                    </Accent>
                  )}
                </ItemLink>
              ) : (
                <ItemSpan>
                  {item.icon && <ItemIcon>{item.icon}</ItemIcon>}
                  <Primary>{item.primary}</Primary>
                  {item.secondary && <Secondary>{item.secondary}</Secondary>}
                  {item.accent && (
                    <Accent $positive={item.accentPositive} $unavailable={item.accentUnavailable}>
                      {item.accent}
                    </Accent>
                  )}
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
