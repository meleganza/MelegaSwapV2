import React from 'react'
import styled, { keyframes } from 'styled-components'
import { MelegaTokenAvatar } from 'design-system/melega/components/MelegaTokenAvatar/MelegaTokenAvatar'
import { RUNTIME_LOADING_LABEL } from 'lib/runtime-truth'
import { tradeColors, tradeLayout, tradeTypography } from '../tradeTokens'
import type { TradeSwapRow } from '../useTradeTerminalData'
import TradeTechnicalDetails from './TradeTechnicalDetails'

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`

const Panel = styled.section<{ $empty?: boolean }>`
  background: ${tradeColors.panel};
  border: 1px solid ${tradeColors.border};
  border-radius: ${tradeLayout.cardRadius};
  padding: ${tradeLayout.cardPadding};
  box-sizing: border-box;
  height: ${({ $empty }) => ($empty ? '132px' : tradeLayout.recentSwapsHeight)};
  min-height: ${({ $empty }) => ($empty ? '132px' : tradeLayout.recentSwapsHeight)};
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
  flex-shrink: 0;
`

const Title = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  color: ${tradeColors.text};
  line-height: 1.2;
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
  font-variant-numeric: ${tradeTypography.fontVariantNumeric};
`

const Th = styled.th`
  position: sticky;
  top: 0;
  z-index: 1;
  height: ${tradeLayout.swapTableHeadHeight};
  padding: 0 10px;
  text-align: left;
  font-size: ${tradeTypography.tableHead.size};
  font-weight: ${tradeTypography.tableHead.weight};
  letter-spacing: ${tradeTypography.tableHead.letterSpacing};
  color: ${tradeColors.muted};
  background: #121212;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  white-space: nowrap;
`

const Td = styled.td`
  height: ${tradeLayout.swapRowHeight};
  padding: 0 10px;
  font-size: ${tradeTypography.tableCell.size};
  font-weight: ${tradeTypography.tableCell.weight};
  line-height: ${tradeTypography.tableCell.lineHeight};
  color: ${tradeColors.text};
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  vertical-align: middle;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const MutedCell = styled(Td)`
  font-size: ${tradeTypography.tableCellMuted.size};
  font-weight: ${tradeTypography.tableCellMuted.weight};
  color: ${tradeColors.muted};
`

const PairCell = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
`

const TokenIcons = styled.div`
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
`

const ExplorerLink = styled.a`
  font-size: 12px;
  font-weight: 700;
  color: ${tradeColors.gold};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

const EmptyState = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px dashed rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.02);
`

const EmptyTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: ${tradeColors.text};
`

const EmptyDesc = styled.p`
  margin: 6px 0 0;
  max-width: 420px;
  font-size: ${tradeTypography.statSubline.size};
  line-height: 1.4;
  color: ${tradeColors.muted};
`

const SkeletonRow = styled.div`
  height: ${tradeLayout.swapRowHeight};
  display: grid;
  grid-template-columns: 72px 1.4fr 1fr 0.9fr 72px 56px;
  gap: 10px;
  align-items: center;
  padding: 0 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
`

const SkeletonBar = styled.span<{ $w?: string }>`
  display: block;
  height: 10px;
  width: ${({ $w }) => $w ?? '72%'};
  border-radius: 4px;
  background: linear-gradient(90deg, #1a1a1a 0%, #2a2a2a 50%, #1a1a1a 100%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.6s ease-in-out infinite;
`

const SKELETON_ROWS = 3

export interface TradeSwapsTableProps {
  rows: TradeSwapRow[]
  isIndexing?: boolean
  emptyTitle?: string
  emptyDescription?: string
  technicalDetail?: string
}

export const TradeSwapsTable: React.FC<TradeSwapsTableProps> = ({
  rows,
  isIndexing,
  emptyTitle = 'No indexed swaps yet',
  emptyDescription,
  technicalDetail,
}) => {
  const displayRows = rows.slice(0, 8)
  const isEmpty = !isIndexing && displayRows.length === 0

  return (
    <Panel data-trade-recent-swaps $empty={isEmpty}>
      <Head>
        <Title>Recent swaps</Title>
      </Head>

      {isIndexing && displayRows.length === 0 ? (
        <TableWrap aria-busy="true" aria-label="Loading recent swaps">
          {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
            <SkeletonRow key={i}>
              <SkeletonBar $w="48px" />
              <SkeletonBar $w="88%" />
              <SkeletonBar $w="72%" />
              <SkeletonBar $w="64%" />
              <SkeletonBar $w="56%" />
              <SkeletonBar $w="40px" />
            </SkeletonRow>
          ))}
        </TableWrap>
      ) : displayRows.length === 0 ? (
        <EmptyState data-trade-swaps-empty>
          <EmptyTitle>{isIndexing ? RUNTIME_LOADING_LABEL : emptyTitle}</EmptyTitle>
          <EmptyDesc>{emptyDescription ?? 'Runtime swaps appear here after the indexer records activity.'}</EmptyDesc>
          <TradeTechnicalDetails detail={technicalDetail} />
        </EmptyState>
      ) : (
        <TableWrap>
          <Table>
            <thead>
              <tr>
                <Th style={{ width: '72px' }}>Time</Th>
                <Th>Pair</Th>
                <Th>Amount</Th>
                <Th style={{ width: '96px' }}>Wallet</Th>
                <Th style={{ width: '56px' }}>Tx</Th>
              </tr>
            </thead>
            <tbody>
              {displayRows.map((row) => (
                <tr key={row.id}>
                  <MutedCell>{row.time}</MutedCell>
                  <Td>
                    <PairCell>
                      <TokenIcons>
                        <MelegaTokenAvatar name={row.token0Symbol} symbol={row.token0Symbol} size={18} />
                        <MelegaTokenAvatar name={row.token1Symbol} symbol={row.token1Symbol} size={18} />
                      </TokenIcons>
                      {row.token0Symbol}/{row.token1Symbol}
                    </PairCell>
                  </Td>
                  <Td title={row.amountReason}>{row.amount}</Td>
                  <MutedCell>{row.wallet}</MutedCell>
                  <Td>
                    <ExplorerLink href={row.explorerUrl} target="_blank" rel="noopener noreferrer">
                      View
                    </ExplorerLink>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableWrap>
      )}
    </Panel>
  )
}

export default TradeSwapsTable
