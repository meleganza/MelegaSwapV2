import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { AI_OPPORTUNITY, AI_WARNINGS, RECENT_DISCOVERIES } from '../radarStudioData'
import { RADAR_FONT_BODY, RADAR_FONT_DISPLAY, radarStudioColors, radarStudioLayout } from '../radarStudioTokens'
import { OpportunityGauge, RdPanel, RdSectionTitle, StatusDot } from './radarStudioPrimitives'

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
  width: 100%;
  max-width: ${radarStudioLayout.opsPanelWidth};
`

const Panel = styled(RdPanel)`
  width: ${radarStudioLayout.opsPanelWidth};
  max-width: 100%;
  padding: 16px;
  background: ${radarStudioColors.panel};
  border-color: ${radarStudioColors.borderMuted};
`

const OpportunityPanel = styled(Panel)`
  height: ${radarStudioLayout.opportunityHeight};
  min-height: ${radarStudioLayout.opportunityHeight};
`

const WarningsPanel = styled(Panel)`
  height: ${radarStudioLayout.warningsHeight};
  min-height: ${radarStudioLayout.warningsHeight};
`

const RecentPanel = styled(Panel)`
  height: ${radarStudioLayout.recentHeight};
  min-height: ${radarStudioLayout.recentHeight};
`

const GaugeWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
`

const RecLabel = styled.div`
  font-family: ${RADAR_FONT_DISPLAY};
  font-size: 16px;
  font-weight: 800;
  color: ${radarStudioColors.green};
`

const RecSummary = styled.p`
  margin: 0;
  font-family: ${RADAR_FONT_BODY};
  font-size: 12px;
  line-height: 18px;
  color: ${radarStudioColors.muted};
`

const WarningRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  height: 28px;
  font-family: ${RADAR_FONT_BODY};
  font-size: 12px;
  color: ${radarStudioColors.secondary};
`

const FeedRow = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 6px 8px;
  align-items: baseline;
  height: 30px;
  font-family: ${RADAR_FONT_BODY};
  font-size: 11px;
  color: ${radarStudioColors.muted};
`

const FeedTime = styled.span`
  font-family: ${RADAR_FONT_DISPLAY};
  font-size: 10px;
  color: ${radarStudioColors.label};
`

const FeedProject = styled.span`
  font-family: ${RADAR_FONT_DISPLAY};
  font-weight: 700;
  color: ${radarStudioColors.white};
`

const FeedConf = styled.span`
  font-family: ${RADAR_FONT_DISPLAY};
  font-size: 10px;
  font-weight: 700;
  color: ${radarStudioColors.green};
`

export const RadarOpsRightColumn: React.FC = () => {
  const [animatedScore, setAnimatedScore] = useState(0)

  useEffect(() => {
    const t = window.setTimeout(() => setAnimatedScore(AI_OPPORTUNITY.score), 80)
    return () => window.clearTimeout(t)
  }, [])

  return (
    <Column data-rd-ops-right>
      <OpportunityPanel data-rd-panel>
        <RdSectionTitle style={{ fontSize: 18, marginBottom: 8 }}>AI Opportunity Score</RdSectionTitle>
        <GaugeWrap>
          <OpportunityGauge score={AI_OPPORTUNITY.score} animated={animatedScore} />
          <RecLabel>{AI_OPPORTUNITY.recommendation}</RecLabel>
          <RecSummary>{AI_OPPORTUNITY.summary}</RecSummary>
        </GaugeWrap>
      </OpportunityPanel>

      <WarningsPanel data-rd-panel>
        <RdSectionTitle style={{ fontSize: 18, marginBottom: 8 }}>Warnings</RdSectionTitle>
        {AI_WARNINGS.map((row) => (
          <WarningRow key={row.label}>
            <StatusDot level={row.level} />
            {row.label}
          </WarningRow>
        ))}
      </WarningsPanel>

      <RecentPanel data-rd-panel>
        <RdSectionTitle style={{ fontSize: 18, marginBottom: 8 }}>Recent Discoveries</RdSectionTitle>
        {RECENT_DISCOVERIES.map((row) => (
          <FeedRow key={`${row.time}-${row.project}`}>
            <FeedTime>{row.time}</FeedTime>
            <div>
              <FeedProject>{row.project}</FeedProject> · {row.event}
            </div>
            <FeedConf>{row.confidence}</FeedConf>
          </FeedRow>
        ))}
      </RecentPanel>
    </Column>
  )
}

export default RadarOpsRightColumn
