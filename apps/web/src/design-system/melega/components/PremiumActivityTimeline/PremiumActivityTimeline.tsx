import React from 'react'
import styled from 'styled-components'
import {
  PREMIUM_FONT_BODY,
  PREMIUM_FONT_DISPLAY,
  premiumStudioColors,
  premiumStudioLayout,
  premiumStudioType,
} from '../../tokens/premiumStudio'

export interface PremiumActivityRow {
  id: string
  title: string
  subtitle: string
  status: string
  time: string
  statusTone?: 'green' | 'gold' | 'muted'
}

const Panel = styled.section<{ $height?: string }>`
  background: ${premiumStudioColors.card};
  border: 1px solid ${premiumStudioColors.cardBorder};
  border-radius: ${premiumStudioLayout.cardRadius};
  padding: ${premiumStudioLayout.cardPadding};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: border-color ${premiumStudioLayout.hoverTransition} ease;
  ${({ $height }) =>
    $height
      ? `
    height: ${$height};
    min-height: ${$height};
  `
      : ''}

  &:hover {
    border-color: ${premiumStudioColors.cardBorderHover};
  }
`

const Title = styled.h3`
  margin: 0 0 16px;
  font-family: ${PREMIUM_FONT_DISPLAY};
  font-size: ${premiumStudioType.cardTitle};
  font-weight: 700;
  color: ${premiumStudioColors.text};
`

const List = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
`

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  height: ${premiumStudioLayout.timelineRowHeight};
  min-height: ${premiumStudioLayout.timelineRowHeight};
`

const Dot = styled.span`
  width: ${premiumStudioLayout.timelineDotSize};
  height: ${premiumStudioLayout.timelineDotSize};
  border-radius: 50%;
  background: ${premiumStudioColors.gold};
  flex-shrink: 0;
`

const Middle = styled.div`
  flex: 1;
  min-width: 0;
`

const EventTitle = styled.div`
  font-family: ${PREMIUM_FONT_BODY};
  font-size: ${premiumStudioType.timelineTitle};
  font-weight: 700;
  line-height: 1.3;
  color: ${premiumStudioColors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const EventSub = styled.div`
  font-family: ${PREMIUM_FONT_BODY};
  font-size: ${premiumStudioType.timelineSub};
  font-weight: 400;
  line-height: 1.3;
  color: ${premiumStudioColors.muted};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Right = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  flex-shrink: 0;
`

const StatusPill = styled.span<{ $tone?: 'green' | 'gold' | 'muted' }>`
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid
    ${({ $tone }) =>
      $tone === 'green'
        ? premiumStudioColors.green
        : $tone === 'gold'
          ? premiumStudioColors.gold
          : premiumStudioColors.cardBorder};
  background: ${({ $tone }) =>
    $tone === 'green' ? 'rgba(27,231,122,0.08)' : $tone === 'gold' ? premiumStudioColors.goldBg : 'transparent'};
  font-family: ${PREMIUM_FONT_BODY};
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${({ $tone }) =>
    $tone === 'green' ? premiumStudioColors.green : $tone === 'gold' ? premiumStudioColors.gold : premiumStudioColors.muted};
  line-height: 1;
`

const Time = styled.span`
  font-family: ${PREMIUM_FONT_BODY};
  font-size: ${premiumStudioType.timelineSub};
  color: ${premiumStudioColors.muted};
  white-space: nowrap;
`

interface Props {
  title: string
  rows: PremiumActivityRow[]
  emptyTitle?: string
  emptySubtitle?: string
  height?: string
  badge?: React.ReactNode
  'data-testid'?: string
}

export const PremiumActivityTimeline: React.FC<Props> = ({
  title,
  rows,
  emptyTitle = 'No activity yet',
  emptySubtitle = 'Awaiting runtime',
  height,
  badge,
  'data-testid': dataTestId,
}) => (
  <Panel $height={height} data-premium-activity-timeline={dataTestId ?? true}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <Title>{title}</Title>
      {badge}
    </div>
    <List>
      {rows.length === 0 ? (
        <Row>
          <Dot aria-hidden />
          <Middle>
            <EventTitle>{emptyTitle}</EventTitle>
            <EventSub>{emptySubtitle}</EventSub>
          </Middle>
        </Row>
      ) : (
        rows.map((row) => (
          <Row key={row.id}>
            <Dot aria-hidden />
            <Middle>
              <EventTitle>{row.title}</EventTitle>
              <EventSub>{row.subtitle}</EventSub>
            </Middle>
            <Right>
              <StatusPill $tone={row.statusTone}>{row.status}</StatusPill>
              <Time>{row.time}</Time>
            </Right>
          </Row>
        ))
      )}
    </List>
  </Panel>
)

export default PremiumActivityTimeline
