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
  min-height: 130px;
  box-sizing: border-box;

  @media (min-width: 1024px) {
    min-height: 170px;
  }
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
`

const Title = styled.h2`
  margin: 0;
  font-family: ${ht.fontDisplay};
  font-size: 18px;
  font-weight: 700;
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
  grid-template-columns: 20px 1fr auto;
  gap: 8px;
  align-items: center;
  padding: 4px 0;
  min-height: 28px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);

  &:last-child {
    border-bottom: none;
  }
`

const Icon = styled.span`
  color: ${ht.gold};
  font-size: 13px;
`

const TypeLine = styled.div`
  font-size: 13px;
  color: ${ht.white};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Context = styled.span`
  color: ${ht.textMuted};
  font-weight: 400;
`

const MetaCol = styled.div`
  text-align: right;
  flex-shrink: 0;
`

const Value = styled.div`
  font-size: 12px;
  color: ${ht.green};
`

const Time = styled.div`
  font-size: 11px;
  color: ${ht.textMuted};
`

const Empty = styled.p`
  margin: 4px 0 0;
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
          <TypeLine>
            {row.type}
            <Context> · {row.context}</Context>
          </TypeLine>
          <MetaCol>
            {row.value && <Value>{row.value}</Value>}
            {row.time && <Time>{row.time}</Time>}
          </MetaCol>
        </Row>
      ))
    )}
  </Card>
)

export default LiveActivityFeed
