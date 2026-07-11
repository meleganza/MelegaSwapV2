import React from 'react'
import styled from 'styled-components'
import { useBuildRuntime } from '../buildRuntime/BuildRuntimeContext'
import { BS_FONT_BODY, BS_FONT_DISPLAY, buildStudioColors, buildStudioLayout } from '../buildStudioTokens'
import { BsGauge, BsGaugeLabel, BsGaugeValue, BsPanel } from './buildStudioPrimitives'

const Inner = styled.div`
  padding: 20px;
  min-height: ${buildStudioLayout.advisorH};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-x: hidden;
  overflow-y: auto;
`

const Title = styled.h3`
  margin: 0;
  font-family: ${BS_FONT_DISPLAY};
  font-size: 18px;
  font-weight: 700;
  color: ${buildStudioColors.white};
`

const WorkflowLabel = styled.div`
  font-family: ${BS_FONT_BODY};
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: ${buildStudioColors.label};
`

const WorkflowList = styled.ol`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const WorkflowStep = styled.li`
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: ${BS_FONT_BODY};
  font-size: 12px;
  font-weight: 600;
  color: ${buildStudioColors.body};
  line-height: 1.3;
`

const StepArrow = styled.span`
  color: ${buildStudioColors.gold};
  font-size: 11px;
  margin-left: 4px;
`

const ConfidenceRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding-top: 4px;
`

const ConfidenceLabel = styled.span`
  font-family: ${BS_FONT_BODY};
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${buildStudioColors.label};
`

const ConfidenceValue = styled.span`
  font-family: ${BS_FONT_DISPLAY};
  font-size: 22px;
  font-weight: 700;
  color: ${buildStudioColors.green};
`

const ReasoningBlock = styled.div`
  padding-top: 4px;
`

const ReasoningLabel = styled.div`
  font-family: ${BS_FONT_BODY};
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${buildStudioColors.label};
  margin-bottom: 4px;
`

const ReasoningText = styled.p`
  margin: 0;
  font-family: ${BS_FONT_BODY};
  font-size: 12px;
  line-height: 18px;
  color: ${buildStudioColors.muted};
`

const GaugeWrap = styled.div`
  margin-top: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding-top: 6px;
`

const NextAction = styled.div`
  font-family: ${BS_FONT_BODY};
  font-size: 11px;
  color: ${buildStudioColors.gold};
  margin-top: 4px;
`

export const AIBuildAdvisorPanel: React.FC = () => {
  const { advisor } = useBuildRuntime()

  return (
    <BsPanel data-bs-panel data-bs-advisor $minHeight={buildStudioLayout.advisorH}>
      <Inner>
        <Title>AI Build Advisor</Title>

        <WorkflowLabel>Recommended Workflow</WorkflowLabel>
        <WorkflowList>
          {advisor.workflow.map((step, i) => (
            <WorkflowStep key={step}>
              {i > 0 ? <StepArrow aria-hidden>↓</StepArrow> : null}
              {step}
            </WorkflowStep>
          ))}
        </WorkflowList>

        <ConfidenceRow>
          <ConfidenceLabel>Confidence</ConfidenceLabel>
          <ConfidenceValue>{advisor.confidence}%</ConfidenceValue>
        </ConfidenceRow>

        <NextAction>Next: {advisor.nextAction} · D87 {advisor.d87Contribution}</NextAction>

        <ReasoningBlock>
          <ReasoningLabel>Reasoning</ReasoningLabel>
          {advisor.reasoning.map((line) => (
            <ReasoningText key={line}>{line}</ReasoningText>
          ))}
        </ReasoningBlock>

        <GaugeWrap>
          <BsGauge $score={advisor.infrastructureReady}>
            <BsGaugeValue>{advisor.infrastructureReady}</BsGaugeValue>
            <BsGaugeLabel>Infrastructure Ready</BsGaugeLabel>
          </BsGauge>
        </GaugeWrap>
      </Inner>
    </BsPanel>
  )
}

export default AIBuildAdvisorPanel
