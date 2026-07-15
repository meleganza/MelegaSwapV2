import React, { useMemo } from 'react'
import Link from 'next/link'
import styled, { keyframes } from 'styled-components'
import { useMatchBreakpoints } from '@pancakeswap/uikit'
import { premiumStudioColors } from 'design-system/melega/tokens/premiumStudio'
import { LIVE_ACTIVITY_WINDOW_SEC } from 'lib/data-truth/ontology'
import { RUNTIME_LOADING_LABEL } from 'lib/runtime-truth'
import TradeTechnicalDetails from 'views/Trade/components/TradeTechnicalDetails'
import { homeTradeLayout, homeTypography } from './homeTradeTokens'
import type { HomeActivityDisplayRow } from './formatHomeActivity'

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`

const Shell = styled.section`
  background: ${premiumStudioColors.card};
  border: 1px solid ${premiumStudioColors.cardBorder};
  border-radius: ${homeTradeLayout.cardRadius};
  padding: 24px;
  padding-bottom: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: auto;
  min-height: 0;

  @media (max-width: 767px) {
    padding: 18px;
    padding-bottom: 20px;
  }
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
  flex-shrink: 0;
  gap: 12px;
`

const Title = styled.h2`
  margin: 0;
  font-size: ${homeTypography.sectionTitle.size};
  font-weight: ${homeTypography.sectionTitle.weight};
  line-height: ${homeTypography.sectionTitle.lineHeight};
  color: ${premiumStudioColors.text};
`

const SectionLink = styled(Link)`
  color: ${premiumStudioColors.gold};
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;

  &:hover {
    text-decoration: underline;
  }
`

const Body = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 0;
`

const RowList = styled.div`
  display: flex;
  flex-direction: column;
`

const Row = styled.div`
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr) auto auto;
  column-gap: 12px;
  align-items: center;
  min-height: 56px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  box-sizing: border-box;

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 767px) {
    grid-template-columns: 32px minmax(0, 1fr) auto;
    grid-template-rows: auto auto auto;
    column-gap: 10px;
    row-gap: 4px;
    align-items: start;
    min-height: 64px;
    padding: 10px 0;
  }
`

const IconWrap = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid rgba(212, 175, 55, 0.22);
  background: rgba(212, 175, 55, 0.08);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${premiumStudioColors.gold};
  flex-shrink: 0;
  grid-row: 1 / span 2;

  @media (max-width: 767px) {
    width: 32px;
    height: 32px;
    grid-row: 1;
    align-self: start;
  }
`

const Content = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;

  @media (max-width: 767px) {
    grid-column: 2;
    grid-row: 1;
  }
`

const PrimaryLine = styled.div`
  font-size: ${homeTypography.tableCell.size};
  font-weight: ${homeTypography.tableCell.weight};
  color: ${premiumStudioColors.text};
  line-height: 1.35;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const SecondaryLine = styled.div`
  font-size: ${homeTypography.tableCellMuted.size};
  color: ${premiumStudioColors.muted};
  line-height: 1.35;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const AmountCol = styled.div<{ $hidden?: boolean }>`
  font-size: ${homeTypography.tableCellMuted.size};
  font-weight: 600;
  color: ${premiumStudioColors.text};
  white-space: nowrap;
  text-align: right;
  flex-shrink: 0;

  @media (max-width: 767px) {
    grid-column: 2;
    grid-row: 2;
    text-align: left;
    white-space: normal;
    display: ${({ $hidden }) => ($hidden ? 'none' : 'block')};
  }
`

const MetaCol = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  flex-shrink: 0;

  @media (max-width: 767px) {
    grid-column: 3;
    grid-row: 1;
    align-self: start;
  }
`

const MobileTime = styled.span`
  display: none;
  font-size: ${homeTypography.tableCellMuted.size};
  color: ${premiumStudioColors.muted};
  white-space: nowrap;
  font-variant-numeric: ${homeTypography.fontVariantNumeric};

  @media (max-width: 767px) {
    display: block;
    grid-column: 2;
    grid-row: 3;
  }
