import React from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/router'
import { RADAR_FONT_BODY, RADAR_FONT_DISPLAY, radarStudioColors, radarStudioLayout } from '../radarStudioTokens'
import { useRadarRuntime } from '../radarRuntime/RadarRuntimeContext'
import { RdOutlineGoldBtn } from './radarStudioPrimitives'

const Row = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 660px) auto;
  align-items: start;
  gap: 16px;
  min-height: ${radarStudioLayout.heroHeight};
  min-width: 0;

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    min-height: 0;
  }
`

const Left = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  min-width: 0;
`

const Title = styled.h1`
  margin: 0;
  font-family: ${RADAR_FONT_DISPLAY};
  font-size: 52px;
  line-height: 56px;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: ${radarStudioColors.white};
`

const Subtitle = styled.p`
  margin: 10px 0 0;
  max-width: 620px;
  font-family: ${RADAR_FONT_BODY};
  font-size: 18px;
  line-height: 28px;
  font-weight: 500;
  color: ${radarStudioColors.subtitle};
`

const Right = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  gap: 14px;
  flex-shrink: 0;
  flex-wrap: wrap;

  @media (max-width: 767px) {
    justify-content: flex-start;
    width: 100%;
  }

  @media (max-width: 360px) {
    flex-direction: column;

    button {
      width: 100%;
    }
  }
`

const LiveDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #050505;
  flex-shrink: 0;
`

const LiveBtn = styled.button`
  width: 132px;
  height: 44px;
  min-height: 44px;
  padding: 0 14px;
  border: none;
  border-radius: 13px;
  background: ${radarStudioColors.green};
  color: #050505;
  font-family: ${RADAR_FONT_BODY};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: transform 180ms ease;

  &:hover {
    transform: scale(0.98);
  }

  @media (max-width: 767px) {
    flex: 1;
    min-width: 0;
  }
`

export const RadarStudioPageHeader: React.FC = () => {
  const router = useRouter()
  const { runContractPreview } = useRadarRuntime()

  return (
  <div data-rd-page-header>
    <Row>
      <Left>
        <Title>DEX INTELLIGENCE</Title>
        <Subtitle>
          AI operational console for live discovery, wallet activity and contract intelligence.
        </Subtitle>
      </Left>
      <Right>
        <RdOutlineGoldBtn type="button" onClick={() => router.push('/projects')}>
          AI Discovery Engine
        </RdOutlineGoldBtn>
        <LiveBtn
          type="button"
          data-rd-live-scan-btn
          onClick={() => {
            const featured = document.querySelector<HTMLInputElement>('[data-rd-contract-input]')
            if (featured?.value) runContractPreview(featured.value)
            else featured?.focus()
          }}
        >
          <LiveDot data-rd-live-dot />
          Live Scan
        </LiveBtn>
      </Right>
    </Row>
  </div>
  )
}

export default RadarStudioPageHeader
