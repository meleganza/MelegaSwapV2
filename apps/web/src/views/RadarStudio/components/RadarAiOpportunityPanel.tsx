import React from 'react'
import styled from 'styled-components'
import { buildAiRecommendations } from 'views/ProjectsStudio/projectsRuntime/buildAiRecommendations'
import { buildOpportunityScore } from '../radarRuntime/buildOpportunityScore'
import { useRadarRuntime } from '../radarRuntime/RadarRuntimeContext'
import {
  RADAR_FONT_BODY,
  RADAR_FONT_DISPLAY,
  radarStudioColors,
  radarStudioLayout,
} from '../radarStudioTokens'
import { RdPanel } from './radarStudioPrimitives'

const Panel = styled(RdPanel)`
  padding: 24px;
  box-sizing: border-box;
`

const Title = styled.h3`
  margin: 0 0 16px;
  font-family: ${RADAR_FONT_DISPLAY};
  font-size: 18px;
  font-weight: 700;
  color: ${radarStudioColors.text};
`

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${radarStudioLayout.advisorRowGap};
`

const Row = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 72px;
  align-items: center;
  gap: 16px;
  height: ${radarStudioLayout.advisorRowHeight};
  min-height: ${radarStudioLayout.advisorRowHeight};
`

const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  overflow: hidden;
  font-family: ${RADAR_FONT_BODY};
  font-size: 14px;
  font-weight: 600;
  line-height: 1.2;
`

const Label = styled.span`
  color: ${radarStudioColors.text};
  white-space: nowrap;
  flex-shrink: 0;
`

const Value = styled.span`
  color: ${radarStudioColors.green};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const Confidence = styled.span`
  font-family: ${RADAR_FONT_BODY};
  font-size: 14px;
  font-weight: 600;
  line-height: 1.2;
  color: ${radarStudioColors.muted};
  text-align: right;
  white-space: nowrap;
`

const LABELS = [
  'Best Long-Term Potential',
  'Highest Growth',
  'Lowest Risk',
  'Best For AI Agents',
  'Emerging Watchlist',
]

export const RadarAiOpportunityPanel: React.FC = () => {
  const { featured } = useRadarRuntime()

  const rows = React.useMemo(() => {
    if (!featured) {
      return LABELS.map((label) => ({ label, value: '—', score: '—' }))
    }
    const recs = buildAiRecommendations(featured)
    const opp = buildOpportunityScore(featured)
    const sym = featured.resources.tokens[0]?.symbol ?? featured.displayName
    return LABELS.map((label, i) => {
      const rec = recs[i]
      if (!rec) return { label, value: '—', score: '—' }
      return {
        label,
        value: sym,
        score: i === 0 ? `${opp.score}/100` : `${opp.confidence}%`,
      }
    })
  }, [featured])

  return (
    <Panel data-rd-ai-opportunity>
      <Title>AI Opportunity Advisor</Title>
      <List>
        {rows.slice(0, 5).map((row) => (
          <Row key={row.label}>
            <Left>
              <Label>{row.label}</Label>
              <Value>{row.value}</Value>
            </Left>
            <Confidence>{row.score}</Confidence>
          </Row>
        ))}
      </List>
    </Panel>
  )
}

export default RadarAiOpportunityPanel
