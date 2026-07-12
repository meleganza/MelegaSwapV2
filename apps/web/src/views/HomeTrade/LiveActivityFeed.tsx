import React, { useMemo } from 'react'
import Link from 'next/link'
import styled, { keyframes } from 'styled-components'
import { premiumStudioColors } from 'design-system/melega/tokens/premiumStudio'
import { RUNTIME_LOADING_LABEL, RUNTIME_UNAVAILABLE_LABEL } from 'lib/runtime-truth'
import TradeTechnicalDetails from 'views/Trade/components/TradeTechnicalDetails'
import type { ActivityRow, ActivitySlot, ActivityUnavailable } from './useHomeTradeData'
import { homeTradeLayout, homeTypography } from './homeTradeTokens'

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`

const Shell = styled.section<{ $compact?: boolean; $empty?: boolean }>`
  background: ${premiumStudioColors.card};
  border: 1px solid ${premiumStudioColors.cardBorder};
  border-radius: ${homeTradeLayout.cardRadius};
  padding: ${homeTradeLayout.cardPadding};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: ${({ $empty, $compact }) =>
    $empty ? 'auto' : $compact ? 'auto' : homeTradeLayout.liveActivityHeight};
  min-height: ${({ $empty }) => ($empty ? '0' : 'auto')};
  max-height: ${({ $empty }) => ($empty ? '190px' : 'none')};

  @media (max-width: 1023px) {
    max-height: ${({ $empty }) => ($empty ? '170px' : 'none')};
  }

  @media (max-width: 767px) {
    max-height: ${({ $empty }) => ($empty ? '150px' : 'none')};
  }
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  flex-shrink: 0;
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

  &:hover {
    text-decoration: underline;
  }
`

const Body = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
`

const SlotList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
`

const Slot = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px 12px;
  align-items: center;
  min-height: ${homeTradeLayout.activityRowHeight};
  padding: 0 12px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.02);
  box-sizing: border-box;
`

const SlotLabel = styled.span`
  font-size: ${homeTypography.tableHead.size};
  font-weight: ${homeTypography.tableHead.weight};
  letter-spacing: ${homeTypography.tableHead.letterSpacing};
  color: ${premiumStudioColors.muted};
  grid-column: 1 / -1;
`

const SlotTitle = styled.span`
  font-size: ${homeTypography.tableCell.size};
  font-weight: ${homeTypography.tableCell.weight};
  color: ${premiumStudioColors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-variant-numeric: ${homeTypography.fontVariantNumeric};
`

const SlotMeta = styled.span`
  font-size: ${homeTypography.tableCellMuted.size};
  color: ${premiumStudioColors.muted};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const SlotTime = styled.span`
  font-size: ${homeTypography.tableCellMuted.size};
  color: ${premiumStudioColors.muted};
  white-space: nowrap;
  text-align: right;
  font-variant-numeric: ${homeTypography.fontVariantNumeric};
`

const EmptyWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  flex: 1;
  padding: 16px;
  border-radius: 12px;
  border: 1px dashed rgba(255, 255, 255, 0.1);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.02) 0%, transparent 100%);
`

const EmptyTitle = styled.p`
  margin: 0 0 6px;
  font-size: 15px;
  font-weight: 700;
  color: ${premiumStudioColors.text};
`

const EmptyDesc = styled.p`
  margin: 0;
  font-size: ${homeTypography.statSubline.size};
  color: ${premiumStudioColors.muted};
  line-height: 1.45;
  max-width: 420px;
`

const SkeletonRow = styled.div`
  min-height: ${homeTradeLayout.activityRowHeight};
  border-radius: 12px;
  background: linear-gradient(90deg, #141414 0%, #1f1f1f 50%, #141414 100%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.6s ease-in-out infinite;
`

const SKELETON_ROWS = 5

