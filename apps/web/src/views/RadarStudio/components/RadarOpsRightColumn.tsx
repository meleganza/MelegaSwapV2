import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import {
  AI_OPPORTUNITY,
  AI_RECOMMENDATION,
  AI_WARNINGS,
  HIGHEST_CONFIDENCE_TODAY,
  RECENT_DISCOVERIES,
  TOP_CONTRACTS,
} from '../radarStudioData'
import { RADAR_FONT_BODY, RADAR_FONT_DISPLAY, radarStudioColors, radarStudioLayout } from '../radarStudioTokens'
import { OpportunityGauge, RadarProjectLogo, RdGhostBtn, RdPanel, RdSectionTitle, StatusDot } from './radarStudioPrimitives'

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
  width: 100%;
  max-width: ${radarStudioLayout.opsPanelWidth};
`

const Panel = styled(RdPanel)`
  width: ${radarStudioLayout.opsPanelWidth};
  max-width: 100%;
  padding: ${radarStudioLayout.cardPadding};
`

const GaugeWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
`

const RecBlock = styled.div`
  width: 100%;
  text-align: left;
`

const RecLabel = styled.div`
  font-family: ${RADAR_FONT_BODY};
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${radarStudioColors.label};
`

const RecValue = styled.div`
  font-family: ${RADAR_FONT_DISPLAY};
  font-size: 18px;
  font-weight: 800;
  color: ${radarStudioColors.green};
  margin-top: 4px;
`

const ReasonList = styled.ul`
  margin: 10px 0 0;
  padding-left: 16px;
  font-family: ${RADAR_FONT_BODY};
  font-size: 12px;
  line-height: 18px;
  font-weight: 500;
  color: ${radarStudioColors.secondary};
`

const WarningRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  height: 28px;
  font-family: ${RADAR_FONT_BODY};
  font-size: 12px;
  font-weight: 500;
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
  font-weight: 500;
  color: ${radarStudioColors.muted};
`

const ConfRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 28px;
  font-family: ${RADAR_FONT_BODY};
  font-size: 12px;
  font-weight: 500;
  color: ${radarStudioColors.secondary};
`

const TopContractRow = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 8px;
  align-items: center;
  height: 32px;
  font-family: ${RADAR_FONT_BODY};
  font-size: 12px;
  font-weight: 500;
  color: ${radarStudioColors.secondary};
`

const AiRecText = styled.p`
  margin: 8px 0 0;
  font-family: ${RADAR_FONT_BODY};
  font-size: 12px;
  line-height: 18px;
  font-weight: 500;
  color: ${radarStudioColors.secondary};
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
        <RdSectionTitle style={{ fontSize: 18, marginBottom: 10 }}>AI Opportunity Score</RdSectionTitle>
        <GaugeWrap>
          <OpportunityGauge score={AI_OPPORTUNITY.score} animated={animatedScore} />
          <RecBlock>
            <RecLabel>Recommendation</RecLabel>
            <RecValue>{AI_OPPORTUNITY.recommendation}</RecValue>
            <RecLabel style={{ marginTop: 10 }}>Confidence</RecLabel>
            <RecValue>{AI_OPPORTUNITY.confidence}%</RecValue>
            <RecLabel style={{ marginTop: 10 }}>Reason</RecLabel>
            <ReasonList>
              {AI_OPPORTUNITY.reasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ReasonList>
          </RecBlock>
          <RdGhostBtn type="button" style={{ width: '100%', marginTop: 8 }}>
            View Complete Analysis
          </RdGhostBtn>
        </GaugeWrap>
      </Panel>

      <Panel data-rd-panel>
        <RdSectionTitle style={{ fontSize: 18, marginBottom: 10 }}>Warnings</RdSectionTitle>
        {AI_WARNINGS.map((row) => (
          <WarningRow key={row.label}>
            <StatusDot level={row.level} />
            {row.label}
          </WarningRow>
        ))}
      </Panel>

      <Panel data-rd-panel>
        <RdSectionTitle style={{ fontSize: 18, marginBottom: 10 }}>Recent Discoveries</RdSectionTitle>
        {RECENT_DISCOVERIES.map((row) => (
          <FeedRow key={`${row.time}-${row.project}`}>
            <span style={{ fontFamily: RADAR_FONT_DISPLAY, fontSize: 10, color: radarStudioColors.label }}>
              {row.time}
            </span>
            <div>
              <span style={{ fontFamily: RADAR_FONT_DISPLAY, fontWeight: 800, color: radarStudioColors.white }}>
                {row.project}
              </span>{' '}
              · {row.event}
            </div>
            <span style={{ fontFamily: RADAR_FONT_DISPLAY, fontWeight: 800, color: radarStudioColors.green }}>
              {row.confidence}
            </span>
          </FeedRow>
        ))}
      </Panel>

      <Panel data-rd-panel>
        <RdSectionTitle style={{ fontSize: 18, marginBottom: 10 }}>Highest Confidence Today</RdSectionTitle>
        {HIGHEST_CONFIDENCE_TODAY.map((row) => (
          <ConfRow key={row.project}>
            <span style={{ fontFamily: RADAR_FONT_DISPLAY, fontWeight: 800, color: radarStudioColors.white }}>
              {row.project}
            </span>
            <span style={{ color: radarStudioColors.muted }}>{row.signal}</span>
            <span style={{ fontFamily: RADAR_FONT_DISPLAY, fontWeight: 800, color: radarStudioColors.green }}>
              {row.confidence}%
            </span>
          </ConfRow>
        ))}
      </Panel>

      <Panel data-rd-panel>
        <RdSectionTitle style={{ fontSize: 18, marginBottom: 10 }}>Top Contracts</RdSectionTitle>
        {TOP_CONTRACTS.map((row) => (
          <TopContractRow key={row.name}>
            <RadarProjectLogo name={row.name} symbol={row.symbol} size={22} />
            <div>
              <div style={{ fontFamily: RADAR_FONT_DISPLAY, fontWeight: 800, color: radarStudioColors.white }}>
                {row.name}
              </div>
              <div style={{ fontSize: 10, color: radarStudioColors.muted }}>{row.signal}</div>
            </div>
            <span style={{ fontFamily: RADAR_FONT_DISPLAY, fontWeight: 800, color: radarStudioColors.green }}>
              {row.confidence}%
            </span>
          </TopContractRow>
        ))}
      </Panel>

      <Panel data-rd-panel>
        <RdSectionTitle style={{ fontSize: 18, marginBottom: 6 }}>{AI_RECOMMENDATION.title}</RdSectionTitle>
        <RecValue style={{ fontSize: 15 }}>{AI_RECOMMENDATION.action}</RecValue>
        <AiRecText>{AI_RECOMMENDATION.detail}</AiRecText>
        <RecLabel style={{ marginTop: 10 }}>Confidence</RecLabel>
        <RecValue style={{ fontSize: 16 }}>{AI_RECOMMENDATION.confidence}</RecValue>
      </Panel>
    </Column>
  )
}

export default RadarOpsRightColumn
