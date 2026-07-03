import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useRadarRuntime } from '../radarRuntime/RadarRuntimeContext'
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

const MachineToggle = styled.button`
  margin-top: 10px;
  border: none;
  background: transparent;
  color: ${radarStudioColors.muted};
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  text-align: left;
`

const MachinePre = styled.pre`
  margin: 8px 0 0;
  padding: 8px;
  border-radius: 8px;
  background: #0c0c0c;
  border: 1px solid ${radarStudioColors.border};
  font-size: 9px;
  line-height: 1.35;
  color: ${radarStudioColors.muted};
  max-height: 80px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-word;
`

const SourceRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: ${radarStudioColors.muted};
  height: 22px;
  align-items: center;
`

export const RadarOpsRightColumn: React.FC = () => {
  const {
    opportunity,
    warnings,
    recentDiscoveries,
    highestConfidence,
    topContracts,
    aiRecommendation,
    sources,
    machine,
  } = useRadarRuntime()
  const [animatedScore, setAnimatedScore] = useState(0)
  const [machineOpen, setMachineOpen] = useState(false)

  useEffect(() => {
    const t = window.setTimeout(() => setAnimatedScore(opportunity.score), 80)
    return () => window.clearTimeout(t)
  }, [opportunity.score])

  return (
    <Column data-rd-ops-right>
      <Panel data-rd-panel>
        <RdSectionTitle style={{ fontSize: 18, marginBottom: 10 }}>AI Opportunity Score</RdSectionTitle>
        <GaugeWrap>
          <OpportunityGauge score={opportunity.score} animated={animatedScore} />
          <RecBlock>
            <RecLabel>Recommendation</RecLabel>
            <RecValue>{opportunity.recommendation}</RecValue>
            <RecLabel style={{ marginTop: 10 }}>Confidence</RecLabel>
            <RecValue>{opportunity.confidence}%</RecValue>
            <RecLabel style={{ marginTop: 10 }}>Reason</RecLabel>
            <ReasonList>
              {opportunity.reasons.map((r) => (
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
        {warnings.map((row) => (
          <WarningRow key={row.label}>
            <StatusDot level={row.level} />
            {row.label}
          </WarningRow>
        ))}
      </Panel>

      <Panel data-rd-panel>
        <RdSectionTitle style={{ fontSize: 18, marginBottom: 10 }}>Data Sources</RdSectionTitle>
        {sources.map((s) => (
          <SourceRow key={s.key}>
            <span>{s.label}</span>
            <span style={{ color: s.available ? radarStudioColors.green : radarStudioColors.muted }}>
              {s.available ? s.lastUpdate ?? 'Available' : 'Unavailable'}
            </span>
          </SourceRow>
        ))}
      </Panel>

      <Panel data-rd-panel>
        <RdSectionTitle style={{ fontSize: 18, marginBottom: 10 }}>Recent Discoveries</RdSectionTitle>
        {recentDiscoveries.map((row) => (
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
        {highestConfidence.map((row) => (
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
        {topContracts.map((row) => (
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
        <RdSectionTitle style={{ fontSize: 18, marginBottom: 6 }}>{aiRecommendation.title}</RdSectionTitle>
        <RecValue style={{ fontSize: 15 }}>{aiRecommendation.action}</RecValue>
        <AiRecText>{aiRecommendation.detail}</AiRecText>
        <RecLabel style={{ marginTop: 10 }}>Confidence</RecLabel>
        <RecValue style={{ fontSize: 16 }}>{aiRecommendation.confidence}</RecValue>
        <MachineToggle type="button" onClick={() => setMachineOpen((v) => !v)}>
          {machineOpen ? 'Hide' : 'Show'} machine-readable runtime
        </MachineToggle>
        {machineOpen && (
          <MachinePre data-rd-machine-json>{JSON.stringify(machine, null, 2)}</MachinePre>
        )}
      </Panel>
    </Column>
  )
}

export default RadarOpsRightColumn