export interface LiveActivityFeedProps {
  title?: string
  rows?: ActivityRow[]
  slots?: ActivitySlot[]
  isIndexing?: boolean
  activityUnavailable?: ActivityUnavailable
  indexerState?: {
    source: string
    indexer: string
    lastAttempt: string
    reason?: string
  }
}

export const LiveActivityFeed: React.FC<LiveActivityFeedProps> = ({
  title = 'Recent protocol activity',
  rows = [],
  slots = [],
  isIndexing = false,
  activityUnavailable,
  indexerState,
}) => {
  const displaySlots = slots.length > 0 ? slots.slice(0, 6) : []
  const hasFilledSlots = displaySlots.some((slot) => slot.row)
  const hasRows = rows.length > 0

  const technicalDetail = useMemo(() => {
    if (isIndexing) {
      return `Subgraph request in progress · Source: ${indexerState?.source ?? 'melega-subgraph'} · Indexer: ${indexerState?.indexer ?? 'loading'} · Last attempt: ${indexerState?.lastAttempt ? new Date(indexerState.lastAttempt).toLocaleString() : 'in progress'}`
    }
    if (activityUnavailable) {
      return `Reason: ${activityUnavailable.reason} · Source: ${activityUnavailable.source} · Indexer: ${activityUnavailable.indexer} · Last attempt: ${new Date(activityUnavailable.lastAttempt).toLocaleString()}`
    }
    return undefined
  }, [isIndexing, activityUnavailable, indexerState])

  const emptyDescription = useMemo(() => {
    if (isIndexing) {
      return undefined
    }
    return undefined
  }, [isIndexing])

  const filledCount = displaySlots.filter((s) => s.row).length
  const isEmpty = !isIndexing && !hasFilledSlots && !hasRows
  const isCompact = filledCount <= 2 && !isIndexing

  return (
    <Shell data-live-activity-feed $compact={isCompact} $empty={isEmpty}>
      <Header>
        <Title>{title}</Title>
        <SectionLink href="/trade">View all →</SectionLink>
      </Header>
      <Body>
        {isIndexing && !hasFilledSlots && !hasRows ? (
          <SlotList aria-busy="true" aria-label="Loading live activity">
            {Array.from({ length: SKELETON_ROWS }).map((_, index) => (
              <SkeletonRow key={index} />
            ))}
          </SlotList>
        ) : hasFilledSlots ? (
          <SlotList>
            {displaySlots.map((slot) => (
              <Slot key={slot.id}>
                <SlotLabel>{slot.label}</SlotLabel>
                {slot.row ? (
                  <>
                    <div style={{ minWidth: 0 }}>
                      <SlotTitle>{slot.row.type}</SlotTitle>
                      {slot.row.context ? <SlotMeta>{slot.row.context}</SlotMeta> : null}
                    </div>
                    <SlotTime>{slot.row.time || slot.row.value || ''}</SlotTime>
                  </>
                ) : (
                  <SlotMeta style={{ gridColumn: '1 / -1' }}>
                    {activityUnavailable?.reason ?? RUNTIME_UNAVAILABLE_LABEL}
                  </SlotMeta>
                )}
              </Slot>
            ))}
          </SlotList>
        ) : hasRows ? (
          <SlotList>
            {rows.slice(0, 6).map((row) => (
              <Slot key={row.id}>
                <div style={{ minWidth: 0 }}>
                  <SlotTitle>{row.type}</SlotTitle>
                  {row.context ? <SlotMeta>{row.context}</SlotMeta> : null}
                </div>
                <SlotTime>{row.time || row.value || ''}</SlotTime>
              </Slot>
            ))}
          </SlotList>
        ) : (
          <EmptyWrap>
            <EmptyTitle>
              {isIndexing
                ? RUNTIME_LOADING_LABEL
                : 'Protocol activity is not yet available from the production indexer.'}
            </EmptyTitle>
            <TradeTechnicalDetails detail={technicalDetail} />
          </EmptyWrap>
        )}
      </Body>
    </Shell>
  )
}

export default LiveActivityFeed
