import React from 'react'
import styled from 'styled-components'
import { FLOW_STEPS } from '../buildStudioData'
import { BS_FONT_BODY, BS_FONT_DISPLAY, buildStudioColors } from '../buildStudioTokens'
import { BsPanel } from './buildStudioPrimitives'

const Inner = styled.div`
  padding: 24px;
`

const Flow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  overflow-x: auto;
  padding: 8px 0;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`

const Step = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
`

const Node = styled.div<{ $last?: boolean }>`
  width: 88px;
  height: 44px;
  border-radius: 12px;
  border: 1px solid ${({ $last }) => ($last ? buildStudioColors.green : buildStudioColors.border)};
  background: ${({ $last }) => ($last ? 'rgba(27,231,122,0.1)' : 'rgba(255,255,255,0.03)')};
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${BS_FONT_BODY};
  font-size: 11px;
  font-weight: 700;
  color: ${({ $last }) => ($last ? buildStudioColors.green : buildStudioColors.white)};
  text-align: center;
`

const Connector = styled.div`
  width: 24px;
  height: 2px;
  background: linear-gradient(90deg, ${buildStudioColors.gold}, ${buildStudioColors.green});
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 2px;
    height: 16px;
    background: linear-gradient(180deg, ${buildStudioColors.gold}, ${buildStudioColors.green});
  }
`

const Arrow = styled.span`
  font-size: 10px;
  color: ${buildStudioColors.muted};

  @media (max-width: 768px) {
    display: block;
  }

  @media (min-width: 769px) {
    display: none;
  }
`

export const InfrastructureFlow: React.FC = () => (
  <BsPanel data-bs-panel data-bs-infrastructure-flow>
    <Inner>
      <h2
        style={{
          margin: '0 0 16px',
          fontFamily: BS_FONT_DISPLAY,
          fontSize: 28,
          fontWeight: 600,
          color: buildStudioColors.white,
        }}
      >
        Infrastructure Flow
      </h2>
      <Flow>
        {FLOW_STEPS.map((step, i) => (
          <React.Fragment key={step}>
            <Step>
              <Node $last={i === FLOW_STEPS.length - 1}>{step}</Node>
              {i < FLOW_STEPS.length - 1 ? <Arrow>↓</Arrow> : null}
            </Step>
            {i < FLOW_STEPS.length - 1 ? <Connector data-bs-flow-connector /> : null}
          </React.Fragment>
        ))}
      </Flow>
    </Inner>
  </BsPanel>
)

export default InfrastructureFlow
