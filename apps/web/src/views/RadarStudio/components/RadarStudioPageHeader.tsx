import React from 'react'
import styled from 'styled-components'
import { RADAR_FONT_BODY, RADAR_FONT_DISPLAY, radarStudioColors } from '../radarStudioTokens'
import { RdOutlineGoldBtn } from './radarStudioPrimitives'

const Row = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  min-width: 0;

  @media (max-width: 767px) {
    flex-direction: column;
  }
`

const Left = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
`

const Title = styled.h1`
  margin: 0;
  font-family: ${RADAR_FONT_DISPLAY};
  font-size: 52px;
  font-weight: 800;
  line-height: 1;
  color: ${radarStudioColors.white};
`

const Subtitle = styled.p`
  margin: 0;
  font-family: ${RADAR_FONT_BODY};
  font-size: 18px;
  font-weight: 400;
  line-height: 1.45;
  color: ${radarStudioColors.subtitle};
  max-width: 560px;
`

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  flex-wrap: wrap;
`

const HeroBtn = styled(RdOutlineGoldBtn)`
  height: 42px;
  min-height: 42px;
  border-radius: 12px;
  padding: 0 18px;

  @media (max-width: 767px) {
    min-height: 44px;
    height: 44px;
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
  height: 42px;
  min-height: 42px;
  padding: 0 18px;
  border: none;
  border-radius: 12px;
  background: ${radarStudioColors.green};
  color: #050505;
  font-family: ${RADAR_FONT_BODY};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: transform 180ms ease;

  &:hover {
    transform: scale(0.98);
  }

  @media (max-width: 767px) {
    min-height: 44px;
    height: 44px;
  }
`

export const RadarStudioPageHeader: React.FC = () => (
  <div data-rd-page-header>
    <Row>
      <Left>
        <Title>RADAR</Title>
        <Subtitle>
          AI operational console continuously scanning the crypto ecosystem in real time.
        </Subtitle>
      </Left>
      <Right>
        <HeroBtn type="button">AI Discovery Engine</HeroBtn>
        <LiveBtn type="button" data-rd-live-scan-btn>
          <LiveDot data-rd-live-dot />
          Live Scan
        </LiveBtn>
      </Right>
    </Row>
  </div>
)

export default RadarStudioPageHeader
