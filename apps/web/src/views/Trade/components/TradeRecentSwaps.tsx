import React from 'react'
import styled, { keyframes } from 'styled-components'
import { MOCK_RECENT_SWAPS, TRADE_MOCK_LABEL } from '../tradeMockData'
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

const MockCaption = styled.span`
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
  gap: 6px;
  color: ${tradeColors.muted};
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const RouteDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${tradeColors.gold};
  flex-shrink: 0;
`

type DisplaySwapRow = {
  id: string
  time: string
  pair: string
  direction: 'buy' | 'sell'
  amount: string
  received?: string
  route?: string
}

const toDisplayRows = (rows: TradeSwapRow[]): DisplaySwapRow[] => {
  if (rows.length >= 6) {
    return rows.slice(0, 6).map((r) => ({ ...r, route: undefined }))
  }
  const mock: DisplaySwapRow[] = MOCK_RECENT_SWAPS.map((m) => ({
    id: m.id,
    time: m.time,
    pair: m.pair,
    direction: m.type,
    amount: m.amount,
    received: m.received,
    route: m.route,
  }))
  if (rows.length === 0) return mock
  return [
    ...rows.map((r) => ({ ...r, route: undefined })),
    ...mock,
  ].slice(0, 6)
}

export interface TradeRecentSwapsProps {
  rows: TradeSwapRow[]
}

export const TradeRecentSwaps: React.FC<TradeRecentSwapsProps> = ({ rows }) => {
  const displayRows = toDisplayRows(rows)
  const showMockCaption = rows.length < 6

  return (
    <Shell data-trade-recent-swaps>
      <HeadRow>
        <Title>Recent Swaps on Melega DEX</Title>
        <HeadRight>
          {showMockCaption && <MockCaption>{TRADE_MOCK_LABEL}</MockCaption>}
          <ViewAll type="button">View All</ViewAll>
        </HeadRight>
      </HeadRow>
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
              <RouteDot aria-hidden />
              {row.route ?? '—'}
            </RouteCell>
          </Row>
        ))}
      </Table>
    </Shell>
  )
}

export default TradeRecentSwaps
