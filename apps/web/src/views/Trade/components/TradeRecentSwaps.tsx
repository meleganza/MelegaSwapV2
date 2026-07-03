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
  padding: 16px;
  box-sizing: border-box;
  min-height: ${tradeLayout.recentSwapsHeight};
  overflow: hidden;
`

const HeadRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
`

const Title = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  color: #ffffff;
`

const HeadRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const IndexingLabel = styled.span`
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${tradeColors.muted};
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
  gap: 10px;
  padding-bottom: 8px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${tradeColors.muted};
`

const Row = styled.div`
  display: grid;
  grid-template-columns: 70px 130px 70px 110px 130px 1fr;
  gap: 10px;
  align-items: center;
  min-height: 36px;
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
  text-transform: uppercase;
  color: ${({ $buy }) => ($buy ? tradeColors.green : tradeColors.red)};
`

const RouteCell = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: ${tradeColors.muted};
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const RouteIcon = styled.span`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(212, 175, 55, 0.12);
  border: 1px solid rgba(212, 175, 55, 0.28);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &::after {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${tradeColors.gold};
  }
`

const EmptyState = styled.p`
  margin: 0;
  padding: 12px 0;
  font-size: 13px;
  color: ${tradeColors.muted};
`

export interface TradeRecentSwapsProps {
  rows: TradeSwapRow[]
  isIndexing?: boolean
}

export const TradeRecentSwaps: React.FC<TradeRecentSwapsProps> = ({ rows, isIndexing }) => {
  const displayRows = rows.slice(0, 6)

  return (
    <Shell data-trade-recent-swaps>
      <HeadRow>
        <Title>Recent Swaps on Melega DEX</Title>
        <HeadRight>
          {isIndexing && <IndexingLabel>Indexing</IndexingLabel>}
          <ViewAll type="button">View All</ViewAll>
        </HeadRight>
      </HeadRow>
      {displayRows.length === 0 ? (
        <EmptyState>
          {isIndexing ? 'Indexing Melega DEX swap activity…' : 'No recent swaps for this pair yet.'}
        </EmptyState>
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
          {displayRows.map((row) => (
            <Row key={row.id}>
              <Cell>{row.time}</Cell>
              <PairCell>{row.pair}</PairCell>
              <Direction $buy={row.direction === 'buy'}>{row.direction}</Direction>
              <Cell>{row.amount}</Cell>
              <Cell>{row.received ?? '—'}</Cell>
              <RouteCell title={row.route}>
                <RouteIcon aria-hidden />
                {row.route ?? '—'}
              </RouteCell>
            </Row>
          ))}
        </Table>
      )}
    </Shell>
  )
}

export default TradeRecentSwaps
