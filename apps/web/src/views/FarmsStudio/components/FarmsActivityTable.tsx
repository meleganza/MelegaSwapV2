import React from 'react'
import styled from 'styled-components'
import { PremiumActivityTimeline } from 'design-system/melega/components/PremiumActivityTimeline/PremiumActivityTimeline'
import { FARMS_ACTIVITY_PREVIEW_LABEL, farmsStudioColors, farmsStudioLayout } from '../farmsStudioTokens'
import { useFarmsRuntime } from '../farmsRuntime/FarmsRuntimeContext'
import { FsPreviewBadge } from './farmsStudioPrimitives'

const LiveBadge = styled(FsPreviewBadge)`
  border-color: ${farmsStudioColors.green};
  color: ${farmsStudioColors.green};
  background: rgba(27, 231, 122, 0.08);
  height: 20px;
  padding: 0 8px;
  font-size: 9px;
`

export const FarmsActivityTable: React.FC = () => {
  const { terminal, loadingLabel, account } = useFarmsRuntime()
  const rows = terminal.activityRows

  const timelineRows = rows.map((row) => ({
    id: `${row.time}-${row.pair}-${row.action}-${row.hash ?? ''}`,
    title: row.action,
    subtitle: `${row.pair} · ${row.amount} · ${row.rewards}`,
    status: row.status === 'indexed' ? 'Indexed' : 'Pending',
    time: row.time,
    statusTone: (row.status === 'indexed' ? 'green' : 'gold') as 'green' | 'gold',
  }))

  return (
    <div data-fs-activity style={{ marginTop: farmsStudioLayout.activityMarginTop }}>
      <PremiumActivityTimeline
        title="Recent Farming Activity"
        rows={timelineRows}
        height={farmsStudioLayout.activityHeight}
        emptyTitle={
          loadingLabel
            ? loadingLabel
            : !account
              ? 'Connect wallet'
              : 'No activity yet'
        }
        emptySubtitle={
          loadingLabel
            ? 'Awaiting runtime'
            : !account
              ? 'Connect wallet to view farming activity'
              : 'No recent farm transactions indexed'
        }
        badge={<LiveBadge>{FARMS_ACTIVITY_PREVIEW_LABEL}</LiveBadge>}
        data-testid="farms"
      />
    </div>
  )
}

export default FarmsActivityTable
