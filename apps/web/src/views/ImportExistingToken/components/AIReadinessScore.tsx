import React from 'react'
import styled from 'styled-components'
import { READINESS_LABEL, READINESS_REASONS, READINESS_SCORE } from '../importTokenData'
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

export const AIReadinessScore: React.FC = () => (
  <Panel data-iet-readiness-score>
    <ItSectionLabel style={{ alignSelf: 'flex-start' }}>Step 4 — AI Readiness Score</ItSectionLabel>
    <ItGauge $score={READINESS_SCORE} data-iet-gauge>
      <ItGaugeValue>{READINESS_SCORE}%</ItGaugeValue>
      <ItGaugeLabel>{READINESS_LABEL}</ItGaugeLabel>
    </ItGauge>
    <Reasons>
      {READINESS_REASONS.map((r) => (
        <ReasonRow key={r.label}>
          <ReasonLeft>
            <ItStatusDot $tone={r.tone} />
            {r.label}
          </ReasonLeft>
        </ReasonRow>
      ))}
    </Reasons>
  </Panel>
)

export default AIReadinessScore
