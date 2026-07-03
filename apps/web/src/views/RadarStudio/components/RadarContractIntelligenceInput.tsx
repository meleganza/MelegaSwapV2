import React from 'react'
import styled from 'styled-components'
import { useRadarRuntime } from '../radarRuntime/RadarRuntimeContext'
import { RADAR_FONT_BODY, RADAR_FONT_DISPLAY, radarStudioColors, radarStudioLayout } from '../radarStudioTokens'
import ContractIntelligencePreview from './ContractIntelligencePreview'

const Panel = styled.section`
  width: 100%;
  padding: ${radarStudioLayout.cardPadding};
  border-radius: ${radarStudioLayout.cardRadius};
  background: ${radarStudioColors.panel};
  border: 1px solid ${radarStudioColors.goldBorderSoft};
  box-sizing: border-box;
`

const Title = styled.h2`
  margin: 0;
  font-family: ${RADAR_FONT_DISPLAY};
  font-size: 22px;
  line-height: 28px;
  font-weight: 800;
  color: ${radarStudioColors.white};
`

const Subtitle = styled.p`
  margin: 10px 0 0;
  max-width: 720px;
  font-family: ${RADAR_FONT_BODY};
  font-size: 14px;
  line-height: 20px;
  font-weight: 500;
  color: ${radarStudioColors.subtitle};
`

const InputRow = styled.div`
  margin-top: 20px;
  display: grid;
  grid-template-columns: 1fr ${radarStudioLayout.contractChainWidth} ${radarStudioLayout.contractRunWidth};
  gap: 12px;

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
  }
`

const Input = styled.input`
  height: ${radarStudioLayout.contractInputHeight};
  border-radius: ${radarStudioLayout.contractInputRadius};
  background: ${radarStudioColors.inputBg};
  border: 1px solid ${radarStudioColors.borderInput};
  padding: 0 16px;
  font-family: ${RADAR_FONT_BODY};
  font-size: 14px;
  font-weight: 500;
  color: ${radarStudioColors.white};
  box-sizing: border-box;
  min-width: 0;

  &::placeholder {
    color: ${radarStudioColors.muted};
  }
`

const Select = styled.select`
  width: ${radarStudioLayout.contractChainWidth};
  height: ${radarStudioLayout.contractInputHeight};
  border-radius: ${radarStudioLayout.contractInputRadius};
  background: ${radarStudioColors.inputBg};
  border: 1px solid ${radarStudioColors.borderInput};
  padding: 0 12px;
  font-family: ${RADAR_FONT_BODY};
  font-size: 14px;
  font-weight: 500;
  color: ${radarStudioColors.secondary};
  box-sizing: border-box;

  @media (max-width: 767px) {
    width: 100%;
  }
`

const RunBtn = styled.button`
  width: ${radarStudioLayout.contractRunWidth};
  height: ${radarStudioLayout.contractInputHeight};
  border: none;
  border-radius: ${radarStudioLayout.contractInputRadius};
  background: ${radarStudioColors.gold};
  color: #050505;
  font-family: ${RADAR_FONT_BODY};
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 8px 24px ${radarStudioColors.goldShadow};
  transition: filter ${radarStudioColors.transition} ease, transform ${radarStudioColors.transition} ease;

  &:hover {
    filter: brightness(1.05);
  }

  &:active {
    transform: scale(0.99);
  }

  @media (max-width: 767px) {
    width: 100%;
  }
`

const CHAINS = ['BNB Smart Chain', 'Ethereum', 'Base', 'Polygon', 'Solana'] as const

export const RadarContractIntelligenceInput: React.FC = () => {
  const {
    contractInput,
    setContractInput,
    chainLabel,
    setChainLabel,
    previewOpen,
    setPreviewOpen,
    contractPreview,
    runContractPreview,
  } = useRadarRuntime()

  return (
    <>
      <Panel data-rd-contract-intel-input>
        <Title>Contract Intelligence</Title>
        <Subtitle>
          Paste a token contract to receive an AI operational preview. Professional PDF audits remain available
          inside Melega Space.
        </Subtitle>
        <InputRow>
          <Input
            value={contractInput}
            onChange={(e) => setContractInput(e.target.value)}
            placeholder="Paste contract address..."
            aria-label="Contract address"
          />
          <Select value={chainLabel} onChange={(e) => setChainLabel(e.target.value)} aria-label="Chain">
            {CHAINS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <RunBtn type="button" onClick={() => runContractPreview()}>
            Run Free Preview
          </RunBtn>
        </InputRow>
      </Panel>

      {previewOpen && contractPreview ? (
        <ContractIntelligencePreview preview={contractPreview} onClose={() => setPreviewOpen(false)} />
      ) : null}
    </>
  )
}

export default RadarContractIntelligenceInput
