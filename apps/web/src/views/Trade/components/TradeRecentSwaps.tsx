import React from 'react'
import styled, { keyframes } from 'styled-components'
import { tradeColors, tradeLayout } from '../tradeTokens'
import type { TradeSwapRow } from '../useTradeTerminalData'

const slideIn = keyframes`
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
`

const Shell = styled.div`
  background: ${tradeColors.panel};
  border: 1px solid ${tradeColors.border};
  border-radius: 18px;
  padding: 14px;
  box-sizing: border-box;
  min-height: ${tradeLayout.recentSwapsHeight};
  overflow: hidden;
`

const HeadRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
`

const Title = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: #ffffff;
`

const ViewAll = styled.button`
  padding: 0;
  border: none;
  background: transparent;
  color: ${tradeColors.gold};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
`

const Table = styled.div`
  display: flex;
  flex-direction: column;
`

const Head = styled.div`
  display: grid;
  grid-template-columns: 70px 130px 70px 110px 130px 1fr;
  gap: 8px;
  padding-bottom: 6px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${tradeColors.muted};
`

const Row = styled.div`
  display: grid;
  grid-template-columns: 70px 130px 70px 110px 130px 1fr;
  gap: 8px;
  align-items: center;
  min-height: 34px;
  font-size: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  animation: ${slideIn} 220ms ease;
`

const Cell = styled.span`
  color: #b5b5b5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const PairCell = styled(Cell)`
  color: #ffffff;
  font-weight: 600;
`

const Direction = styled.span<{ $buy?: boolean }>`
  font-size: 12px;
  font-weight: 700;
  text-transform: capitalize;
  color: ${({ $buy }) => ($buy ? tradeColors.green : tradeColors.red)};
`

const RouteDots = styled.span`
  color: ${tradeColors.muted};
  letter-spacing: 2px;
`

const Empty = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  color: ${tradeColors.muted};
  font-size: 14px;
`

export interface TradeRecentSwapsProps {
  rows: TradeSwapRow[]
}

export const TradeRecentSwaps: React.FC<TradeRecentSwapsProps> = ({ rows }) => (
  <Shell data-trade-recent-swaps>
    <HeadRow>
      <Title>Recent Swaps on Melega DEX</Title>
      <ViewAll type="button">View All</ViewAll>
    </HeadRow>
    {rows.length === 0 ? (
      <Empty>Indexing recent swaps...</Empty>
    ) : (
      <Table>
        <Head>
          <span>Time</span>
          <span>Pair</span>
          <span>Type</span>
          <span>Amount</span>
          <span>Received</span>
          <span>Route</span>
        </Head>
        {rows.map((row) => (
          <Row key={row.id}>
            <Cell>{row.time}</Cell>
            <PairCell>{row.pair}</PairCell>
            <Direction $buy={row.direction === 'buy'}>{row.direction}</Direction>
            <Cell>{row.amount}</Cell>
            <Cell>{row.received ?? '—'}</Cell>
            <RouteDots>● ● ●</RouteDots>
          </Row>
        ))}
      </Table>
    )}
  </Shell>
)

export default TradeRecentSwaps
