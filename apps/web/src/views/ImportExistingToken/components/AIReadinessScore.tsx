import React from 'react'
import styled from 'styled-components'
import { useImportRuntime } from '../importExistingTokenRuntime/ImportRuntimeContext'
import { IT_FONT_BODY, importTokenColors } from '../importTokenTokens'
import { ItGauge, ItGaugeLabel, ItGaugeValue, ItPanel, ItSectionLabel, ItStatusDot } from './importTokenPrimitives'

const Panel = styled(ItPanel)`
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`

const Reasons = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const ReasonRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-family: ${IT_FONT_BODY};
  font-size: 13px;
  color: ${importTokenColors.body};
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid ${importTokenColors.border};
  background: rgba(255, 255, 255, 0.02);
`

const ReasonLeft = styled.span`
  display: flex;
  align-items: center;
  gap: 8px;
`

export const AIReadinessScore: React.FC = () => {
  const { analysis } = useImportRuntime()
  if (!analysis) return null

  const score = analysis.score.score
  const label =
    analysis.pending ? 'Pending Review' : score >= 70 ? 'Indexed' : score > 0 ? 'Incomplete' : 'Unavailable'

  return (
    <Panel data-iet-readiness-score>
      <ItSectionLabel style={{ alignSelf: 'flex-start' }}>Step 4 — Infrastructure Score</ItSectionLabel>
      <ItGauge $score={score} data-iet-gauge>
        <ItGaugeValue>{score}%</ItGaugeValue>
        <ItGaugeLabel>{label}</ItGaugeLabel>
      </ItGauge>
      <Reasons>
        <ReasonRow>
          <ReasonLeft>
            <ItStatusDot $tone={score >= 70 ? 'green' : score >= 40 ? 'yellow' : 'red'} />
            {analysis.score.reason}
          </ReasonLeft>
        </ReasonRow>
        {analysis.detections.slice(0, 6).map((d) => (
          <ReasonRow key={d.label}>
            <ReasonLeft>
              <ItStatusDot $tone={d.available ? 'green' : 'red'} />
              {d.label}
            </ReasonLeft>
            <span>{d.available ? 'Available' : 'Unavailable'}</span>
          </ReasonRow>
        ))}
      </Reasons>
    </Panel>
  )
}

export default AIReadinessScore
