import React, { useMemo } from 'react'
import styled, { keyframes } from 'styled-components'
import { RUNTIME_UNAVAILABLE_LABEL } from 'lib/runtime-truth'
import TradeTechnicalDetails from 'views/Trade/components/TradeTechnicalDetails'
import { farmsStudioColors, farmsStudioLayout, farmsTypography } from '../farmsStudioTokens'
import { useFarmsRuntime } from '../farmsRuntime/FarmsRuntimeContext'

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`

const Panel = styled.section`
  background: ${farmsStudioColors.panel};
  border: 1px solid ${farmsStudioColors.border};
  border-radius: ${farmsStudioLayout.cardRadius};
  padding: ${farmsStudioLayout.cardPadding};
  box-sizing: border-box;
  height: ${farmsStudioLayout.activityHeight};
  min-height: ${farmsStudioLayout.activityHeight};
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
  flex-shrink: 0;
`

const Title = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: ${farmsStudioColors.text};
`

const LiveBadge = styled.span`
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  border: 1px solid ${farmsStudioColors.green};
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${farmsStudioColors.green};
  background: rgba(27, 231, 122, 0.08);
`

const TableWrap = styled.div`
  flex: 1;
  min-height: 0;
  overflow: auto;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  font-variant-numeric: ${farmsTypography.fontVariantNumeric};
`

const Th = styled.th`
  position: sticky;
  top: 0;
  z-index: 1;
  height: 36px;
  padding: 0 12px;
  text-align: left;
  font-size: ${farmsTypography.tableHead.size};
  font-weight: ${farmsTypography.tableHead.weight};
  letter-spacing: ${farmsTypography.tableHead.letterSpacing};
  color: ${farmsStudioColors.muted};
  background: #121212;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
`

const Td = styled.td`
  height: ${farmsStudioLayout.activityRowHeight};
  padding: 0 12px;
  font-size: ${farmsTypography.tableCell.size};
  font-weight: ${farmsTypography.tableCell.weight};
  color: ${farmsStudioColors.text};
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  vertical-align: middle;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const MutedCell = styled(Td)`
  font-size: ${farmsTypography.tableCellMuted.size};
  color: ${farmsStudioColors.muted};
`

const EmptyState = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 24px 16px;
  border-radius: 12px;
  border: 1px dashed rgba(255, 255, 255, 0.1);
`

const EmptyTitle = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: ${farmsStudioColors.text};
`

const EmptyDesc = styled.p`
  margin: 8px 0 0;
  max-width: 420px;
  font-size: ${farmsTypography.statSubline.size};
  line-height: 1.45;
  color: ${farmsStudioColors.muted};
`

const SkeletonRow = styled.div`
  height: ${farmsStudioLayout.activityRowHeight};
  border-radius: 8px;
  margin-bottom: 6px;
  background: linear-gradient(90deg, #141414 0%, #1f1f1f 50%, #141414 100%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.6s ease-in-out infinite;
`

const SKELETON_ROWS = 5

export const FarmsActivityTable: React.FC = () => {
  const { terminal, loadingLabel, account } = useFarmsRuntime()
  const rows = terminal.activityRows

  const technicalDetail = useMemo(() => {
    if (!account) return 'Wallet not connected'
    if (loadingLabel) return loadingLabel
    return 'Activity sourced from connected wallet transactions'
  }, [account, loadingLabel])

  return (
    <Panel data-fs-activity style={{ marginTop: farmsStudioLayout.activityMarginTop }}>
      <Head>
        <Title>Recent Farming Activity</Title>
        <LiveBadge>Live</LiveBadge>
      </Head>

      {loadingLabel ? (
        <TableWrap aria-busy="true">
          {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </TableWrap>
      ) : rows.length === 0 ? (
        <EmptyState>
          <EmptyTitle>{RUNTIME_UNAVAILABLE_LABEL}</EmptyTitle>
          <EmptyDesc>
            {!account
              ? 'Connect wallet to view your farming transactions.'
              : 'No recent farm transactions for this wallet.'}
          </EmptyDesc>
          <TradeTechnicalDetails detail={technicalDetail} />
        </EmptyState>
      ) : (
        <TableWrap>
          <Table>
            <thead>
              <tr>
                <Th style={{ width: '72px' }}>Time</Th>
                <Th>Pair</Th>
                <Th>Action</Th>
                <Th>Amount</Th>
                <Th>Rewards</Th>
                <Th style={{ width: '88px' }}>Status</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={`${row.time}-${row.pair}-${row.action}-${row.hash ?? ''}`}>
                  <MutedCell>{row.time}</MutedCell>
                  <Td>{row.pair}</Td>
                  <Td>{row.action}</Td>
                  <Td>{row.amount || RUNTIME_UNAVAILABLE_LABEL}</Td>
                  <MutedCell>{row.rewards || RUNTIME_UNAVAILABLE_LABEL}</MutedCell>
                  <MutedCell>{row.status === 'indexed' ? 'Confirmed' : 'Pending'}</MutedCell>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableWrap>
      )}
    </Panel>
  )
}

export default FarmsActivityTable
