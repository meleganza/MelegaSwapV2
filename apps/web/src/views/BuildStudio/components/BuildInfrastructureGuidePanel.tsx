import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { FLOW_STEPS } from '../buildStudioData'
import { BS_FONT_BODY, BS_FONT_DISPLAY, buildStudioColors } from '../buildStudioTokens'
import { BsOutlineBtn } from './buildStudioPrimitives'

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  z-index: 1200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
`

const Panel = styled.div`
  width: min(520px, 100%);
  max-height: min(80vh, 640px);
  overflow-y: auto;
  border-radius: 18px;
  border: 1px solid ${buildStudioColors.border};
  background: ${buildStudioColors.panel};
  padding: 22px;
  box-sizing: border-box;
`

const Title = styled.h2`
  margin: 0 0 8px;
  font-family: ${BS_FONT_DISPLAY};
  font-size: 24px;
  font-weight: 700;
  color: ${buildStudioColors.white};
`

const Sub = styled.p`
  margin: 0 0 16px;
  font-family: ${BS_FONT_BODY};
  font-size: 14px;
  line-height: 1.5;
  color: ${buildStudioColors.muted};
`

const Steps = styled.ol`
  margin: 0 0 16px;
  padding-left: 18px;
  font-family: ${BS_FONT_BODY};
  font-size: 14px;
  line-height: 1.6;
  color: ${buildStudioColors.subtitle};

  li {
    margin-bottom: 8px;
  }
`

const LinkRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
`

const GuideLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid ${buildStudioColors.border};
  font-family: ${BS_FONT_BODY};
  font-size: 12px;
  font-weight: 600;
  color: ${buildStudioColors.gold};
  text-decoration: none;

  &:hover {
    border-color: ${buildStudioColors.gold};
  }
`

interface Props {
  open: boolean
  onClose: () => void
}

export const BuildInfrastructureGuidePanel: React.FC<Props> = ({ open, onClose }) => {
  if (!open) return null

  return (
    <Overlay data-bs-guide-overlay onClick={onClose} role="presentation">
      <Panel data-bs-guide-panel onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="bs-guide-title">
        <Title id="bs-guide-title">AI Infrastructure Guide</Title>
        <Sub>
          Build Studio orchestrates Projects, Radar, Pools, and Farms runtimes. Use this flow to prepare infrastructure
          before deployment — all scores and suggestions are rule-based with provenance, not fabricated AI claims.
        </Sub>
        <Steps>
          {FLOW_STEPS.map((step) => (
            <li key={step}>
              <strong>{step}</strong> — indexed through Melega registry and runtime validation.
            </li>
          ))}
        </Steps>
        <LinkRow>
          <GuideLink to="/import-existing-token">Import existing token</GuideLink>
          <GuideLink to="/projects">Projects registry</GuideLink>
          <GuideLink to="/radar">Radar intelligence</GuideLink>
          <GuideLink to="/pools">Pools runtime</GuideLink>
          <GuideLink to="/farms">Farms runtime</GuideLink>
        </LinkRow>
        <BsOutlineBtn type="button" $width="100%" $height="42px" onClick={onClose}>
          Close guide
        </BsOutlineBtn>
      </Panel>
    </Overlay>
  )
}

export default BuildInfrastructureGuidePanel
