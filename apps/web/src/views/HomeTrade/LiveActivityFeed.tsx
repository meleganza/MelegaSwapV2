import React from 'react'
import Link from 'next/link'
import styled, { keyframes } from 'styled-components'
import { MelegaSectionCard, MelegaTimelineRow, colors } from 'design-system/melega'
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

const EmptyWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  padding: 24px 16px;
  text-align: center;
`

const Orbit = styled.div`
  position: relative;
  width: 32px;
  height: 32px;
  margin-bottom: 14px;
`

const orbitPulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.25; }
  50% { transform: scale(1.6); opacity: 0.5; }
`

const OrbitRing = styled.div`
  position: absolute;
  inset: 0;
  border: 1px solid rgba(212, 175, 55, 0.35);
  border-radius: 50%;
  animation: ${orbitPulse} 2.5s ease-in-out infinite;
`

const OrbitDot = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 8px;
  margin: -4px 0 0 -4px;
  border-radius: 50%;
  background: ${colors.gold};
  opacity: 0.25;
  animation: ${orbitPulse} 2.5s ease-in-out infinite;
`

const EmptyTitle = styled.p`
  margin: 0 0 6px;
  font-size: 14px;
  font-weight: 700;
  color: ${colors.textPrimary};
`

const EmptyDesc = styled.p`
  margin: 0;
  font-size: 12px;
  color: ${colors.textSecondary};
  line-height: 1.45;
  max-width: 280px;
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
      <EmptyWrap>
        <Orbit aria-hidden>
          <OrbitRing />
          <OrbitDot />
        </Orbit>
        <EmptyTitle>No recent activity.</EmptyTitle>
        <EmptyDesc>Activities appear automatically when indexed.</EmptyDesc>
      </EmptyWrap>
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
