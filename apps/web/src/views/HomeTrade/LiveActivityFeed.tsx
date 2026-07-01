import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { MelegaEmptyState, MelegaSectionCard, MelegaTimelineRow, colors } from 'design-system/melega'
import { ActivityRow } from './useHomeTradeData'

const SectionLink = styled(Link)`
  color: ${colors.gold};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

const Timeline = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  padding-left: 4px;

  &::before {
    content: '';
    position: absolute;
    left: 13px;
    top: 8px;
    bottom: 8px;
    width: 1px;
    background: rgba(212, 175, 55, 0.25);
  }
`

const eventIcon = (type: string) => {
  if (type === 'Swap') return '↔'
  if (type.includes('Added')) return '+'
  if (type.includes('Removed')) return '−'
  return '●'
}

export const LiveActivityFeed: React.FC<{ rows: ActivityRow[] }> = ({ rows }) => (
  <MelegaSectionCard
    title="Live Activity"
    minHeight="180px"
    action={<SectionLink href="/swap">View all →</SectionLink>}
  >
    {rows.length === 0 ? (
      <MelegaEmptyState
        title="No recent indexed activity yet."
        description="Swaps, listings, pools and farms will appear here as soon as they are indexed."
      />
    ) : (
      <Timeline>
        {rows.map((row) => (
          <MelegaTimelineRow
            key={row.id}
            icon={eventIcon(row.type)}
            event={row.type}
            context={row.context}
            time={row.time || row.value || ''}
          />
        ))}
      </Timeline>
    )}
  </MelegaSectionCard>
)

export default LiveActivityFeed
