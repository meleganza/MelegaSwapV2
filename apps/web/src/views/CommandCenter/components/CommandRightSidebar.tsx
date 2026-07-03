import React from 'react'
import styled from 'styled-components'
import { AI_RECOMMENDATIONS, NOTIFICATIONS, REPORTS } from '../commandCenterData'
import { CC_FONT_BODY, commandCenterColors } from '../commandCenterTokens'
import { CcCardHeader, CcPanel, CcPill, CcTitle } from './commandCenterPrimitives'

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const Panel = styled(CcPanel)`
  padding: 18px;
`

const RecRow = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
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
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: ${({ $tone }) => $tone};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
`

const RecTitle = styled.div`
  font-family: ${CC_FONT_BODY};
  font-size: 13px;
  font-weight: 700;
  color: ${commandCenterColors.white};
  transition: color 180ms ease;
`

const RecDesc = styled.div`
  font-family: ${CC_FONT_BODY};
  font-size: 11px;
  color: ${commandCenterColors.muted};
  margin-top: 2px;
`

const Chevron = styled.span`
  color: ${commandCenterColors.gold};
  margin-left: auto;
`

const NotifRow = styled.div`
  padding: 10px 0;
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
`

const NotifTime = styled.div`
  font-size: 11px;
  color: ${commandCenterColors.muted};
  margin-top: 2px;
`

const ReportRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  font-family: ${CC_FONT_BODY};
  font-size: 12px;
  color: ${commandCenterColors.body};

  &:last-child {
    border-bottom: none;
  }
`

const iconTone: Record<string, string> = {
  rebalance: 'rgba(214,180,69,0.15)',
  claim: 'rgba(27,231,122,0.12)',
  pool: 'rgba(139,124,246,0.15)',
  radar: 'rgba(27,231,122,0.12)',
  audit: 'rgba(244,197,66,0.12)',
}

const iconEmoji: Record<string, string> = {
  rebalance: '⚖',
  claim: '💰',
  pool: '🏊',
  radar: '📡',
  audit: '📋',
}

const reportTone = (s: string) => {
  if (s === 'Completed') return 'green' as const
  if (s === 'In Progress') return 'yellow' as const
  return 'gold' as const
}

export const CommandRightSidebar: React.FC = () => (
  <Stack data-cc-right-sidebar>
    <Panel>
      <CcCardHeader>
        <CcTitle>AI Recommendations</CcTitle>
      </CcCardHeader>
      {AI_RECOMMENDATIONS.map((r) => (
        <RecRow key={r.id} type="button">
          <Icon $tone={iconTone[r.icon]}>{iconEmoji[r.icon]}</Icon>
          <div>
            <RecTitle className="cc-rec-title">{r.title}</RecTitle>
            <RecDesc>{r.description}</RecDesc>
          </div>
          <Chevron>›</Chevron>
        </RecRow>
      ))}
    </Panel>

    <Panel>
      <CcCardHeader>
        <CcTitle>Notifications</CcTitle>
      </CcCardHeader>
      {NOTIFICATIONS.map((n) => (
        <NotifRow key={n.id}>
          <NotifTitle>{n.title}</NotifTitle>
          <NotifTime>{n.time}</NotifTime>
        </NotifRow>
      ))}
    </Panel>

    <Panel>
      <CcCardHeader>
        <CcTitle>Professional Reports</CcTitle>
      </CcCardHeader>
      {REPORTS.map((r) => (
        <ReportRow key={r.id}>
          <span>{r.title}</span>
          <CcPill $tone={reportTone(r.status)}>{r.status}</CcPill>
        </ReportRow>
      ))}
    </Panel>
  </Stack>
)

export default CommandRightSidebar
