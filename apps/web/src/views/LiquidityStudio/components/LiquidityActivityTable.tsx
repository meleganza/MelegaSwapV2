import React from 'react'
import styled from 'styled-components'
import { liquidityStudioColors, liquidityStudioLayout } from '../liquidityStudioTokens'
import { useLiquidityRuntime } from '../liquidityRuntime/LiquidityRuntimeContext'
import { LsPanel } from './liquidityStudioPrimitives'

const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
`

const Title = styled.h3`
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  line-height: 1;
  color: ${liquidityStudioColors.text};
`

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
  background: rgba(0, 230, 118, 0.08);
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
`

const Th = styled.th<{ $w?: string }>`
  text-align: left;
  padding: 0 ${liquidityStudioLayout.activityCellPadding};
  height: ${liquidityStudioLayout.activityHeaderHeight};
  width: ${({ $w }) => $w || 'auto'};
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${liquidityStudioColors.muted};
  border-bottom: 1px solid ${liquidityStudioColors.rowBorder};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Td = styled.td`
  height: ${liquidityStudioLayout.activityRowHeight};
  padding: 0 ${liquidityStudioLayout.activityCellPadding};
  font-size: 12px;
  font-weight: 500;
  color: ${liquidityStudioColors.text};
  border-bottom: 1px solid ${liquidityStudioColors.rowBorder};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;
`

const ActionAdd = styled.span`
  color: ${liquidityStudioColors.green};
  font-weight: 700;
`

const ActionRemove = styled.span`
  color: ${liquidityStudioColors.red};
  font-weight: 700;
`

const StatusBadge = styled.span<{ $tone?: 'green' | 'yellow' | 'red' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid
    ${({ $tone }) =>
      $tone === 'green'
        ? liquidityStudioColors.green
        : $tone === 'red'
          ? liquidityStudioColors.red
          : liquidityStudioColors.gold};
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${({ $tone }) =>
    $tone === 'green'
      ? liquidityStudioColors.green
      : $tone === 'red'
        ? liquidityStudioColors.red
        : liquidityStudioColors.goldBright};
  background: ${({ $tone }) =>
    $tone === 'green'
      ? 'rgba(0, 230, 118, 0.08)'
      : $tone === 'red'
        ? 'rgba(255, 77, 77, 0.08)'
        : liquidityStudioColors.previewBadgeBg};
`

const EmptyRow = styled.td`
  height: ${liquidityStudioLayout.activityRowHeight};
  padding: 0 ${liquidityStudioLayout.activityCellPadding};
  font-size: 12px;
  color: ${liquidityStudioColors.muted};
  border-bottom: 1px solid ${liquidityStudioColors.rowBorder};
`

export const LiquidityActivityTable: React.FC = () => {
  const { terminal, loadingLabel } = useLiquidityRuntime()
  const { activityRows, isIndexing } = terminal
  const rows = activityRows.slice(0, 3)

  return (
    <LsPanel
      data-ls-panel
      data-ls-activity
      $height={liquidityStudioLayout.activityHeight}
      $width="100%"
    >
      <Head>
        <Title>Liquidity Activity</Title>
        <LiveBadge>LIVE</LiveBadge>
      </Head>
      <Table>
        <thead>
          <tr>
            <Th $w="14%">Time</Th>
            <Th $w="20%">Pair</Th>
            <Th $w="16%">Action</Th>
            <Th $w="20%">Amount</Th>
            <Th $w="18%">LP Tokens</Th>
            <Th $w="12%">Status</Th>
          </tr>
        </thead>
        <tbody>
          {loadingLabel || isIndexing ? (
            <tr>
              <EmptyRow colSpan={6}>{loadingLabel ?? 'Indexing liquidity events…'}</EmptyRow>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <EmptyRow colSpan={6}>No recent liquidity activity for this pair.</EmptyRow>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id}>
                <Td>{row.time}</Td>
                <Td>{row.pair}</Td>
                <Td>
                  {row.action === 'Add' ? (
                    <ActionAdd>{row.action}</ActionAdd>
                  ) : (
                    <ActionRemove>{row.action}</ActionRemove>
                  )}
                </Td>
                <Td>{row.amount}</Td>
                <Td>{row.lp}</Td>
                <Td>
                  <StatusBadge $tone={row.tone}>{row.status}</StatusBadge>
                </Td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </LsPanel>
  )
}

export default LiquidityActivityTable
