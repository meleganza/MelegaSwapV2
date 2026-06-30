import React from 'react'
import Link from 'next/link'
import styled, { keyframes } from 'styled-components'
import { ActivityRow } from './useHomeTradeData'
import { ht } from './homeTradeTokens'

const rowIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`

const pulse = keyframes`
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.08); }
`

const Card = styled.div`
  background: ${ht.surface1};
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 18px;
  box-sizing: border-box;
  min-height: 160px;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`

const Title = styled.h2`
  margin: 0;
  font-family: ${ht.fontBody};
  font-size: 20px;
  font-weight: 700;
  color: ${ht.white};
  line-height: 1.2;
`

const ViewLink = styled(Link)`
  font-size: 13px;
  color: ${ht.gold};
  text-decoration: none;
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

const Row = styled.div`
  display: grid;
  grid-template-columns: 18px 1fr auto;
  gap: 10px;
  align-items: center;
  height: 30px;
  animation: ${rowIn} 400ms ease backwards;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const Icon = styled.span`
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${ht.gold};
  font-size: 12px;
  flex-shrink: 0;
  z-index: 1;
`

const EventCol = styled.div`
  min-width: 0;
`

const Event = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${ht.white};
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Context = styled.div`
  font-size: 12px;
  color: ${ht.textMuted};
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Time = styled.div`
  font-size: 12px;
  color: ${ht.textMuted};
  text-align: right;
  white-space: nowrap;
`

const EmptyWrap = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding-top: 4px;
`

const EmptyIcon = styled.span`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: ${ht.goldSoftBg};
  border: 1px solid rgba(212, 175, 55, 0.35);
  flex-shrink: 0;
  animation: ${pulse} 2.5s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const EmptyText = styled.div`
  font-size: 13px;
  color: ${ht.white};
  line-height: 1.4;
`

const EmptySub = styled.div`
  font-size: 12px;
  color: ${ht.textMuted};
  margin-top: 4px;
  line-height: 1.45;
`

const eventIcon = (type: string) => {
  if (type === 'Swap') return '↔'
  if (type.includes('Added')) return '+'
  if (type.includes('Removed')) return '−'
  return '●'
}

export const LiveActivityFeed: React.FC<{ rows: ActivityRow[] }> = ({ rows }) => (
  <Card>
    <Header>
      <Title>Live Activity</Title>
      <ViewLink href="/swap">View all →</ViewLink>
    </Header>
    {rows.length === 0 ? (
      <EmptyWrap>
        <EmptyIcon aria-hidden />
        <div>
          <EmptyText>No recent indexed activity yet.</EmptyText>
          <EmptySub>
            Swaps, listings, pools and farms will appear here as soon as they are indexed.
          </EmptySub>
        </div>
      </EmptyWrap>
    ) : (
      <Timeline>
        {rows.map((row, i) => (
          <Row key={row.id} style={{ animationDelay: `${i * 60}ms` }}>
            <Icon>{eventIcon(row.type)}</Icon>
            <EventCol>
              <Event>{row.type}</Event>
              {row.context && <Context>{row.context}</Context>}
            </EventCol>
            <Time>{row.time || row.value || ''}</Time>
          </Row>
        ))}
      </Timeline>
    )}
  </Card>
)

export default LiveActivityFeed
