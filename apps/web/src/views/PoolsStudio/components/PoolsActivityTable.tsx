import React from 'react'
import styled from 'styled-components'
import { POOLS_ACTIVITY } from '../poolsStudioData'
import { POOLS_ACTIVITY_PREVIEW_LABEL, poolsStudioColors, poolsStudioLayout } from '../poolsStudioTokens'
import { PsPanel, PsPreviewBadge } from './poolsStudioPrimitives'

const Wrap = styled(PsPanel)`
  padding: 0;
  overflow: hidden;
`

const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px 12px;
  border-bottom: 1px solid ${poolsStudioColors.rowBorder};
`

const Title = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: ${poolsStudioColors.text};
`

const ViewAll = styled.button`
  border: none;
  background: none;
  color: ${poolsStudioColors.gold};
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
`

const Table = styled.div`
  min-height: ${poolsStudioLayout.activityHeight};
`

const HeaderRow = styled.div`
  display: grid;
  grid-template-columns: 80px 1.2fr 0.9fr 1fr 1fr 100px;
  gap: 8px;
  padding: 0 18px;
  height: 36px;
  align-items: center;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${poolsStudioColors.muted};
  border-bottom: 1px solid ${poolsStudioColors.rowBorder};

  @media (max-width: 767px) {
    display: none;
  }
`

const Row = styled.div`
  display: grid;
  grid-template-columns: 80px 1.2fr 0.9fr 1fr 1fr 100px;
  gap: 8px;
  padding: 0 18px;
  height: ${poolsStudioLayout.activityRowHeight};
  align-items: center;
  text-align: center;
  font-size: 13px;
  border-bottom: 1px solid ${poolsStudioColors.rowBorder};

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 767px) {
    grid-template-columns: 1fr 1fr;
    height: auto;
    padding: 12px 18px;
    gap: 4px;
  }
`

const Action = styled.span<{ $tone?: string }>`
  font-weight: 700;
  color: ${({ $tone }) =>
    $tone === 'green'
      ? poolsStudioColors.green
      : $tone === 'gold'
        ? poolsStudioColors.gold
        : poolsStudioColors.secondary};
`

const StatusPill = styled.span<{ $status: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  min-width: 88px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  justify-self: center;
  border: 1px solid
    ${({ $status }) =>
      $status === 'completed'
        ? poolsStudioColors.green
        : $status === 'preview'
          ? poolsStudioColors.gold
          : 'rgba(255,255,255,0.16)'};
  color: ${({ $status }) =>
    $status === 'completed'
      ? poolsStudioColors.green
      : $status === 'preview'
        ? poolsStudioColors.gold
        : poolsStudioColors.muted};
  background: ${({ $status }) =>
    $status === 'completed'
      ? 'rgba(0,230,118,0.08)'
      : $status === 'preview'
        ? poolsStudioColors.previewBadgeBg
        : 'rgba(255,255,255,0.04)'};
`

export const PoolsActivityTable: React.FC = () => (
  <Wrap data-ps-activity $height="auto">
    <Head>
      <Title>Recent Pool Activity</Title>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <PsPreviewBadge style={{ height: 20, padding: '0 8px', fontSize: 9 }}>
          {POOLS_ACTIVITY_PREVIEW_LABEL}
        </PsPreviewBadge>
        <ViewAll type="button">View all activity</ViewAll>
      </div>
    </Head>
    <Table>
      <HeaderRow>
        <span>Time</span>
        <span>Pool</span>
        <span>Action</span>
        <span>Amount</span>
        <span>Reward</span>
        <span>Status</span>
      </HeaderRow>
      {POOLS_ACTIVITY.map((row) => (
        <Row key={`${row.time}-${row.pool}-${row.action}`}>
          <span style={{ color: poolsStudioColors.muted }}>{row.time}</span>
          <span style={{ fontWeight: 600 }}>{row.pool}</span>
          <Action $tone={row.actionTone}>{row.action}</Action>
          <span>{row.amount}</span>
          <span>{row.reward}</span>
          <StatusPill $status={row.status}>
            {row.status === 'completed' ? 'Completed' : row.status === 'preview' ? 'Preview' : 'Pending'}
          </StatusPill>
        </Row>
      ))}
    </Table>
  </Wrap>
)

export default PoolsActivityTable
