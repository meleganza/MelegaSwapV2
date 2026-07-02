import React, { useState } from 'react'
import styled from 'styled-components'
import { MOCK_CONTRACT_PREVIEW } from '../radarStudioData'
import { RADAR_FONT_BODY, RADAR_FONT_DISPLAY, radarStudioColors, radarStudioLayout } from '../radarStudioTokens'
import ContractIntelligencePreview from './ContractIntelligencePreview'

const Panel = styled.section`
  width: 100%;
  min-height: ${radarStudioLayout.contractIntelMinHeight};
  padding: 18px;
  border-radius: ${radarStudioLayout.cardRadius};
  background: ${radarStudioColors.panelGradientAlt};
  border: 1px solid ${radarStudioColors.goldBorderSoft};
  box-sizing: border-box;
`

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`

const Title = styled.h2`
  margin: 0;
  font-family: ${RADAR_FONT_DISPLAY};
  font-size: 22px;
  line-height: 28px;
  font-weight: 800;
  color: ${radarStudioColors.white};
`

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 106px;
  height: 26px;
  border-radius: 999px;
  border: 1px solid rgba(212, 175, 55, 0.6);
  background: rgba(212, 175, 55, 0.08);
  font-family: ${RADAR_FONT_BODY};
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${radarStudioColors.gold};
  flex-shrink: 0;
`

const Description = styled.p`
  margin: 8px 0 0;
  max-width: 680px;
  font-family: ${RADAR_FONT_BODY};
  font-size: 14px;
  line-height: 20px;
  color: ${radarStudioColors.subtitle};
`

const InputRow = styled.div`
  margin-top: 16px;
  display: grid;
  grid-template-columns: 1fr 160px 190px;
  gap: 12px;

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
  }
`

const Input = styled.input`
  height: 46px;
  border-radius: 13px;
  background: ${radarStudioColors.inputBg};
  border: 1px solid ${radarStudioColors.borderInput};
  padding: 0 16px;
  font-family: ${RADAR_FONT_BODY};
  font-size: 14px;
  color: ${radarStudioColors.white};
  box-sizing: border-box;
  min-width: 0;

  &::placeholder {
    color: ${radarStudioColors.muted};
  }
`

const Select = styled.select`
  height: 46px;
  border-radius: 13px;
  background: ${radarStudioColors.inputBg};
  border: 1px solid ${radarStudioColors.borderInput};
  padding: 0 12px;
  font-family: ${RADAR_FONT_BODY};
  font-size: 14px;
  color: ${radarStudioColors.secondary};
  box-sizing: border-box;
`

const RunBtn = styled.button`
  height: 46px;
  border: none;
  border-radius: 13px;
  background: ${radarStudioColors.gold};
  color: #050505;
  font-family: ${RADAR_FONT_BODY};
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  transition: filter 180ms ease, transform 180ms ease;

  &:hover {
    filter: brightness(1.06);
  }

  &:active {
    transform: scale(0.99);
  }
`

const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
`

const Chip = styled.span`
  height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  background: ${radarStudioColors.chipBg};
  border: 1px solid ${radarStudioColors.borderInput};
  font-family: ${RADAR_FONT_BODY};
  font-size: 11px;
  color: ${radarStudioColors.muted};
  display: inline-flex;
  align-items: center;
`

const CHAINS = ['BNB Smart Chain', 'Ethereum', 'Base', 'Polygon', 'Solana'] as const

export const RadarContractIntelligenceInput: React.FC = () => {
  const [address, setAddress] = useState('')
  const [chain, setChain] = useState<string>(CHAINS[0])
  const [open, setOpen] = useState(false)

  return (
    <>
      <Panel data-rd-contract-intel-input>
        <HeaderRow>
          <Title>Contract Intelligence</Title>
          <Badge>Free Preview</Badge>
        </HeaderRow>
        <Description>
          Paste a token contract to receive an AI due diligence preview. For a professional PDF audit,
          continue to Melega Space.
        </Description>
        <InputRow>
          <Input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Paste contract address: 0x…"
            aria-label="Contract address"
          />
          <Select value={chain} onChange={(e) => setChain(e.target.value)} aria-label="Chain">
            {CHAINS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <RunBtn type="button" onClick={() => setOpen(true)}>
            Run Free Preview
          </RunBtn>
        </InputRow>
        <Chips>
          <Chip>Operational preview only</Chip>
          <Chip>Not legal advice</Chip>
          <Chip>Full audit on Melega Space</Chip>
        </Chips>
      </Panel>

      {open ? (
        <ContractIntelligencePreview
          preview={{ ...MOCK_CONTRACT_PREVIEW, network: chain, address: address || MOCK_CONTRACT_PREVIEW.address }}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  )
}

export default RadarContractIntelligenceInput
