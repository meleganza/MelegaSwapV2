import React from 'react'
import styled, { keyframes } from 'styled-components'
import { useImportRuntime } from '../importExistingTokenRuntime/ImportRuntimeContext'
import { IT_FONT_BODY, importTokenColors, importTokenLayout } from '../importTokenTokens'
import { IconCheck } from './importTokenIcons'
import { ItPanel, ItSectionLabel } from './importTokenPrimitives'

const Panel = styled(ItPanel)`
  padding: 20px 24px;
`

const Pipeline = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const StepRow = styled.div<{ $delay: number; $complete?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  opacity: ${({ $complete }) => ($complete ? 1 : 0.55)};
  animation: ${keyframes`
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  `} ${importTokenLayout.arrowAnim} ease-out both;
  animation-delay: ${({ $delay }) => $delay}ms;
`

const CheckWrap = styled.span<{ $complete?: boolean }>`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 1px solid ${({ $complete }) => ($complete ? importTokenColors.green : importTokenColors.border)};
  background: ${({ $complete }) => ($complete ? 'rgba(27, 231, 122, 0.1)' : 'transparent')};
  display: inline-flex;
  align-items: center;
  justify-content: center;
`

const StepLabel = styled.span`
  font-family: ${IT_FONT_BODY};
  font-size: 13px;
  font-weight: 600;
  color: ${importTokenColors.white};
`

export const AIDiscoveryPipeline: React.FC = () => {
  const { pipelineSteps } = useImportRuntime()

  return (
    <Panel data-iet-discovery-pipeline>
      <ItSectionLabel>Step 2 — Discovery Pipeline</ItSectionLabel>
      <Pipeline>
        {pipelineSteps.map((step, i) => (
          <StepRow key={step.label} $delay={i * 80} $complete={step.complete}>
            <CheckWrap $complete={step.complete}>{step.complete ? <IconCheck size={12} /> : null}</CheckWrap>
            <StepLabel>{step.label}</StepLabel>
          </StepRow>
        ))}
      </Pipeline>
    </Panel>
  )
}

export default AIDiscoveryPipeline