`

const DesktopTime = styled.span`
  font-size: ${homeTypography.tableCellMuted.size};
  color: ${premiumStudioColors.muted};
  white-space: nowrap;
  font-variant-numeric: ${homeTypography.fontVariantNumeric};

  @media (max-width: 767px) {
    display: none;
  }
`

const ExplorerLink = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  color: ${premiumStudioColors.gold};
  text-decoration: none;
  border: 1px solid rgba(212, 175, 55, 0.18);
  background: rgba(212, 175, 55, 0.06);

  &:hover {
    background: rgba(212, 175, 55, 0.12);
  }
`

const EmptyWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 18px 16px;
  border-radius: 12px;
  border: 1px dashed rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.02);
  max-height: 160px;
  min-height: 96px;
  box-sizing: border-box;

  @media (max-width: 767px) {
    max-height: 132px;
    padding: 14px 12px;
  }
`

const EmptyTitle = styled.p`
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: ${premiumStudioColors.text};
`

const EmptySecondary = styled.p`
  margin: 8px 0 0;
  font-size: 12px;
  line-height: 1.4;
  color: ${premiumStudioColors.muted};
  max-width: 360px;
`

const SkeletonRow = styled.div`
  min-height: 56px;
  margin-bottom: 10px;
  border-radius: 12px;
  background: linear-gradient(90deg, #141414 0%, #1f1f1f 50%, #141414 100%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.6s ease-in-out infinite;

  @media (max-width: 767px) {
    min-height: 64px;
  }
`

const BSCSCAN_TX_URL = /^https:\/\/bscscan\.com\/tx\/0x[a-fA-F0-9]{64}$/

type ActivityTitle = 'Live Activity' | 'Recent Protocol Activity' | 'Protocol Activity'

export interface LiveActivityFeedProps {
  /** @deprecated Title is derived from row timestamps inside the component. */
  title?: string
  rows?: HomeActivityDisplayRow[]
  viewAllHref?: string
  isIndexing?: boolean
  isError?: boolean
  emptySecondary?: string
  errorDetail?: string
  maxRows?: number
}

function formatRelativeTime(timestamp: number): string | undefined {
  if (!Number.isFinite(timestamp) || timestamp <= 0) return undefined
  const seconds = Math.floor(Date.now() / 1000 - timestamp)
  if (seconds < 0) return undefined
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function resolveActivityTitle(rows: HomeActivityDisplayRow[]): ActivityTitle {
  if (rows.length === 0) return 'Protocol Activity'
  const nowSec = Math.floor(Date.now() / 1000)
  const hasRecent = rows.some((row) => {
    if (!Number.isFinite(row.timestamp) || row.timestamp <= 0) return false
    const age = nowSec - row.timestamp
    return age >= 0 && age <= LIVE_ACTIVITY_WINDOW_SEC
  })
  if (hasRecent) return 'Live Activity'
  return 'Recent Protocol Activity'
}

function isValidExplorerUrl(url?: string): url is string {
  return typeof url === 'string' && BSCSCAN_TX_URL.test(url)
}

function eventIcon(label?: string): string {
  if (!label) return '•'
  if (label.includes('Swap')) return '↔'
  if (label.includes('added') || label.includes('deposit') || label.includes('Deposit')) return '+'
  if (label.includes('removed') || label.includes('withdrawal') || label.includes('Withdraw')) return '−'
  return '•'
}

function buildPrimaryText(row: HomeActivityDisplayRow): string {
  if (row.eventLabel && row.eventLabel !== row.identity) {
    return `${row.eventLabel} · ${row.identity}`
  }
  return row.identity || row.primaryLine
}

function buildWalletLine(row: HomeActivityDisplayRow): string | undefined {
  return row.walletShort?.trim() || undefined
}

function shouldShowAmountColumn(row: HomeActivityDisplayRow): boolean {
  if (!row.amountText?.trim()) return false
  if (row.secondaryLine?.includes(row.amountText)) return false
  return true
}

function resolveEmptySecondary(emptySecondary?: string): string | undefined {
  const trimmed = emptySecondary?.trim()
  if (!trimmed) return undefined
  if (trimmed.toLowerCase() === 'no protocol activity detected.') return undefined
  return trimmed
}

export const LiveActivityFeed: React.FC<LiveActivityFeedProps> = ({
  rows = [],
  viewAllHref = '/trade',
  isIndexing = false,
  isError = false,
  emptySecondary,
  errorDetail,
  maxRows = 6,
}) => {
  const { isMobile, isTablet } = useMatchBreakpoints()
  const rowLimit = isMobile ? 4 : isTablet ? 5 : maxRows
  const panelTitle = useMemo(() => resolveActivityTitle(rows), [rows])
  const displayRows = rows.slice(0, rowLimit)
  const hasRows = displayRows.length > 0
  const showSkeleton = isIndexing && !hasRows
  const skeletonCount = isMobile ? 3 : 4
  const showViewAll = hasRows || viewAllHref === '/trade'
  const resolvedEmptySecondary = resolveEmptySecondary(emptySecondary)

  return (
    <Shell data-live-activity-feed>
      <Header>
        <Title>{panelTitle}</Title>
        {showViewAll ? <SectionLink href={viewAllHref}>View all →</SectionLink> : null}
      </Header>
      <Body>
        {showSkeleton ? (
          <RowList aria-busy="true" aria-label="Loading live activity">
            {Array.from({ length: skeletonCount }).map((_, index) => (
              <SkeletonRow key={index} />
            ))}
          </RowList>
        ) : hasRows ? (
          <RowList>
            {displayRows.map((row) => {
              const primaryText = buildPrimaryText(row)
              const walletLine = buildWalletLine(row)
              const relativeTime = formatRelativeTime(row.timestamp)
              const showAmount = shouldShowAmountColumn(row)
              const explorerUrl = isValidExplorerUrl(row.explorerUrl) ? row.explorerUrl : undefined
              const explorerLabel = `View ${row.identity} transaction on BscScan`

              return (
                <Row key={row.id} data-live-activity-row>
                  <IconWrap aria-hidden>{eventIcon(row.eventLabel)}</IconWrap>
                  <Content>
                    <PrimaryLine title={primaryText}>{primaryText}</PrimaryLine>
                    {walletLine ? <SecondaryLine title={walletLine}>{walletLine}</SecondaryLine> : null}
                    {!walletLine && row.secondaryLine ? (
                      <SecondaryLine title={row.secondaryLine}>{row.secondaryLine}</SecondaryLine>
                    ) : null}
                  </Content>
                  <AmountCol $hidden={!showAmount}>{showAmount ? row.amountText : null}</AmountCol>
                  <MetaCol>
                    {relativeTime ? <DesktopTime>{relativeTime}</DesktopTime> : null}
                    {explorerUrl ? (
                      <ExplorerLink
                        href={explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={explorerLabel}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <path d="M15 3h6v6" />
                          <path d="M10 14 21 3" />
                        </svg>
                      </ExplorerLink>
                    ) : null}
                  </MetaCol>
                  {relativeTime ? <MobileTime>{relativeTime}</MobileTime> : null}
                </Row>
              )
            })}
          </RowList>
        ) : (
          <EmptyWrap data-live-activity-empty>
            <EmptyTitle>
              {isError && !isIndexing
                ? 'Protocol activity is temporarily unavailable.'
                : isIndexing
                  ? RUNTIME_LOADING_LABEL
                  : 'No protocol activity detected.'}
            </EmptyTitle>
            {!isIndexing && !isError && resolvedEmptySecondary ? (
              <EmptySecondary>{resolvedEmptySecondary}</EmptySecondary>
            ) : null}
            <TradeTechnicalDetails detail={isError ? errorDetail : undefined} />
          </EmptyWrap>
        )}
      </Body>
    </Shell>
  )
}

export default LiveActivityFeed

export { resolveActivityTitle, formatRelativeTime, isValidExplorerUrl }
