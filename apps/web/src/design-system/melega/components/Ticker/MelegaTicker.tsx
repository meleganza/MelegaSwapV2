import React, { useMemo, useRef, useState } from 'react'
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
  0% { transform: translate3d(0, 0, 0); }
  100% { transform: translate3d(-50%, 0, 0); }
`

const Strip = styled.div<{
  $padding?: MelegaLayoutProps['padding']
  $margin?: MelegaLayoutProps['margin']
}>`
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 100%;
  min-width: 0;
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
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  cursor: grab;
  display: flex;
  align-items: center;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
  }

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
  contain: paint;
  backface-visibility: hidden;
  transform-style: flat;
  animation: ${({ $static }) => ($static ? 'none' : melegaTicker)} 62s linear infinite;
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

const paidItemStyles = `
  padding: 7px 15px 7px 10px;
  border: 1px solid rgba(244, 196, 48, 0.82);
  border-radius: 999px;
  background: linear-gradient(110deg, rgba(244, 196, 48, 0.13), rgba(8, 8, 8, 0.92) 42%);
  box-shadow: 0 0 18px rgba(244, 196, 48, 0.12), inset 0 0 0 1px rgba(255, 255, 255, 0.025);
`

const ItemLink = styled.a<{ $boosted?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 9px;
  margin-right: 30px;
  text-decoration: none;
  color: inherit;
  font-size: 14px;
  flex-shrink: 0;
  white-space: nowrap;
  ${({ $boosted }) => ($boosted ? paidItemStyles : '')}
`

const ItemSpan = styled.span<{ $boosted?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 9px;
  margin-right: 30px;
  color: inherit;
  font-size: 14px;
  flex-shrink: 0;
  white-space: nowrap;
  ${({ $boosted }) => ($boosted ? paidItemStyles : '')}
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

const BoostedLabel = styled.span`
  color: #f4c542;
  font-size: 10px;
  line-height: 1;
  font-weight: 850;
  letter-spacing: 0.08em;
`

const RocketMark = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" role="img" aria-label="Trend Boost">
    <defs>
      <linearGradient id="melegaRocketGold" x1="2" y1="22" x2="21" y2="2" gradientUnits="userSpaceOnUse">
        <stop stopColor="#9d6d05" />
        <stop offset="0.48" stopColor="#f4c542" />
        <stop offset="1" stopColor="#fff1a6" />
      </linearGradient>
    </defs>
    <path
      fill="url(#melegaRocketGold)"
      d="M14.6 3.1c2.1-1 4.2-1.1 5.9-1.1 0 1.7-.1 3.8-1.1 5.9l-5.6 7-4.7-4.7 5.5-7.1Zm1.2 4.2a1.7 1.7 0 1 0 2.4-2.4 1.7 1.7 0 0 0-2.4 2.4ZM8 11.4l4.6 4.6-2.2 2.2-1.5-1.5-2.8 3.1.6-4.3-1.5-1.5L8 11.4Zm1-3.2L4.7 9.4 8 10.2l1-2Zm7.8 7.8-.8-3-2.2 2.9 3 0Z"
    />
  </svg>
)

const Accent = styled.span<{ $positive?: boolean; $unavailable?: boolean }>`
  font-weight: 700;
  font-size: 14px;
  color: ${({ $unavailable, $positive }) => ($unavailable ? '#a8a8a8' : $positive === false ? '#ff5252' : '#00e676')};
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

const MelegaTickerComponent: React.FC<MelegaTickerProps> = ({
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

  const safeItems = useMemo(() => (Array.isArray(items) ? items : []), [items])
  const marqueeEnabled = safeItems.length >= marqueeMinItems
  const scrollItems = useMemo(
    () => (marqueeEnabled ? [...safeItems, ...safeItems] : safeItems),
    [marqueeEnabled, safeItems],
  )

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

  const paused = pausedProp ?? (hoverPaused || dragPaused)

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
        data-melega-ticker-track
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <Track $paused={paused} $static={!marqueeEnabled} data-ticker-track>
          {scrollItems.map((item, i) => (
            <React.Fragment key={`${item.id}-${i}`}>
              {(() => {
                const boosted = item.id.startsWith('paid-boosted-') || item.id.startsWith('paid-boosted')
                const icon = boosted ? <RocketMark /> : item.icon
                const secondary = boosted ? undefined : item.secondary
                const content = (
                  <>
                    {icon && <ItemIcon>{icon}</ItemIcon>}
                    <Primary>{item.primary}</Primary>
                    {boosted ? <BoostedLabel>BOOSTED</BoostedLabel> : null}
                    {secondary && <Secondary>{secondary}</Secondary>}
                    {item.accent && (
                      <Accent $positive={item.accentPositive} $unavailable={item.accentUnavailable}>
                        {item.accent}
                      </Accent>
                    )}
                  </>
                )
                return item.href ? (
                  <ItemLink href={item.href} $boosted={boosted}>
                    {content}
                  </ItemLink>
                ) : (
                  <ItemSpan $boosted={boosted}>{content}</ItemSpan>
                )
              })()}
            </React.Fragment>
          ))}
        </Track>
      </TrackWrap>
    </Strip>
  )
}

export const MelegaTicker = React.memo(MelegaTickerComponent)

export default MelegaTicker
