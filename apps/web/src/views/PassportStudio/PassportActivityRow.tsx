/**
 * PASSPORT_MODULE_006 — desktop activity row + mobile card.
 */
import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { passportOne } from './passportTokens'
import type { PassportActivityCategory, PassportActivityItem } from './passportActivityTypes'

const Row = styled.li`
  list-style: none;
  width: 644px;
  max-width: 100%;
  height: 64px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.055);

  &[data-last='true'] {
    border-bottom: none;
  }

  @media (max-width: 767px) {
    display: none;
  }
`

const Icon = styled.div<{ $cat: PassportActivityCategory }>`
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 750;
  letter-spacing: 0.02em;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
  color: ${passportOne.secondary};
  ${({ $cat }) => {
    if ($cat === 'mcredits' || $cat === 'liquidity_building')
      return `color:${passportOne.gold};border-color:rgba(221,185,47,0.28);background:rgba(221,185,47,0.08);`
    if ($cat === 'liquidity')
      return `color:${passportOne.positive};border-color:rgba(22,217,119,0.25);background:rgba(22,217,119,0.08);`
    if ($cat === 'security')
      return `color:${passportOne.warning};border-color:rgba(244,185,66,0.28);background:rgba(244,185,66,0.08);`
    return ''
  }}
`

const Main = styled.div`
  width: 360px;
  min-width: 0;
  flex-shrink: 0;
`

const Title = styled.div`
  font-size: 13px;
  line-height: 18px;
  font-weight: 700;
  color: ${passportOne.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Context = styled.div`
  margin-top: 2px;
  font-size: 11px;
  line-height: 15px;
  font-weight: 400;
  color: ${passportOne.muted};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const ValueCol = styled.div`
  width: 128px;
  flex-shrink: 0;
  min-width: 0;
  text-align: right;
`

const Value = styled.div<{ $tone: PassportActivityItem['valueTone'] }>`
  font-size: 12px;
  line-height: 17px;
  font-weight: 650;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${({ $tone }) => {
    if ($tone === 'positive') return passportOne.positive
    if ($tone === 'warning') return passportOne.warning
    if ($tone === 'error') return passportOne.error
    if ($tone === 'neutral') return passportOne.secondary
    return passportOne.secondary
  }};
`

const TimeCol = styled.div`
  width: 96px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
`

const Time = styled.time`
  font-size: 10px;
  line-height: 14px;
  font-weight: 500;
  color: ${passportOne.muted};
  white-space: nowrap;
`

const Evidence = styled(Link)`
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: 1px solid ${passportOne.borderStrong};
  color: ${passportOne.secondary};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  font-size: 12px;

  &:focus-visible {
    outline: 2px solid ${passportOne.gold};
    outline-offset: 2px;
  }
`

const Card = styled.li`
  display: none;
  list-style: none;

  @media (max-width: 767px) {
    display: flex;
    flex-direction: column;
    width: 326px;
    max-width: 100%;
    min-height: 78px;
    box-sizing: border-box;
    border-radius: 12px;
    border: 1px solid ${passportOne.border};
    background: ${passportOne.card};
    padding: 12px;
    gap: 6px;
  }
`

const CardTop = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

const CardMeta = styled.div`
  flex: 1;
  min-width: 0;
`

const CardBottom = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 4px;
`

const ICON_MARK: Record<PassportActivityCategory, string> = {
  identity: 'ID',
  wallet: 'WL',
  mcredits: 'MC',
  token: 'TK',
  project: 'PJ',
  liquidity: 'LQ',
  liquidity_building: 'LB',
  smartdrop: 'SD',
  security: 'SC',
  ecosystem: 'EV',
}

export const PassportActivityDesktopRow: React.FC<{
  item: PassportActivityItem
  isLast?: boolean
}> = ({ item, isLast }) => (
  <Row data-testid="passport-activity-row" data-last={isLast ? 'true' : 'false'} data-category={item.category}>
    <Icon $cat={item.category} aria-hidden="true">
      {ICON_MARK[item.category]}
    </Icon>
    <Main>
      <Title>{item.title}</Title>
      <Context>{item.context}</Context>
    </Main>
    <ValueCol>
      {item.value ? (
        <Value $tone={item.valueTone} data-testid="passport-activity-value">
          {item.value}
        </Value>
      ) : null}
    </ValueCol>
    <TimeCol>
      <Time dateTime={item.exactTimestamp} title={item.exactTimestamp}>
        {item.relativeTime}
      </Time>
      {item.evidenceUrl || item.destination ? (
        <Evidence
          href={(item.evidenceUrl || item.destination) as string}
          aria-label={`View details for ${item.title}${item.context ? ` — ${item.context}` : ''}`}
          target={item.evidenceUrl ? '_blank' : undefined}
          rel={item.evidenceUrl ? 'noopener noreferrer' : undefined}
        >
          ›
        </Evidence>
      ) : null}
    </TimeCol>
  </Row>
)

export const PassportActivityMobileCard: React.FC<{ item: PassportActivityItem }> = ({ item }) => (
  <Card data-testid="passport-activity-mobile-card" data-category={item.category}>
    <CardTop>
      <Icon $cat={item.category} aria-hidden="true">
        {ICON_MARK[item.category]}
      </Icon>
      <CardMeta>
        <Title>{item.title}</Title>
      </CardMeta>
      <Time dateTime={item.exactTimestamp} title={item.exactTimestamp}>
        {item.relativeTime}
      </Time>
    </CardTop>
    <Context>{item.context}</Context>
    <CardBottom>
      {item.value ? <Value $tone={item.valueTone}>{item.value}</Value> : <span />}
      {item.evidenceUrl || item.destination ? (
        <Evidence
          href={(item.evidenceUrl || item.destination) as string}
          aria-label={`View details for ${item.title}`}
        >
          ›
        </Evidence>
      ) : null}
    </CardBottom>
  </Card>
)
