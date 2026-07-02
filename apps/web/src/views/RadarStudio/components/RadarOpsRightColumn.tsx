import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { AI_OPPORTUNITY, AI_WARNINGS, RECENT_DISCOVERIES } from '../radarStudioData'
import { RADAR_FONT_BODY, RADAR_FONT_DISPLAY, radarStudioColors, radarStudioLayout } from '../radarStudioTokens'
import { RdPanel, RdSectionTitle, StatusDot } from './radarStudioPrimitives'

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
`

const Panel = styled(RdPanel)`
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const GaugeWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
`

const Gauge = styled.div<{ $score: number; $animated: number }>`
  width: ${radarStudioLayout.gaugeSize};
  height: ${radarStudioLayout.gaugeSize};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${RADAR_FONT_DISPLAY};
  font-size: 32px;
  font-weight: 700;
  color: ${radarStudioColors.green};
  background: conic-gradient(
    ${radarStudioColors.green} ${({ $animated }) => $animated * 3.6}deg,
    rgba(255, 255, 255, 0.08) 0
  );
  position: relative;
  flex-shrink: 0;
  transition: background 1200ms ease-out;

  &::after {
    content: '';
    position: absolute;
    inset: 14px;
    border-radius: 50%;
    background: ${radarStudioColors.panel};
  }

  span {
    position: relative;
    z-index: 1;
  }
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
  line-height: 1.45;
  color: ${radarStudioColors.secondary};
`

const WarningRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: ${RADAR_FONT_BODY};
  font-size: 12px;
  color: ${radarStudioColors.secondary};
`

const FeedRow = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 6px 8px;
  align-items: baseline;
  font-family: ${RADAR_FONT_BODY};
  font-size: 11px;
  color: ${radarStudioColors.secondary};
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`

const FeedTime = styled.span`
  font-family: ${RADAR_FONT_DISPLAY};
  font-size: 10px;
  color: ${radarStudioColors.grey};
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
      <Panel data-rd-panel>
        <RdSectionTitle style={{ fontSize: 18, marginBottom: 6 }}>AI Opportunity Score</RdSectionTitle>
        <GaugeWrap>
          <Gauge $score={AI_OPPORTUNITY.score} $animated={animatedScore} data-rd-gauge>
            <span>{AI_OPPORTUNITY.score}</span>
          </Gauge>
          <RecLabel>{AI_OPPORTUNITY.recommendation}</RecLabel>
          <RecSummary>{AI_OPPORTUNITY.summary}</RecSummary>
        </GaugeWrap>
      </Panel>

      <Panel data-rd-panel>
        <RdSectionTitle style={{ fontSize: 18, marginBottom: 6 }}>Warnings</RdSectionTitle>
        {AI_WARNINGS.map((row) => (
          <WarningRow key={row.label}>
            <StatusDot level={row.level} />
            {row.label}
          </WarningRow>
        ))}
      </Panel>

      <Panel data-rd-panel>
        <RdSectionTitle style={{ fontSize: 18, marginBottom: 6 }}>Recent Discoveries</RdSectionTitle>
        {RECENT_DISCOVERIES.map((row) => (
          <FeedRow key={`${row.time}-${row.project}`}>
            <FeedTime>{row.time}</FeedTime>
            <div>
              <FeedProject>{row.project}</FeedProject> · {row.event}
            </div>
            <FeedConf>{row.confidence}</FeedConf>
          </FeedRow>
        ))}
      </Panel>
    </Column>
  )
}

export default RadarOpsRightColumn
