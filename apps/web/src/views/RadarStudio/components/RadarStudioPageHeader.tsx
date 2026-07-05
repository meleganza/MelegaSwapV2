import React, { useRef } from 'react'
import styled from 'styled-components'
import CivilizationRoleLabel from 'components/Civilization/CivilizationRoleLabel'
import { useRadarRuntime } from '../radarRuntime/RadarRuntimeContext'
import {
  RADAR_FONT_BODY,
  RADAR_FONT_DISPLAY,
  radarStudioColors,
  radarStudioLayout,
  radarStudioType,
} from '../radarStudioTokens'

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
`

const Top = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: start;
  gap: 16px;
  min-width: 0;

  @media (max-width: ${radarStudioLayout.mobileBreakpoint}) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`

const Copy = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  min-width: 0;
`

const Title = styled.h1`
  margin: 0;
  font-family: ${RADAR_FONT_DISPLAY};
  font-size: ${radarStudioType.pageTitle};
  font-weight: 700;
  line-height: 1.08;
  color: ${radarStudioColors.text};
  word-break: keep-all;
  overflow-wrap: normal;

  @media (max-width: ${radarStudioLayout.mobileBreakpoint}) {
    font-size: ${radarStudioType.pageTitleMobile};
    line-height: 1.1;
    white-space: nowrap;
  }
`

const Subtitle = styled.p`
  margin: 10px 0 0;
  max-width: ${radarStudioType.pageSubtitleMax};
  font-family: ${RADAR_FONT_BODY};
  font-size: ${radarStudioType.pageSubtitle};
  line-height: 1.5;
  font-weight: 400;
  color: ${radarStudioColors.subtitle};

  @media (max-width: ${radarStudioLayout.mobileBreakpoint}) {
    max-width: 100%;
    margin-top: 8px;
  }
`

const CtaRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex-shrink: 0;
  flex-wrap: wrap;

  @media (max-width: ${radarStudioLayout.mobileBreakpoint}) {
    width: 100%;
    flex-direction: column;
  }

  @media (min-width: calc(${radarStudioLayout.mobileBreakpoint} + 1px)) {
    justify-self: end;
  }
`

const PrimaryBtn = styled.button`
  width: ${radarStudioLayout.headerPrimaryW};
  height: ${radarStudioLayout.headerPrimaryH};
  border: none;
  border-radius: 12px;
  background: ${radarStudioColors.gold};
  color: #050505;
  font-family: ${RADAR_FONT_BODY};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-sizing: border-box;

  @media (max-width: ${radarStudioLayout.mobileBreakpoint}) {
    width: 100%;
  }
`

const OutlineBtn = styled.button`
  width: ${radarStudioLayout.headerPrimaryW};
  height: ${radarStudioLayout.headerPrimaryH};
  border-radius: 12px;
  border: 1px solid ${radarStudioColors.gold};
  background: transparent;
  color: ${radarStudioColors.gold};
  font-family: ${RADAR_FONT_BODY};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  box-sizing: border-box;

  @media (max-width: ${radarStudioLayout.mobileBreakpoint}) {
    width: 100%;
  }
`

const HiddenInput = styled.input`
  position: absolute;
  opacity: 0;
  pointer-events: none;
  width: 0;
  height: 0;
`

export const RadarStudioPageHeader: React.FC = () => {
  const { runContractPreview, contractInput, setContractInput } = useRadarRuntime()
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <Wrap data-rd-page-header>
      <HiddenInput
        ref={inputRef}
        value={contractInput}
        onChange={(e) => setContractInput(e.target.value)}
        aria-hidden
      />
      <Top>
        <Copy>
          <CivilizationRoleLabel module="radar" />
          <Title>RADAR</Title>
          <Subtitle>
            Discover verified on-chain intelligence. Track projects. Monitor liquidity. Detect opportunities.
          </Subtitle>
        </Copy>
        <CtaRow className="rd-header-cta-desktop">
          <PrimaryBtn
            type="button"
            onClick={() => {
              if (contractInput.trim()) {
                runContractPreview()
              } else {
                inputRef.current?.focus()
                const addr = window.prompt('Enter contract address for analysis')
                if (addr) {
                  setContractInput(addr)
                  runContractPreview(addr)
                }
              }
            }}
          >
            Run Contract Analysis
          </PrimaryBtn>
          <OutlineBtn type="button">How Radar Works</OutlineBtn>
        </CtaRow>
      </Top>
    </Wrap>
  )
}

export default RadarStudioPageHeader
