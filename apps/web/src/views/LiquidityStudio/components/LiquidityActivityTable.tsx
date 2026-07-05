import React from 'react'
import styled from 'styled-components'
import { PremiumActivityTimeline } from 'design-system/melega/components/PremiumActivityTimeline/PremiumActivityTimeline'
import { liquidityStudioColors, liquidityStudioLayout } from '../liquidityStudioTokens'
import { useLiquidityRuntime } from '../liquidityRuntime/LiquidityRuntimeContext'

const LiveBadge = styled.span`
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 8px;
  border-radius: 999px;
  border: 1px solid ${liquidityStudioColors.green};
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${liquidityStudioColors.green};
  background: rgba(27, 231, 122, 0.08);
`

export const LiquidityActivityTable: React.FC = () => {
  const { terminal, loadingLabel } = useLiquidityRuntime()
  const { activityRows, isIndexing } = terminal
  const rows = activityRows.slice(0, 5)

  const timelineRows = rows.map((row) => ({
    id: row.id,
    title: `${row.action} liquidity`,
    subtitle: `${row.pair} · ${row.amount} · ${row.lp}`,
    status: row.status,
    time: row.time,
    statusTone: (row.tone === 'green' ? 'green' : row.tone === 'red' ? 'muted' : 'gold') as 'green' | 'gold' | 'muted',
  }))

  return (
    <div data-ls-activity>
      <PremiumActivityTimeline
        title="Liquidity Activity"
        rows={timelineRows}
        height={liquidityStudioLayout.activityHeight}
        emptyTitle={loadingLabel || isIndexing ? 'Indexing liquidity' : 'No liquidity activity'}
        emptySubtitle={
          loadingLabel || isIndexing
            ? 'Fetching indexed mint and burn events'
            : 'No recent liquidity events indexed for this pair'
        }
        badge={<LiveBadge>LIVE</LiveBadge>}
        data-testid="liquidity"
      />
    </div>
  )
}

export default LiquidityActivityTable
