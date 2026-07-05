import React from 'react'
import styled from 'styled-components'
import { PremiumActivityTimeline } from 'design-system/melega/components/PremiumActivityTimeline/PremiumActivityTimeline'
import { tradeLayout } from '../tradeTokens'
import type { TradeSwapRow } from '../useTradeTerminalData'

const HeadRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 4px;
`

const ViewAll = styled.button`
  padding: 0;
  border: none;
  background: transparent;
  color: #d4af37;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
`

export interface TradeRecentSwapsProps {
  rows: TradeSwapRow[]
  isIndexing?: boolean
}

export const TradeRecentSwaps: React.FC<TradeRecentSwapsProps> = ({ rows, isIndexing }) => {
  const displayRows = rows.slice(0, 6)

  const timelineRows = displayRows.map((row) => ({
    id: row.id,
    title: `${row.direction === 'buy' ? 'Buy' : 'Sell'} ${row.pair}`,
    subtitle: `${row.amount} → ${row.received ?? '—'} · ${row.route ?? 'Melega route'}`,
    status: row.direction === 'buy' ? 'Buy' : 'Sell',
    time: row.time,
    statusTone: (row.direction === 'buy' ? 'green' : 'muted') as 'green' | 'muted',
  }))

  return (
    <div data-trade-recent-swaps>
      <HeadRow>
        <ViewAll type="button">View All</ViewAll>
      </HeadRow>
      <PremiumActivityTimeline
        title="Recent Swaps on Melega DEX"
        rows={timelineRows}
        height={tradeLayout.recentSwapsHeight}
        emptyTitle={isIndexing ? 'Awaiting indexing' : 'No activity yet'}
        emptySubtitle={
          isIndexing
            ? 'Fetching indexed swap activity for this pair'
            : 'Swap history appears when Melega subgraph indexes trades'
        }
        data-testid="trade"
      />
    </div>
  )
}

export default TradeRecentSwaps
