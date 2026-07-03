import React from 'react'
import styled from 'styled-components'
import { poolsStudioColors, poolsStudioLayout } from '../poolsStudioTokens'
import { usePoolsRuntime } from '../poolsRuntime/PoolsRuntimeContext'
import { PsPanel } from './poolsStudioPrimitives'

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
  background: rgba(0, 230, 118, 0.08);
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

const EmptyRow = styled.div`
  padding: 20px 18px;
  font-size: 13px;
  color: ${poolsStudioColors.muted};
  text-align: center;
`

export const PoolsActivityTable: React.FC = () => {
  const { terminal, loadingLabel } = usePoolsRuntime()
  const rows = terminal.activityRows.slice(0, 5)

  return (
    <Wrap data-ps-activity $height="auto">
      <Head>
        <Title>Recent Pool Activity</Title>
        <LiveBadge>LIVE</LiveBadge>
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
        {loadingLabel ? (
          <EmptyRow>{loadingLabel}</EmptyRow>
        ) : rows.length === 0 ? (
          <EmptyRow>Connect wallet to see your staking activity.</EmptyRow>
        ) : (
          rows.map((row) => (
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
          ))
        )}
      </Table>
    </Wrap>
  )
}

export default PoolsActivityTable
