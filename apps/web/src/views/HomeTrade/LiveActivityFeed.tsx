import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { ActivityRow } from './useHomeTradeData'
import { ht } from './homeTradeTokens'

const Card = styled.div`
  background: ${ht.surface1};
  border: 1px solid ${ht.borderSoft};
  border-radius: 12px;
  padding: 16px;
  margin-top: 12px;
  min-height: 120px;

  @media (min-width: 1024px) {
    min-height: 170px;
  }
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`

const Title = styled.h2`
  margin: 0;
  font-family: ${ht.fontDisplay};
  font-size: 18px;
  font-weight: 600;
  color: ${ht.white};

  @media (min-width: 1024px) {
    font-size: 16px;
  }
`

const ViewLink = styled(Link)`
  font-size: 13px;
  color: ${ht.gold};
  text-decoration: none;
`

const Row = styled.div`
  display: grid;
  grid-template-columns: 24px 1fr auto auto;
  gap: 8px;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);

  &:last-child {
    border-bottom: none;
  }
`

const Icon = styled.span`
  color: ${ht.gold};
  font-size: 14px;
`

const Type = styled.span`
  font-size: 13px;
  color: ${ht.white};
  font-weight: 500;
`

const Context = styled.span`
  font-size: 13px;
  color: ${ht.textMuted};
`

const Value = styled.span`
  font-size: 13px;
  color: ${ht.green};
  text-align: right;
`

const Time = styled.span`
  font-size: 12px;
  color: ${ht.textMuted};
  text-align: right;
`

const Empty = styled.p`
  margin: 8px 0 0;
  font-size: 14px;
  color: ${ht.textMuted};
  line-height: 1.45;
`

const eventIcon = (type: string) => {
  if (type === 'Swap') return '↔'
  if (type.includes('Added')) return '💧'
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
      <Empty>No recent activity indexed for this network yet. Open Swap to trade.</Empty>
    ) : (
      rows.map((row) => (
        <Row key={row.id}>
          <Icon>{eventIcon(row.type)}</Icon>
          <div>
            <Type>{row.type}</Type>
            <Context> {row.context}</Context>
          </div>
          {row.value && <Value>{row.value}</Value>}
          {row.time ? <Time>{row.time}</Time> : <span />}
        </Row>
      ))
    )}
  </Card>
)

export default LiveActivityFeed
