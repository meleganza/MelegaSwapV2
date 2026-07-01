import React, { useRef, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { colors, typography, animation } from '../../tokens'
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
  background: rgba(212, 175, 55, 0.03);
  overflow: hidden;
  box-shadow: none;

  @media (min-width: 768px) {
    height: 44px;
  }

  ${({ $padding, $margin }) => layoutStyles({ padding: $padding, margin: $margin })}
`

const Label = styled.div`
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding-left: 16px;
  padding-right: 20px;
  font-family: ${typography.fontFamily.body};
  font-size: 13px;
  font-weight: 500;
  color: ${colors.gold};
`

const LabelIcon = styled.span`
  display: inline-flex;
  width: 16px;
  height: 16px;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  line-height: 1;
`

const TrackWrap = styled.div`
  flex: 1;
  overflow: hidden;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
`

const Track = styled.div<{ $paused?: boolean }>`
  display: flex;
  align-items: center;
  gap: 36px;
  width: max-content;
  white-space: nowrap;
  animation: ${melegaTicker} ${animation.ticker} linear infinite;
  animation-play-state: ${({ $paused }) => ($paused ? 'paused' : 'running')};

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const Item = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: inherit;
  font-size: 13px;
  font-weight: 500;
`

const ItemIcon = styled.span`
  display: inline-flex;
  width: 16px;
  height: 16px;
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
  font-weight: 500;
  color: ${colors.textPrimary};
`

const Secondary = styled.span`
  font-weight: 500;
  color: ${colors.textSecondary};
`

const Accent = styled.span`
  font-weight: 500;
  color: ${colors.green};
`

const Dot = styled.span`
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: ${colors.gold};
  flex-shrink: 0;
`

export const MelegaTicker: React.FC<MelegaTickerProps> = ({
  label = 'Trending',
  items,
  paused: pausedProp,
  padding,
  margin,
  disabled,
}) => {
  const [hoverPaused, setHoverPaused] = useState(false)
  const [dragPaused, setDragPaused] = useState(false)
  const dragRef = useRef(false)

  if (!items.length || disabled) return null

  const loop = [...items, ...items]
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
      onMouseEnter={() => setHoverPaused(true)}
      onMouseLeave={() => {
        setHoverPaused(false)
        setDragPaused(false)
      }}
      onTouchStart={() => setHoverPaused(true)}
      onTouchEnd={() => setHoverPaused(false)}
    >
      <Label>
        <LabelIcon aria-hidden>⚡</LabelIcon>
        {label}
      </Label>
      <TrackWrap
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <Track $paused={paused}>
          {loop.map((item, i) => (
            <React.Fragment key={`${item.id}-${i}`}>
              <Item href={item.href || '#'}>
                {item.icon && <ItemIcon>{item.icon}</ItemIcon>}
                <Primary>{item.primary}</Primary>
                {item.secondary && <Secondary>{item.secondary}</Secondary>}
                {item.accent && <Accent>{item.accent}</Accent>}
              </Item>
              {i < loop.length - 1 && <Dot aria-hidden />}
            </React.Fragment>
          ))}
        </Track>
      </TrackWrap>
    </Strip>
  )
}

export default MelegaTicker
