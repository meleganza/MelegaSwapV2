import React from 'react'
import styled, { keyframes } from 'styled-components'
import { GENERATED_INFRASTRUCTURE, IMPORT_DETECTIONS, IMPORT_PIPELINE_STEPS } from '../buildStudioData'
import { BS_FONT_BODY, buildStudioColors, buildStudioLayout } from '../buildStudioTokens'
import { IconCheck, IconDownload, IconRadar } from './buildStudioIcons'
import {
  BsBody,
  BsCardTitle,
  BsInput,
  BsLabel,
  BsPanel,
  BsPrimaryBtn,
  BsSelect,
} from './buildStudioPrimitives'

const Inner = styled.div`
  padding: 24px;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow: hidden;
`

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

const InputRow = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`

const InputFlex = styled.div`
  flex: 1;
  min-width: 0;
`

const PipelineSection = styled.div`
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px solid rgba(214, 180, 69, 0.35);
  background: rgba(214, 180, 69, 0.05);
`

const PipelineLabel = styled.div`
  font-family: ${BS_FONT_BODY};
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: ${buildStudioColors.gold};
  margin-bottom: 10px;
`

const PipelineRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
`

const PipelineStep = styled.span`
  font-family: ${BS_FONT_BODY};
  font-size: 12px;
  font-weight: 600;
  color: ${buildStudioColors.white};
  white-space: nowrap;
`

const arrowPulse = keyframes`
  0%, 100% { opacity: 0.45; transform: translateX(0); }
  50% { opacity: 1; transform: translateX(2px); }
`

const PipelineArrow = styled.span`
  color: ${buildStudioColors.gold};
  font-size: 14px;
  font-weight: 700;
  margin: 0 2px;
  animation: ${arrowPulse} ${buildStudioLayout.arrowAnim} ease-in-out infinite;

  &:nth-child(2) { animation-delay: 0ms; }
  &:nth-child(4) { animation-delay: 140ms; }
  &:nth-child(6) { animation-delay: 280ms; }
  &:nth-child(8) { animation-delay: 420ms; }
  &:nth-child(10) { animation-delay: 560ms; }
`

const DetectionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px 12px;
  max-height: 100px;
  overflow: hidden;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`

const DetectionItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: ${BS_FONT_BODY};
  font-size: 11px;
  color: ${buildStudioColors.body};
`

const InfraSection = styled.div`
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const InfraTitle = styled.div`
  font-family: ${BS_FONT_BODY};
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: ${buildStudioColors.label};
`

const InfraRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: ${BS_FONT_BODY};
  font-size: 13px;
  color: ${buildStudioColors.body};
`

const RadarWrap = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid ${buildStudioColors.green};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: rgba(27, 231, 122, 0.06);
`

export const ImportTokenPanel: React.FC = () => (
  <BsPanel
    data-bs-panel
    data-bs-import-token
    data-bs-primary-entry
    $emphasis="primary"
    $height={buildStudioLayout.importTokenH}
  >
    <Inner>
      <TitleRow>
        <RadarWrap data-bs-artwork>
          <IconRadar size={24} />
        </RadarWrap>
        <div>
          <BsCardTitle>Import Existing Token</BsCardTitle>
          <BsBody style={{ fontSize: 14, lineHeight: '22px', marginTop: 4 }}>
            Default infrastructure entry — AI-assisted contract analysis and machine-readable manifest generation.
          </BsBody>
        </div>
      </TitleRow>

      <InputRow>
        <InputFlex>
          <BsInput placeholder="Paste token contract..." data-bs-contract-input />
        </InputFlex>
        <BsSelect style={{ width: 180 }} defaultValue="bnb" aria-label="Chain">
          <option value="bnb">BNB Chain</option>
          <option value="eth">Ethereum</option>
          <option value="base">Base</option>
          <option value="polygon">Polygon</option>
          <option value="sol">Solana</option>
        </BsSelect>
        <BsPrimaryBtn type="button" $width="220px" $height="56px">
          <IconDownload size={16} color="#050505" />
          Run AI Analysis
        </BsPrimaryBtn>
      </InputRow>

      <PipelineSection data-bs-import-pipeline>
        <PipelineLabel>AI Import Pipeline</PipelineLabel>
        <PipelineRow>
          {IMPORT_PIPELINE_STEPS.map((step, i) => (
            <React.Fragment key={step}>
              {i > 0 ? <PipelineArrow data-bs-pipeline-arrow aria-hidden>↓</PipelineArrow> : null}
              <PipelineStep>{step}</PipelineStep>
            </React.Fragment>
          ))}
        </PipelineRow>
      </PipelineSection>

      <div>
        <BsLabel>AI automatically detects</BsLabel>
        <DetectionGrid>
          {IMPORT_DETECTIONS.slice(0, 12).map((item) => (
            <DetectionItem key={item}>
              <IconCheck size={12} />
              {item}
            </DetectionItem>
          ))}
        </DetectionGrid>
      </div>

      <InfraSection>
        <InfraTitle>Generated infrastructure</InfraTitle>
        {GENERATED_INFRASTRUCTURE.map((item) => (
          <InfraRow key={item}>
            <IconCheck size={14} />
            {item}
          </InfraRow>
        ))}
      </InfraSection>
    </Inner>
  </BsPanel>
)

export default ImportTokenPanel
