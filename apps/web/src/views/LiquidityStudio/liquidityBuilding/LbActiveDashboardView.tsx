import React from 'react'
import styled from 'styled-components'
import { liquidityStudioColors } from '../liquidityStudioTokens'
import { LsSectionTitle } from '../components/liquidityStudioPrimitives'
import type { ProgramStatus } from './programStatus'
import {
  LB_UX,
  type LbActivityItem,
  type ProgramMetrics,
  translateActivityReason,
} from './uxCopy'

const Lead = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: ${liquidityStudioColors.text};
  font-weight: 700;
`

const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 10px;
`

const MetricCell = styled.div`
  padding: 10px;
  border-radius: 10px;
  border: 1px solid ${liquidityStudioColors.border};
  background: rgba(0, 0, 0, 0.18);
`

const MetricLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: ${liquidityStudioColors.muted};
  margin-bottom: 4px;
`

const MetricValue = styled.div`
  font-size: 13px;
  font-weight: 800;
  color: ${liquidityStudioColors.text};
`

const Notice = styled.div`
  padding: 12px;
  border-radius: 12px;
  border: 1px solid ${liquidityStudioColors.border};
  background: rgba(0, 0, 0, 0.22);
  font-size: 12px;
  line-height: 1.5;
  color: ${liquidityStudioColors.muted};
`

const ActivityList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const ActivityItem = styled.li`
  padding: 10px;
  border-radius: 10px;
  border: 1px solid ${liquidityStudioColors.border};
  background: rgba(0, 0, 0, 0.16);
  font-size: 12px;
  color: ${liquidityStudioColors.text};
`

/** Presentational — real metrics only; null → Unavailable / None yet. */
export function LbActiveDashboardView({
  status,
  metrics,
  activity,
}: {
  status: ProgramStatus
  metrics: ProgramMetrics
  activity: LbActivityItem[]
}) {
  const fmt = (v: string | null, empty = LB_UX.metricUnavailable) => v ?? empty
  return (
    <div data-testid="lb-active-dashboard" data-status={status}>
      <Lead>{LB_UX.activeHero}</Lead>
      <MetricGrid>
        <MetricCell>
          <MetricLabel>{LB_UX.metricLiquidityBuilt}</MetricLabel>
          <MetricValue data-testid="lb-metric-liquidity">{fmt(metrics.liquidityBuiltLabel)}</MetricValue>
        </MetricCell>
        <MetricCell>
          <MetricLabel>{LB_UX.metricBudgetRemaining}</MetricLabel>
          <MetricValue data-testid="lb-metric-budget">{fmt(metrics.budgetRemainingLabel)}</MetricValue>
        </MetricCell>
        <MetricCell>
          <MetricLabel>{LB_UX.metricExecutions}</MetricLabel>
          <MetricValue data-testid="lb-metric-executions">
            {metrics.executionCount == null ? LB_UX.metricNoneYet : String(metrics.executionCount)}
          </MetricValue>
        </MetricCell>
        <MetricCell>
          <MetricLabel>{LB_UX.metricLpPosition}</MetricLabel>
          <MetricValue data-testid="lb-metric-lp">
            {fmt(metrics.lpPositionLabel, LB_UX.lpOwnedByOwner)}
          </MetricValue>
        </MetricCell>
      </MetricGrid>
      <div style={{ marginTop: 12 }}>
        <LsSectionTitle style={{ margin: '0 0 8px', fontSize: 14 }}>{LB_UX.activityTitle}</LsSectionTitle>
        {activity.length === 0 ? (
          <Notice data-testid="lb-activity-empty">{LB_UX.emptyNoProgram}</Notice>
        ) : (
          <ActivityList data-testid="lb-activity-list">
            {activity.map((item) => (
              <ActivityItem key={item.id}>
                <strong>{item.title}</strong>
                {item.kind === 'EXECUTION_COMPLETED' ? (
                  <div>
                    Token sold: {item.tokenSold ?? '—'}
                    <br />
                    Quote acquired: {item.quoteAcquired ?? '—'}
                    <br />
                    Liquidity added: {item.liquidityAdded ?? '—'}
                  </div>
                ) : (
                  <div>Reason: {item.reason || translateActivityReason(item.detail)}</div>
                )}
              </ActivityItem>
            ))}
          </ActivityList>
        )}
      </div>
    </div>
  )
}
