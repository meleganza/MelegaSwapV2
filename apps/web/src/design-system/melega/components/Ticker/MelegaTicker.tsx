import React, { useState } from 'react'
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
  margin-bottom: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  background: linear-gradient(
    90deg,
    rgba(212, 175, 55, 0.06),
    rgba(255, 255, 255, 0.015),
    rgba(212, 175, 55, 0.06)
  );
  overflow: hidden;
  box-shadow: none;

  @media (min-width: 768px) {
    height: 44px;
  }

  ${({ $padding, $margin }) => layoutStyles({ padding: $padding, margin: $margin })}
`

const Label = styled.div`
  flex-shrink: 0;
  padding-left: 14px;
  padding-right: 18px;
  font-family: ${typography.fontFamily.body};
  font-size: 13px;
  font-weight: ${typography.fontWeight.extrabold};
  color: ${colors.gold};
`

const TrackWrap = styled.div`
  flex: 1;
  overflow: hidden;
`

const Track = styled.div<{ $paused?: boolean }>`
  display: flex;
  align-items: center;
  gap: 26px;
  width: max-content;
  white-space: nowrap;
  animation: ${melegaTicker} ${animation.ticker} infinite;
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
`

const Primary = styled.span`
  font-weight: ${typography.fontWeight.extrabold};
  color: ${colors.textPrimary};
`

const Secondary = styled.span`
  color: ${colors.textSecondary};
`

const Accent = styled.span`
  font-weight: ${typography.fontWeight.semibold};
  color: ${colors.green};
`

const Dot = styled.span`
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: ${colors.gold};
  opacity: 0.8;
`

export const MelegaTicker: React.FC<MelegaTickerProps> = ({
  label = '⚡ Trending',
  items,
  paused: pausedProp,
  padding,
  margin,
  disabled,
}) => {
  const [hoverPaused, setHoverPaused] = useState(false)
  if (!items.length || disabled) return null

  const loop = [...items, ...items]
  const paused = pausedProp ?? hoverPaused

  return (
    <Strip
      $padding={padding}
      $margin={margin}
      onMouseEnter={() => setHoverPaused(true)}
      onMouseLeave={() => setHoverPaused(false)}
      onTouchStart={() => setHoverPaused(true)}
      onTouchEnd={() => setHoverPaused(false)}
    >
      <Label>{label}</Label>
      <TrackWrap>
        <Track $paused={paused}>
          {loop.map((item, i) => (
            <React.Fragment key={`${item.id}-${i}`}>
              <Item href={item.href || '#'}>
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
