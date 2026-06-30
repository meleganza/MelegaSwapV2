import React, { useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { colors, typography, spacing, animation } from '../../tokens'
import { layoutStyles } from '../../primitives'
import type { MelegaLayoutProps } from '../../primitives'

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

const scrollAnim = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`

const Strip = styled.div<{
  $padding?: MelegaLayoutProps['padding']
  $margin?: MelegaLayoutProps['margin']
}>`
  display: flex;
  align-items: center;
  height: 46px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  background: linear-gradient(
    90deg,
    rgba(212, 175, 55, 0.04),
    rgba(255, 255, 255, 0.015),
    rgba(212, 175, 55, 0.04)
  );
  overflow: hidden;
  box-shadow: none;

  ${({ $padding, $margin }) => layoutStyles({ padding: $padding, margin: $margin })}
`

const Label = styled.div`
  flex-shrink: 0;
  padding-left: ${spacing[4]};
  margin-right: ${spacing[4]};
  font-family: ${typography.fontFamily.body};
  font-size: ${typography.fontSize.md};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.gold};
`

const TrackWrap = styled.div`
  flex: 1;
  overflow: hidden;
`

const Track = styled.div<{ $paused?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${spacing[8]};
  width: max-content;
  white-space: nowrap;
  animation: ${scrollAnim} ${animation.ticker} infinite;
  animation-play-state: ${({ $paused }) => ($paused ? 'paused' : 'running')};

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const Item = styled.a`
  display: inline-flex;
  align-items: center;
  gap: ${spacing[2]};
  text-decoration: none;
  color: inherit;
`

const Primary = styled.span`
  font-size: ${typography.fontSize.md};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.textPrimary};
`

const Secondary = styled.span`
  font-size: ${typography.fontSize.sm};
  color: ${colors.textSecondary};
`

const Accent = styled.span`
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.semibold};
  color: ${colors.green};
`

const Dot = styled.span`
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: ${colors.gold};
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
  if (!items.length || disabled) return null

  const loop = [...items, ...items]
  const paused = pausedProp ?? hoverPaused

  return (
    <Strip
      $padding={padding}
      $margin={margin}
      onMouseEnter={() => setHoverPaused(true)}
      onMouseLeave={() => setHoverPaused(false)}
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
