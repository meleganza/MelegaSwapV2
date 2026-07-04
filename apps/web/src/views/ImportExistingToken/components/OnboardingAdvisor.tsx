import React, { useState } from 'react'
import styled from 'styled-components'
import { useImportRuntime } from '../importExistingTokenRuntime/ImportRuntimeContext'
import { IT_FONT_BODY, importTokenColors } from '../importTokenTokens'
import { ItPanel } from './importTokenPrimitives'

const Panel = styled(ItPanel)`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  position: sticky;
  top: 24px;

  @media (max-width: 768px) {
    position: static;
  }
`

const Title = styled.h3`
  margin: 0;
  font-family: ${IT_FONT_BODY};
  font-size: 18px;
  font-weight: 700;
  color: ${importTokenColors.white};
`

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  font-family: ${IT_FONT_BODY};
  font-size: 13px;
`

const RowLabel = styled.span`
  color: ${importTokenColors.label};
  font-weight: 600;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
`

const RowValue = styled.span`
  color: ${importTokenColors.white};
  font-weight: 600;
  text-align: right;
`

const Body = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: ${importTokenColors.body};
`

export const OnboardingAdvisor: React.FC = () => {
  const { analysis, advisor } = useImportRuntime()

  if (!analysis) return null

  if (analysis.pending) {
    return (
      <Panel data-iet-advisor>
        <Title>Review State</Title>
        <Body>
          Contract submitted to pending registry. External market metadata remains Unavailable until review
          completes.
        </Body>
        <Row>
          <RowLabel>Status</RowLabel>
          <RowValue>Pending Review</RowValue>
        </Row>
        <Row>
          <RowLabel>Readiness</RowLabel>
          <RowValue>{analysis.score.score}/100</RowValue>
        </Row>
      </Panel>
    )
  }

  if (!advisor) {
    return (
      <Panel data-iet-advisor>
        <Title>Advisor</Title>
        <Body>{analysis.summary || 'No canonical project detected for this contract.'}</Body>
      </Panel>
    )
  }

  return (
    <Panel data-iet-advisor>
      <Title>Build Advisor</Title>
      <Row>
        <RowLabel>Confidence</RowLabel>
        <RowValue>{advisor.confidence}%</RowValue>
      </Row>
      <Row>
        <RowLabel>Infrastructure</RowLabel>
        <RowValue>{advisor.infrastructureReady}%</RowValue>
      </Row>
      <Row>
        <RowLabel>Next Action</RowLabel>
        <RowValue>{advisor.nextAction}</RowValue>
      </Row>
      <Body>{advisor.reasoning[0]}</Body>
    </Panel>
  )
}

export default OnboardingAdvisor
