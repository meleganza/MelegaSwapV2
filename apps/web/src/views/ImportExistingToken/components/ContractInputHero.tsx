import React from 'react'
import styled from 'styled-components'
import { EXPLORER_ICONS } from '../importTokenData'
import { useImportRuntime } from '../importExistingTokenRuntime/ImportRuntimeContext'
import { IT_FONT_BODY, importTokenColors, importTokenLayout } from '../importTokenTokens'
import { ItInput, ItPanel, ItPrimaryBtn, ItSectionLabel } from './importTokenPrimitives'

const SUPPORTED_CHAINS = ['BNB', 'ETH', 'Base', 'Polygon'] as const

const Hero = styled(ItPanel)`
  min-height: ${importTokenLayout.heroH};
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const DesktopRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  width: 100%;

  @media (min-width: 769px) {
    flex-wrap: nowrap;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`

const AddressField = styled(ItInput)`
  font-family: 'SF Mono', 'Menlo', 'Consolas', monospace;
  font-size: 14px;
  letter-spacing: 0.01em;
  overflow-x: auto;
  white-space: nowrap;
  box-sizing: border-box;

  @media (min-width: 769px) {
    min-width: 680px;
    max-width: 760px;
    flex: 1 1 680px;
  }

  @media (max-width: 768px) {
    width: 100%;
    min-width: 0;
    max-width: 100%;
  }
`

const ChainRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  @media (min-width: 769px) {
    flex-shrink: 0;
  }
`

const AnalyzeBtn = styled(ItPrimaryBtn)`
  @media (min-width: 769px) {
    width: 280px;
    flex-shrink: 0;
  }

  @media (max-width: 768px) {
    width: 100%;
  }
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

  &:hover {
    border-color: ${importTokenColors.gold};
    color: ${importTokenColors.gold};
  }
`

const Error = styled.p`
  margin: 0;
  font-size: 13px;
  color: ${importTokenColors.red};
`

type Props = Record<string, never>

export const ContractInputHero: React.FC<Props> = () => {
  const { contract, setContract, chainLabel, setChainLabel, runAnalysis, validationError } = useImportRuntime()

  const handleAnalyze = () => {
    runAnalysis()
  }

  return (
    <Hero data-iet-contract-hero>
      <ItSectionLabel>Step 1 — Contract Input</ItSectionLabel>
      <DesktopRow>
        <AddressField
          placeholder="0x..."
          value={contract}
          onChange={(e) => setContract(e.target.value)}
          data-iet-contract-input
          aria-label="Contract address"
        />
        <ChainRow>
          {SUPPORTED_CHAINS.map((c) => (
            <ChainBtn
              key={c}
              type="button"
              $active={chainLabel === c || (c === 'ETH' && chainLabel === 'Ethereum')}
              onClick={() => setChainLabel(c === 'ETH' ? 'ETH' : c)}
            >
              {c}
            </ChainBtn>
          ))}
        </ChainRow>
        <AnalyzeBtn type="button" $height="56px" onClick={handleAnalyze}>
          Analyze Project
        </AnalyzeBtn>
      </DesktopRow>
      {validationError ? <Error>{validationError}</Error> : null}
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
