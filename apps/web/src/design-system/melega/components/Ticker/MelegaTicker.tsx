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
}

export interface MelegaTickerProps extends MelegaLayoutProps {
  label?: string
  items: MelegaTickerItem[]
  paused?: boolean
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
  height: 36px;
  border-top: 1px solid rgba(212, 175, 55, 0.1);
  border-bottom: 1px solid rgba(212, 175, 55, 0.1);
  background: rgba(212, 175, 55, 0.035);
  overflow: hidden;
  box-shadow: none;
  width: 100%;

  @media (min-width: 768px) {
    height: 40px;
  }

  ${({ $padding, $margin }) => layoutStyles({ padding: $padding, margin: $margin })}
`

const TrackWrap = styled.div`
  flex: 1;
  overflow: hidden;
  cursor: grab;
  min-width: 0;

  &:active {
    cursor: grabbing;
  }
`

const Track = styled.div<{ $paused?: boolean }>`
  display: flex;
  align-items: center;
  width: max-content;
  white-space: nowrap;
  will-change: transform;
  animation: ${melegaTicker} 40s linear infinite;
  animation-play-state: ${({ $paused }) => ($paused ? 'paused' : 'running')};

  @media (min-width: 768px) {
    animation-duration: 40s;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const TrendingAnchor = styled.span`
  display: inline-flex;
  align-items: center;
  padding-left: 16px;
  font-family: ${typography.fontFamily.body};
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #f4c542;
  flex-shrink: 0;
`

const Item = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: inherit;
  font-size: 14px;
  flex-shrink: 0;
`

const ItemIcon = styled.span`
  display: inline-flex;
  width: 14px;
  height: 14px;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: ${colors.gold};
  opacity: 0.85;

  svg {
    width: 16px;
    height: 16px;
  }
`

const Primary = styled.span`
  font-weight: 700;
  font-size: 13px;
  color: #ffffff;
`

const Secondary = styled.span`
  font-weight: 400;
  font-size: 13px;
  color: #a8a8a8;
  line-height: 1.3;

  @media (max-width: 767px) {
    font-size: 11px;
    white-space: normal;
  }
`

const Accent = styled.span`
  font-weight: 700;
  font-size: 14px;
  color: #00e676;
`

const Dot = styled.span`
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: ${colors.gold};
  flex-shrink: 0;
  margin: 0 18px;
`

const EmptyRow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px 0 0;
  flex: 1;
  min-width: 0;

  @media (max-width: 767px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    padding-right: 12px;
  }
`

export const MelegaTicker: React.FC<MelegaTickerProps> = ({
  label = 'Trending',
  items,
  paused: pausedProp,
  padding,
  margin,
  disabled,
  emptyPrimary = 'No live market activity',
  emptySecondary = 'Pairs, swaps, farms and pools appear when indexed',
}) => {
  const [hoverPaused, setHoverPaused] = useState(false)
  const [dragPaused, setDragPaused] = useState(false)
  const dragRef = useRef(false)

  const safeItems = Array.isArray(items) ? items : []

  if (disabled) return null

  if (!safeItems.length) {
    return (
      <Strip $padding={padding} $margin={margin} data-melega-ticker>
        <TrendingAnchor aria-hidden>{label}</TrendingAnchor>
        <Dot aria-hidden />
        <EmptyRow>
          <Primary>{emptyPrimary}</Primary>
          <Secondary>{emptySecondary}</Secondary>
        </EmptyRow>
      </Strip>
    )
  }

  const scrollItems = [...safeItems, ...safeItems]
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
      <TrackWrap
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <Track $paused={paused} data-ticker-track>
          <TrendingAnchor aria-hidden>{label}</TrendingAnchor>
          <Dot aria-hidden />
          {scrollItems.map((item, i) => (
            <React.Fragment key={`${item.id}-${i}`}>
              <Item href={item.href || '#'}>
                {item.icon && <ItemIcon>{item.icon}</ItemIcon>}
                <Primary>{item.primary}</Primary>
                {item.secondary && <Secondary>{item.secondary}</Secondary>}
                {item.accent && <Accent>{item.accent}</Accent>}
              </Item>
              {i < scrollItems.length - 1 && <Dot aria-hidden />}
            </React.Fragment>
          ))}
        </Track>
      </TrackWrap>
    </Strip>
  )
}

export default MelegaTicker
