import React, { useState } from 'react'
import styled from 'styled-components'
import { DEMO_CONTRACT, EXPLORER_ICONS, SUPPORTED_CHAINS } from '../importTokenData'
import { IT_FONT_BODY, importTokenColors, importTokenLayout } from '../importTokenTokens'
import { ItInput, ItPanel, ItPrimaryBtn, ItSectionLabel } from './importTokenPrimitives'

const Hero = styled(ItPanel)`
  min-height: ${importTokenLayout.heroH};
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const InputRow = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`

const InputFlex = styled.div`
  flex: 1;
  min-width: 200px;
`

const ChainRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

const ChainBtn = styled.button<{ $active?: boolean }>`
  height: 36px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid ${({ $active }) => ($active ? importTokenColors.gold : importTokenColors.border)};
  background: ${({ $active }) => ($active ? importTokenColors.goldBg : 'rgba(255,255,255,0.02)')};
  color: ${({ $active }) => ($active ? importTokenColors.gold : importTokenColors.body)};
  font-family: ${IT_FONT_BODY};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
`

const Explorers = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: auto;
`

const ExplorerLabel = styled.span`
  font-family: ${IT_FONT_BODY};
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${importTokenColors.label};
`

const ExplorerIcon = styled.a`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid ${importTokenColors.border};
  background: rgba(255, 255, 255, 0.03);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: ${IT_FONT_BODY};
  font-size: 9px;
  font-weight: 800;
  color: ${importTokenColors.muted};
  text-decoration: none;
  transition: border-color ${importTokenLayout.transition} ease;

  &:hover {
    border-color: ${importTokenColors.gold};
    color: ${importTokenColors.gold};
  }
`

type Props = {
  onAnalyze: () => void
  analyzed: boolean
}

export const ContractInputHero: React.FC<Props> = ({ onAnalyze, analyzed }) => {
  const [chain, setChain] = useState('BNB')
  const [contract, setContract] = useState(analyzed ? DEMO_CONTRACT : '')

  return (
    <Hero data-iet-contract-hero>
      <ItSectionLabel>Step 1 — Contract Input</ItSectionLabel>
      <InputRow>
        <InputFlex>
          <ItInput
            placeholder="0x..."
            value={contract}
            onChange={(e) => setContract(e.target.value)}
            data-iet-contract-input
          />
        </InputFlex>
        <ChainRow>
          {SUPPORTED_CHAINS.map((c) => (
            <ChainBtn key={c} type="button" $active={chain === c} onClick={() => setChain(c)}>
              {c}
            </ChainBtn>
          ))}
        </ChainRow>
        <ItPrimaryBtn type="button" $width="220px" $height="56px" onClick={onAnalyze}>
          Analyze Project
        </ItPrimaryBtn>
      </InputRow>
      <Explorers>
        <ExplorerLabel>Supported explorers</ExplorerLabel>
        {EXPLORER_ICONS.map((ex) => (
          <ExplorerIcon key={ex.id} href={ex.href} target="_blank" rel="noopener noreferrer" title={ex.label}>
            {ex.label.slice(0, 3)}
          </ExplorerIcon>
        ))}
      </Explorers>
    </Hero>
  )
}

export default ContractInputHero
