import React from 'react'
import styled, { keyframes } from 'styled-components'
import { colors, typography, spacing } from '../../tokens'
import { layoutStyles } from '../../primitives'
import type { MelegaLayoutProps } from '../../primitives'

const rowIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`

export interface MelegaTimelineRowProps extends MelegaLayoutProps {
  icon?: React.ReactNode
  event: string
  context?: string
  time?: string
  showLine?: boolean
}

const Row = styled.div<{
  $padding?: MelegaLayoutProps['padding']
  $margin?: MelegaLayoutProps['margin']
}>`
  display: grid;
  grid-template-columns: 18px 1fr auto;
  gap: ${spacing[3]};
  align-items: center;
  min-height: 30px;
  animation: ${rowIn} 180ms ease backwards;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }

  ${({ $padding, $margin }) => layoutStyles({ padding: $padding, margin: $margin })}
`

const Icon = styled.span`
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.gold};
  z-index: 1;
`

const EventCol = styled.div`
  min-width: 0;
`

const Event = styled.div`
  font-size: ${typography.fontSize.md};
  font-weight: ${typography.fontWeight.semibold};
  color: ${colors.textPrimary};
`

const Context = styled.div`
  font-size: ${typography.fontSize.sm};
  color: ${colors.textMuted};
`

const Time = styled.div`
  font-size: ${typography.fontSize.sm};
  color: ${colors.textMuted};
  white-space: nowrap;
`

export const MelegaTimelineRow: React.FC<MelegaTimelineRowProps> = ({
  icon = '●',
  event,
  context,
  time,
  padding,
  margin,
  loading,
}) => (
  <Row $padding={padding} $margin={margin}>
    <Icon>{loading ? '…' : icon}</Icon>
    <EventCol>
      <Event>{event}</Event>
      {context && <Context>{context}</Context>}
    </EventCol>
    {time && <Time>{time}</Time>}
  </Row>
)

export default MelegaTimelineRow
