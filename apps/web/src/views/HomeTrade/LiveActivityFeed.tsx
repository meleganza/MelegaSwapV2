import React from 'react'
import Link from 'next/link'
import styled, { keyframes } from 'styled-components'
import { colors } from 'design-system/melega'
import { ActivityRow } from './useHomeTradeData'

const Shell = styled.section`
  background: #0a0a0a;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 16px 20px;
  box-sizing: border-box;
  height: 160px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  flex-shrink: 0;
`

const Title = styled.h2`
  margin: 0;
  font-size: 16px;
  font-weight: 800;
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
  justify-content: center;
`

const Timeline = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`

const Row = styled.div`
  display: grid;
  grid-template-columns: 16px 1fr auto;
  gap: 10px;
  align-items: center;
  height: 28px;
`

const RowIcon = styled.span`
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: ${colors.gold};
`

const RowTitle = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const RowMeta = styled.span`
  font-size: 12px;
  color: #9e9e9e;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const RowTime = styled.span`
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
`

const pulseDot = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.4; }
  50% { transform: scale(1.5); opacity: 0.08; }
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
  font-size: 13px;
  font-weight: 600;
  color: ${colors.textPrimary};
`

const EmptyDesc = styled.p`
  margin: 0;
  font-size: 12px;
  color: #9e9e9e;
  line-height: 1.45;
  max-width: 300px;
`

const eventIcon = (type: string) => {
  if (type === 'Swap') return '↔'
  if (type.includes('Added')) return '+'
  if (type.includes('Removed')) return '−'
  return '●'
}

export const LiveActivityFeed: React.FC<{ rows: ActivityRow[] }> = ({ rows }) => {
  const displayRows = rows.slice(0, 5)

  return (
    <Shell data-live-activity-feed>
      <Header>
        <Title>Live Activity</Title>
        <SectionLink href="/swap">View all →</SectionLink>
      </Header>
      <Body>
        {displayRows.length === 0 ? (
          <EmptyWrap>
            <PulseDot aria-hidden />
            <EmptyTitle>Waiting for the next on-chain event...</EmptyTitle>
            <EmptyDesc>Swaps, listings, pools and farms appear here automatically.</EmptyDesc>
          </EmptyWrap>
        ) : (
          <Timeline>
            {displayRows.map((row) => (
              <Row key={row.id}>
                <RowIcon>{eventIcon(row.type)}</RowIcon>
                <div style={{ minWidth: 0 }}>
                  <RowTitle>{row.type}</RowTitle>
                  {row.context && <RowMeta>{row.context}</RowMeta>}
                </div>
                <RowTime>{row.time || row.value || ''}</RowTime>
              </Row>
            ))}
          </Timeline>
        )}
      </Body>
    </Shell>
  )
}

export default LiveActivityFeed
