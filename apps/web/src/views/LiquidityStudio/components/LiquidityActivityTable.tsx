import React, { useMemo } from 'react'
import styled, { keyframes } from 'styled-components'
import { RUNTIME_LOADING_LABEL, RUNTIME_UNAVAILABLE_LABEL } from 'lib/runtime-truth'
import TradeTechnicalDetails from 'views/Trade/components/TradeTechnicalDetails'
import { liquidityStudioColors, liquidityStudioLayout, liquidityTypography } from '../liquidityStudioTokens'
import { useLiquidityRuntime } from '../liquidityRuntime/LiquidityRuntimeContext'

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`

const Panel = styled.section`
  background: ${liquidityStudioColors.panel};
  border: 1px solid ${liquidityStudioColors.border};
  border-radius: ${liquidityStudioLayout.cardRadius};
  padding: ${liquidityStudioLayout.cardPadding};
  box-sizing: border-box;
  height: ${liquidityStudioLayout.activityHeight};
  min-height: ${liquidityStudioLayout.activityHeight};
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
  font-size: ${liquidityTypography.sectionTitle.size};
  font-weight: ${liquidityTypography.sectionTitle.weight};
  color: ${liquidityStudioColors.text};
`

const LiveBadge = styled.span`
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  border: 1px solid ${liquidityStudioColors.green};
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${liquidityStudioColors.green};
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
  font-variant-numeric: ${liquidityTypography.fontVariantNumeric};
`

const Th = styled.th`
  position: sticky;
  top: 0;
  z-index: 1;
  height: ${liquidityStudioLayout.activityHeaderHeight};
  padding: 0 12px;
  text-align: left;
  font-size: ${liquidityTypography.tableHead.size};
  font-weight: ${liquidityTypography.tableHead.weight};
  letter-spacing: ${liquidityTypography.tableHead.letterSpacing};
  color: ${liquidityStudioColors.muted};
  background: #121212;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
`

const Td = styled.td`
  height: ${liquidityStudioLayout.activityRowHeight};
  padding: 0 12px;
  font-size: ${liquidityTypography.tableCell.size};
  font-weight: ${liquidityTypography.tableCell.weight};
  color: ${liquidityStudioColors.text};
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  vertical-align: middle;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const MutedCell = styled(Td)`
  font-size: ${liquidityTypography.tableCellMuted.size};
  color: ${liquidityStudioColors.muted};
`

const ActionPill = styled.span<{ $remove?: boolean }>`
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  color: ${({ $remove }) => ($remove ? liquidityStudioColors.muted : liquidityStudioColors.green)};
  border: 1px solid ${({ $remove }) => ($remove ? liquidityStudioColors.border : liquidityStudioColors.green)};
  background: ${({ $remove }) => ($remove ? 'transparent' : 'rgba(27, 231, 122, 0.08)')};
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
  color: ${liquidityStudioColors.text};
`

const EmptyDesc = styled.p`
  margin: 8px 0 0;
  max-width: 420px;
  font-size: ${liquidityTypography.statSubline.size};
  line-height: 1.45;
  color: ${liquidityStudioColors.muted};
`

const SkeletonRow = styled.div`
  height: ${liquidityStudioLayout.activityRowHeight};
  border-radius: 8px;
  margin-bottom: 6px;
  background: linear-gradient(90deg, #141414 0%, #1f1f1f 50%, #141414 100%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.6s ease-in-out infinite;
`

const SKELETON_ROWS = 5

export const LiquidityActivityTable: React.FC = () => {
  const { terminal, loadingLabel } = useLiquidityRuntime()
  const { activityRows, isIndexing, activityDiagnostic } = terminal
  const displayRows = activityRows.slice(0, 8)

  const technicalDetail = useMemo(() => {
    if (isIndexing) {
      return activityDiagnostic
        ? `Subgraph request in progress · Source: ${activityDiagnostic.source} · Indexer: ${activityDiagnostic.indexer} · Last attempt: ${new Date(activityDiagnostic.lastAttempt).toLocaleString()}`
        : undefined
    }
    if (activityDiagnostic) {
      return `Reason: ${activityDiagnostic.reason} · Source: ${activityDiagnostic.source} · Indexer: ${activityDiagnostic.indexer} · Last attempt: ${new Date(activityDiagnostic.lastAttempt).toLocaleString()}`
    }
    return undefined
  }, [isIndexing, activityDiagnostic])

  return (
    <Panel data-ls-activity>
      <Head>
        <Title>Liquidity activity</Title>
        <LiveBadge>Live</LiveBadge>
      </Head>

      {loadingLabel && displayRows.length === 0 ? (
        <TableWrap aria-busy="true">
          {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </TableWrap>
      ) : isIndexing && displayRows.length === 0 ? (
        <TableWrap aria-busy="true" aria-label="Loading liquidity activity">
          {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </TableWrap>
      ) : displayRows.length === 0 ? (
        <EmptyState>
          <EmptyTitle>{RUNTIME_UNAVAILABLE_LABEL}</EmptyTitle>
          <EmptyDesc>
            Liquidity mint and burn events appear when the Melega subgraph indexes on-chain activity for this pair.
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
                <Th>LP USD</Th>
                <Th style={{ width: '88px' }}>Status</Th>
              </tr>
            </thead>
            <tbody>
              {displayRows.map((row) => (
                <tr key={row.id}>
                  <MutedCell>{row.time}</MutedCell>
                  <Td>{row.pair}</Td>
                  <Td>
                    <ActionPill $remove={row.action === 'Remove'}>{row.action}</ActionPill>
                  </Td>
                  <Td>{row.amount}</Td>
                  <MutedCell>{row.lp}</MutedCell>
                  <MutedCell>{row.status}</MutedCell>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableWrap>
      )}
    </Panel>
  )
}

export default LiquidityActivityTable
