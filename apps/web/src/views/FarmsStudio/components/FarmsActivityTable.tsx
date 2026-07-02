import React from 'react'
import styled from 'styled-components'
import { FARMS_ACTIVITY_ROWS } from '../farmsStudioData'
import { FARMS_STUDIO_PREVIEW_LABEL, farmsStudioColors, farmsStudioLayout } from '../farmsStudioTokens'
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
  padding: 0 12px;
  height: 32px;
  width: ${({ $w }) => $w || 'auto'};
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${farmsStudioColors.muted};
  border-bottom: 1px solid ${farmsStudioColors.rowBorder};
`

const Td = styled.td`
  height: ${farmsStudioLayout.activityRowHeight};
  padding: 0 12px;
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

const StatusBadge = styled.span<{ $indexed?: boolean }>`
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  border: 1px solid ${({ $indexed }) => ($indexed ? farmsStudioColors.green : farmsStudioColors.gold)};
  color: ${({ $indexed }) => ($indexed ? farmsStudioColors.green : farmsStudioColors.goldBright)};
  background: ${({ $indexed }) => ($indexed ? 'rgba(0, 230, 118, 0.08)' : farmsStudioColors.previewBadgeBg)};
`

export const FarmsActivityTable: React.FC = () => (
  <FsPanel
    data-fs-panel
    data-fs-activity
    $height={farmsStudioLayout.activityHeight}
    style={{ marginTop: farmsStudioLayout.activityMarginTop }}
  >
    <Head>
      <Title>Recent Farming Activity</Title>
      <FsPreviewBadge style={{ height: 20, padding: '0 8px', fontSize: 9 }}>
        {FARMS_STUDIO_PREVIEW_LABEL}
      </FsPreviewBadge>
    </Head>
    <TableWrap>
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
          {FARMS_ACTIVITY_ROWS.map((row) => (
            <tr key={`${row.time}-${row.pair}-${row.action}`}>
              <Td>{row.time}</Td>
              <Td>{row.pair}</Td>
              <Td>
                <Action $tone={row.actionTone}>{row.action}</Action>
              </Td>
              <Td>{row.amount}</Td>
              <Td>{row.rewards}</Td>
              <Td>
                <StatusBadge $indexed={row.status === 'indexed'}>
                  {row.status === 'indexed' ? 'Indexed' : 'Preview'}
                </StatusBadge>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableWrap>
  </FsPanel>
)

export default FarmsActivityTable
