import React from 'react'
import styled from 'styled-components'
import { PremiumActivityTimeline } from 'design-system/melega/components/PremiumActivityTimeline/PremiumActivityTimeline'
import { poolsStudioColors, poolsStudioLayout } from '../poolsStudioTokens'
import { usePoolsRuntime } from '../poolsRuntime/PoolsRuntimeContext'

const LiveBadge = styled.span`
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 8px;
  border-radius: 999px;
  border: 1px solid ${poolsStudioColors.green};
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${poolsStudioColors.green};
  background: rgba(27, 231, 122, 0.08);
`

export const PoolsActivityTable: React.FC = () => {
  const { terminal, loadingLabel } = usePoolsRuntime()
  const rows = terminal.activityRows.slice(0, 5)

  const timelineRows = rows.map((row) => ({
    id: `${row.time}-${row.pool}-${row.action}`,
    title: row.action,
    subtitle: `${row.pool} · ${row.amount} · ${row.reward}`,
    status: row.status === 'completed' ? 'Completed' : row.status === 'preview' ? 'Preview' : 'Pending',
    time: row.time,
    statusTone: (row.status === 'completed' ? 'green' : row.status === 'preview' ? 'gold' : 'muted') as
      | 'green'
      | 'gold'
      | 'muted',
  }))

  return (
    <div data-ps-activity>
      <PremiumActivityTimeline
        title="Recent Pool Activity"
        rows={timelineRows}
        height={poolsStudioLayout.activityHeight}
        emptyTitle={loadingLabel ? loadingLabel : 'No activity yet.'}
        emptySubtitle={loadingLabel ? 'Awaiting runtime' : 'Connect wallet to see your staking activity.'}
        badge={<LiveBadge>LIVE</LiveBadge>}
        data-testid="pools"
      />
    </div>
  )
}

export default PoolsActivityTable
