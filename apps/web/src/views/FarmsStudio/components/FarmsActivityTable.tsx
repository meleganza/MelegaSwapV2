import React from 'react'
import styled from 'styled-components'
import { FARMS_ACTIVITY_PREVIEW_LABEL, farmsStudioColors, farmsStudioLayout } from '../farmsStudioTokens'
import { useFarmsRuntime } from '../farmsRuntime/FarmsRuntimeContext'
import { FsPanel, FsPreviewBadge } from './farmsStudioPrimitives'

const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
`

const Title = styled.h3`
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  line-height: 1;
  color: ${farmsStudioColors.text};
`

const TableWrap = styled.div`
  overflow-x: auto;
  min-width: 0;
  -webkit-overflow-scrolling: touch;
`

const Table = styled.table`
  width: 100%;
  min-width: 640px;
  border-collapse: collapse;
  table-layout: fixed;
`

const Th = styled.th<{ $w?: string }>`
  text-align: left;
  padding: 0 ${farmsStudioLayout.activityCellPadding};
  height: 32px;
  width: ${({ $w }) => $w || 'auto'};
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${farmsStudioColors.muted};
  border-bottom: 1px solid ${farmsStudioColors.rowBorder};
`

const Td = styled.td`
  height: ${farmsStudioLayout.activityRowHeight};
  padding: 0 ${farmsStudioLayout.activityCellPadding};
  font-size: 12px;
  font-weight: 500;
  color: ${farmsStudioColors.text};
  border-bottom: 1px solid ${farmsStudioColors.rowBorder};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;
`

const Action = styled.span<{ $tone?: 'green' | 'gold' | 'muted' }>`
  font-weight: 700;
  color: ${({ $tone }) =>
    $tone === 'green'
      ? farmsStudioColors.green
      : $tone === 'gold'
        ? farmsStudioColors.goldBright
        : farmsStudioColors.muted};
`

const StatusBadge = styled.span<{ $tone?: 'indexed' | 'preview' | 'gray' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  border: 1px solid
    ${({ $tone }) =>
      $tone === 'indexed'
        ? farmsStudioColors.green
        : $tone === 'gray'
          ? farmsStudioColors.border
          : farmsStudioColors.gold};
  color: ${({ $tone }) =>
    $tone === 'indexed'
      ? farmsStudioColors.green
      : $tone === 'gray'
        ? farmsStudioColors.muted
        : farmsStudioColors.goldBright};
  background: ${({ $tone }) =>
    $tone === 'indexed'
      ? 'rgba(0, 230, 118, 0.08)'
      : $tone === 'gray'
        ? 'rgba(255, 255, 255, 0.04)'
        : farmsStudioColors.previewBadgeBg};
`

const Empty = styled.p`
  margin: 0;
  padding: 18px;
  font-size: 13px;
  color: ${farmsStudioColors.muted};
`

const LiveBadge = styled(FsPreviewBadge)`
  border-color: ${farmsStudioColors.green};
  color: ${farmsStudioColors.green};
  background: rgba(0, 230, 118, 0.08);
`

export const FarmsActivityTable: React.FC = () => {
  const { terminal, loadingLabel, account } = useFarmsRuntime()
  const rows = terminal.activityRows

  return (
    <FsPanel
      data-fs-panel
      data-fs-activity
      $height={farmsStudioLayout.activityHeight}
      style={{ marginTop: farmsStudioLayout.activityMarginTop }}
    >
      <Head>
        <Title>Recent Farming Activity</Title>
        <LiveBadge style={{ height: 20, padding: '0 8px', fontSize: 9 }}>
          {FARMS_ACTIVITY_PREVIEW_LABEL}
        </LiveBadge>
      </Head>
      <TableWrap>
        {loadingLabel ? (
          <Empty>{loadingLabel}</Empty>
        ) : !account ? (
          <Empty>Connect wallet to view farming activity.</Empty>
        ) : rows.length === 0 ? (
          <Empty>No recent farm transactions.</Empty>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th $w="14%">Time</Th>
                <Th $w="20%">Pair</Th>
                <Th $w="18%">Action</Th>
                <Th $w="18%">Amount</Th>
                <Th $w="18%">Rewards</Th>
                <Th $w="12%">Status</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={`${row.time}-${row.pair}-${row.action}-${row.hash ?? ''}`}>
                  <Td>{row.time}</Td>
                  <Td>{row.pair}</Td>
                  <Td>
                    <Action $tone={row.actionTone}>{row.action}</Action>
                  </Td>
                  <Td>{row.amount}</Td>
                  <Td>{row.rewards}</Td>
                  <Td>
                    <StatusBadge
                      $tone={
                        row.status === 'indexed'
                          ? 'indexed'
                          : row.action === 'New Farm'
                            ? 'gray'
                            : 'preview'
                      }
                    >
                      {row.status === 'indexed' ? 'Indexed' : 'Pending'}
                    </StatusBadge>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </TableWrap>
    </FsPanel>
  )
}

export default FarmsActivityTable
