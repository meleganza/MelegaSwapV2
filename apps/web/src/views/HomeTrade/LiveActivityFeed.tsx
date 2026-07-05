import React from 'react'
import Link from 'next/link'
import styled, { keyframes } from 'styled-components'
import { colors } from 'design-system/melega'
import type { ActivityRow, ActivitySlot } from './useHomeTradeData'

const Shell = styled.section`
  background: #0b0b0b;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 22px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 180px;

  @media (max-width: 767px) {
    min-height: 160px;
  }
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  flex-shrink: 0;
`

const Title = styled.h2`
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: ${colors.textPrimary};
`

const SectionLink = styled(Link)`
  color: ${colors.gold};
  text-decoration: none;
  font-size: 13px;

  &:hover {
    text-decoration: underline;
  }
`

const Body = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
`

const SlotList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const Slot = styled.div<{ $filled?: boolean }>`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px 12px;
  align-items: center;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid ${({ $filled }) => ($filled ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.05)')};
  background: ${({ $filled }) => ($filled ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.015)')};
`

const SlotLabel = styled.span`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #8a8a8a;
  grid-column: 1 / -1;
`

const SlotTitle = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const SlotMeta = styled.span`
  font-size: 12px;
  color: #9e9e9e;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const SlotTime = styled.span`
  font-size: 12px;
  color: #707070;
  white-space: nowrap;
  text-align: right;
`

const EmptyWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  flex: 1;
  padding: 8px 0;
`

const pulseDot = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.35; }
  50% { transform: scale(1.45); opacity: 0.08; }
`

const PulseDot = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(212, 175, 55, 0.4);
  margin-bottom: 10px;
  animation: ${pulseDot} 2.4s ease-in-out infinite;
`

const EmptyTitle = styled.p`
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 700;
  color: ${colors.textPrimary};
`

const EmptyDesc = styled.p`
  margin: 0;
  font-size: 13px;
  color: #9e9e9e;
  line-height: 1.45;
  max-width: 300px;
`

export interface LiveActivityFeedProps {
  rows?: ActivityRow[]
  slots?: ActivitySlot[]
  isIndexing?: boolean
}

export const LiveActivityFeed: React.FC<LiveActivityFeedProps> = ({
  rows = [],
  slots = [],
  isIndexing = false,
}) => {
  const displaySlots = slots.length > 0 ? slots : []
  const hasAnyActivity = displaySlots.some((s) => s.row) || rows.length > 0
  const slotEmptyCopy = isIndexing ? 'Waiting for indexing' : 'No recent activity yet'

  return (
    <Shell data-live-activity-feed>
      <Header>
        <Title>Live Activity</Title>
        <SectionLink href="/trade">View all →</SectionLink>
      </Header>
      <Body>
        {displaySlots.length > 0 ? (
          <SlotList>
            {displaySlots.map((slot) => (
              <Slot key={slot.id} $filled={Boolean(slot.row)}>
                <SlotLabel>{slot.label}</SlotLabel>
                {slot.row ? (
                  <>
                    <div style={{ minWidth: 0 }}>
                      <SlotTitle>{slot.row.type}</SlotTitle>
                      {slot.row.context ? <SlotMeta>{slot.row.context}</SlotMeta> : null}
                    </div>
                    <SlotTime>{slot.row.time || slot.row.value || ''}</SlotTime>
                  </>
                ) : (
                  <SlotMeta style={{ gridColumn: '1 / -1' }}>{slotEmptyCopy}</SlotMeta>
                )}
              </Slot>
            ))}
          </SlotList>
        ) : hasAnyActivity ? (
          <SlotList>
            {rows.slice(0, 5).map((row) => (
              <Slot key={row.id} $filled>
                <div style={{ minWidth: 0 }}>
                  <SlotTitle>{row.type}</SlotTitle>
                  {row.context ? <SlotMeta>{row.context}</SlotMeta> : null}
                </div>
                <SlotTime>{row.time || row.value || ''}</SlotTime>
              </Slot>
            ))}
          </SlotList>
        ) : (
          <EmptyWrap>
            <PulseDot aria-hidden />
            <EmptyTitle>{isIndexing ? 'Indexing activity' : 'No recent protocol activity yet'}</EmptyTitle>
            <EmptyDesc>
              {isIndexing
                ? 'Pulling latest swaps, liquidity, and ecosystem events from Melega indexers.'
                : 'Swaps, liquidity, farms, pools, and listings appear here when indexed.'}
            </EmptyDesc>
          </EmptyWrap>
        )}
      </Body>
    </Shell>
  )
}

export default LiveActivityFeed
