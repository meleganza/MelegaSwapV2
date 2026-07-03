import React from 'react'
import styled, { keyframes } from 'styled-components'
import { DISCOVERY_PIPELINE } from '../importTokenData'
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

const StepRow = styled.div<{ $delay: number }>`
  display: flex;
  align-items: center;
  gap: 10px;
  animation: ${keyframes`
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  `} ${importTokenLayout.arrowAnim} ease-out both;
  animation-delay: ${({ $delay }) => $delay}ms;
`

const checkPulse = keyframes`
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
`

const CheckWrap = styled.span`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 1px solid ${importTokenColors.green};
  background: rgba(27, 231, 122, 0.1);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  animation: ${checkPulse} ${importTokenLayout.arrowAnim} ease-in-out infinite;
`

const StepLabel = styled.span`
  font-family: ${IT_FONT_BODY};
  font-size: 13px;
  font-weight: 600;
  color: ${importTokenColors.white};
`

const Arrow = styled.span`
  color: ${importTokenColors.gold};
  font-size: 12px;
  margin-left: 6px;
  animation: ${keyframes`
    0%, 100% { opacity: 0.45; }
    50% { opacity: 1; }
  `} ${importTokenLayout.arrowAnim} ease-in-out infinite;
`

export const AIDiscoveryPipeline: React.FC = () => (
  <Panel data-iet-discovery-pipeline>
    <ItSectionLabel>Step 2 — AI Discovery</ItSectionLabel>
    <Pipeline>
      {DISCOVERY_PIPELINE.map((step, i) => (
        <React.Fragment key={step.id}>
          {i > 0 ? <Arrow aria-hidden>↓</Arrow> : null}
          <StepRow $delay={i * 80}>
            <CheckWrap>
              <IconCheck size={12} />
            </CheckWrap>
            <StepLabel>{step.label}</StepLabel>
          </StepRow>
        </React.Fragment>
      ))}
    </Pipeline>
  </Panel>
)

export default AIDiscoveryPipeline
