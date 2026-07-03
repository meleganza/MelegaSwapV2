import React from 'react'
import styled from 'styled-components'
import { useCommandRuntime } from '../commandCenterRuntime/CommandRuntimeContext'
import { recommendationIconEmoji, recommendationIconTone, safeArray } from '../commandCenterSafe'
import { CC_FONT_BODY, commandCenterColors } from '../commandCenterTokens'
import { CcCardHeader, CcDashCard, CcPill, CcTitle } from './commandCenterPrimitives'

const RecRow = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  background: transparent;
  text-align: left;
  cursor: pointer;
  color: inherit;

  &:last-child {
    border-bottom: none;
  }

  &:hover .cc-rec-title {
    color: ${commandCenterColors.gold};
  }
`

const Icon = styled.span<{ $tone: string }>`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: ${({ $tone }) => $tone};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
`

const RecTitle = styled.div`
  font-family: ${CC_FONT_BODY};
  font-size: 12px;
  font-weight: 700;
  color: ${commandCenterColors.white};
  transition: color 180ms ease;
`

const RecDesc = styled.div`
  font-family: ${CC_FONT_BODY};
  font-size: 10px;
  color: ${commandCenterColors.muted};
  margin-top: 2px;
  line-height: 1.35;
`

const Chevron = styled.span`
  color: ${commandCenterColors.gold};
  margin-left: auto;
  flex-shrink: 0;
`

const NotifRow = styled.div`
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  font-family: ${CC_FONT_BODY};
  font-size: 12px;

  &:last-child {
    border-bottom: none;
  }
`

const NotifTitle = styled.div`
  font-weight: 600;
  color: ${commandCenterColors.white};
  font-size: 11px;
`

const NotifTime = styled.div`
  font-size: 10px;
  color: ${commandCenterColors.muted};
  margin-top: 2px;
`

const ReportRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  font-family: ${CC_FONT_BODY};
  font-size: 11px;
  color: ${commandCenterColors.body};

  &:last-child {
    border-bottom: none;
  }
`

const reportTone = (s: string) => {
  if (s === 'Completed') return 'green' as const
  if (s === 'In Progress') return 'yellow' as const
  return 'gold' as const
}

export const CommandRightSidebar: React.FC = () => {
  const { recommendations, notifications, reports } = useCommandRuntime()
  const recs = safeArray(recommendations)
  const notifs = safeArray(notifications)
  const reportRows = safeArray(reports)

  return (
    <>
      <CcDashCard data-cc-ai-recommendations>
        <CcCardHeader style={{ marginBottom: 0 }}>
          <CcTitle>AI Recommendations</CcTitle>
        </CcCardHeader>
        {recs.length === 0 ? (
          <RecDesc style={{ padding: '8px 0' }}>No recommendations from Projects, Radar, or Build runtimes.</RecDesc>
        ) : (
          recs.map((r) => (
            <RecRow key={r.id} type="button">
              <Icon $tone={recommendationIconTone(r.icon)}>{recommendationIconEmoji(r.icon)}</Icon>
              <div style={{ minWidth: 0 }}>
                <RecTitle className="cc-rec-title">{r.title}</RecTitle>
                <RecDesc>{r.description}</RecDesc>
              </div>
              <Chevron>›</Chevron>
            </RecRow>
          ))
        )}
      </CcDashCard>

      <CcDashCard data-cc-notifications>
        <CcCardHeader style={{ marginBottom: 0 }}>
          <CcTitle>Notifications</CcTitle>
        </CcCardHeader>
        {notifs.length === 0 ? (
          <NotifTitle style={{ padding: '8px 0', fontWeight: 400, color: commandCenterColors.muted }}>
            No runtime notifications yet.
          </NotifTitle>
        ) : (
          notifs.map((n) => (
            <NotifRow key={n.id}>
              <NotifTitle>{n.title}</NotifTitle>
              <NotifTime>{n.time}</NotifTime>
            </NotifRow>
          ))
        )}
      </CcDashCard>

      <CcDashCard data-cc-reports>
        <CcCardHeader style={{ marginBottom: 0 }}>
          <CcTitle>Professional Reports</CcTitle>
        </CcCardHeader>
        {reportRows.length === 0 ? (
          <ReportRow>
            <span>Unavailable</span>
            <CcPill $tone="gold">Unavailable</CcPill>
          </ReportRow>
        ) : (
          reportRows.map((r) => (
            <ReportRow key={r.id}>
              <span>{r.title}</span>
              <CcPill $tone={reportTone(r.status)}>{r.status}</CcPill>
            </ReportRow>
          ))
        )}
      </CcDashCard>
    </>
  )
}

export default CommandRightSidebar
