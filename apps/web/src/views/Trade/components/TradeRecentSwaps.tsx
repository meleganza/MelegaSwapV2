import React from 'react'
import styled, { keyframes } from 'styled-components'
import { colors } from 'design-system/melega'
import type { TradeSwapRow } from '../useTradeTerminalData'

const slideIn = keyframes`
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
`

const Shell = styled.div`
  background: #0b0b0b;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 18px 20px;
  box-sizing: border-box;
`

const Title = styled.h3`
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 700;
  color: ${colors.textPrimary};
`

const Table = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`

const Head = styled.div`
  display: grid;
  grid-template-columns: 72px 88px 1fr 72px 56px;
  gap: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #707070;
`

const Row = styled.div`
  display: grid;
  grid-template-columns: 72px 88px 1fr 72px 56px;
  gap: 8px;
  align-items: center;
  min-height: 36px;
  font-size: 13px;
  animation: ${slideIn} 220ms ease;

  &:not(:last-child) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  }
`

const Cell = styled.span`
  color: #b3b3b3;
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
  text-transform: uppercase;
  color: ${({ $buy }) => ($buy ? colors.green : '#ef4444')};
`

const Empty = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  color: #8a8a8a;
  font-size: 14px;
`

export interface TradeRecentSwapsProps {
  rows: TradeSwapRow[]
}

export const TradeRecentSwaps: React.FC<TradeRecentSwapsProps> = ({ rows }) => (
  <Shell data-trade-recent-swaps>
    <Title>Recent Swaps</Title>
    {rows.length === 0 ? (
      <Empty>Indexing...</Empty>
    ) : (
      <Table>
        <Head>
          <span>Time</span>
          <span>Wallet</span>
          <span>Pair</span>
          <span>Amount</span>
          <span>Side</span>
        </Head>
        {rows.map((row) => (
          <Row key={row.id}>
            <Cell>{row.time}</Cell>
            <Cell>{row.wallet}</Cell>
            <PairCell>{row.pair}</PairCell>
            <Cell>{row.amount}</Cell>
            <Direction $buy={row.direction === 'buy'}>{row.direction}</Direction>
          </Row>
        ))}
      </Table>
    )}
  </Shell>
)

export default TradeRecentSwaps
