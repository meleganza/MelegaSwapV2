import React from 'react'
import Link from 'next/link'
import styled, { keyframes } from 'styled-components'
import { ActivityRow } from './useHomeTradeData'
import { ht } from './homeTradeTokens'

const rowIn = keyframes`
  from { opacity: 0; transform: translateY(3px); }
  to { opacity: 1; transform: translateY(0); }
`

const Card = styled.div`
  background: ${ht.surface1};
  border: 1px solid ${ht.borderSoft};
  border-radius: 12px;
  padding: 14px 16px;
  box-sizing: border-box;
  transition: box-shadow 200ms ease;

  &:hover {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  }

  @media (min-width: 1024px) {
    min-height: 160px;
  }
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`

const Title = styled.h2`
  margin: 0;
  font-family: ${ht.fontDisplay};
  font-size: 18px;
  font-weight: 700;
  color: ${ht.white};
  line-height: 1.2;
`

const ViewLink = styled(Link)`
  font-size: 12px;
  color: ${ht.gold};
  text-decoration: none;
`

const Timeline = styled.div`
  display: flex;
  flex-direction: column;
`

const Row = styled.div`
  display: grid;
  grid-template-columns: 22px 1fr auto;
  gap: 10px;
  align-items: start;
  min-height: 32px;
  padding: 6px 0;
  border-bottom: 1px solid rgba(212, 175, 55, 0.12);
  animation: ${rowIn} 400ms ease backwards;

  &:last-child {
    border-bottom: none;
  }

  &:nth-child(1) { animation-delay: 0ms; }
  &:nth-child(2) { animation-delay: 60ms; }
  &:nth-child(3) { animation-delay: 120ms; }
  &:nth-child(4) { animation-delay: 180ms; }
`

const Icon = styled.span`
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: ${ht.goldSoftBg};
  color: ${ht.gold};
  font-size: 11px;
  flex-shrink: 0;
`

const EventCol = styled.div`
  min-width: 0;
`

const Event = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${ht.white};
  line-height: 1.3;
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
  padding-top: 2px;
`

const Empty = styled.p`
  margin: 4px 0 0;
  font-size: 14px;
  color: ${ht.textMuted};
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
      <Empty>No recent activity indexed for this network yet.</Empty>
    ) : (
      <Timeline>
        {rows.map((row) => (
          <Row key={row.id}>
            <Icon>{eventIcon(row.type)}</Icon>
            <EventCol>
              <Event>{row.type}</Event>
              <Context>{row.context}</Context>
            </EventCol>
            <Time>{row.time || row.value || ''}</Time>
          </Row>
        ))}
      </Timeline>
    )}
  </Card>
)

export default LiveActivityFeed
