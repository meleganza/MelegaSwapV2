import React from 'react'
import styled from 'styled-components'
import { RADAR_FONT, radarStudioColors } from '../radarStudioTokens'
import { RdGhostBtn } from './radarStudioPrimitives'

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
  gap: 10px;
  min-width: 0;
`

const Title = styled.h1`
  margin: 0;
  font-family: ${RADAR_FONT};
  font-size: 56px;
  font-weight: 800;
  line-height: 54px;
  color: ${radarStudioColors.white};
`

const Subtitle = styled.p`
  margin: 0;
  font-family: ${RADAR_FONT};
  font-size: 15px;
  font-weight: 500;
  line-height: 1.5;
  color: ${radarStudioColors.subtitle};
  max-width: 640px;
`

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  flex-wrap: wrap;
`

const LiveBtn = styled.button`
  height: 44px;
  min-height: 44px;
  padding: 0 18px;
  border: none;
  border-radius: 12px;
  background: ${radarStudioColors.green};
  color: #050505;
  font-family: ${RADAR_FONT};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: transform 180ms ease;

  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #050505;
  }

  &:hover {
    transform: scale(0.98);
  }
`

const OutlineBtn = styled(RdGhostBtn)`
  height: 44px;
  min-height: 44px;
  border-radius: 12px;
`

export const RadarStudioPageHeader: React.FC = () => (
  <div data-rd-page-header>
    <Row>
      <Left>
        <Title>RADAR</Title>
        <Subtitle>
          AI-powered discovery engine identifying crypto opportunities before traditional trackers.
        </Subtitle>
      </Left>
      <Right>
        <OutlineBtn type="button">✦ AI Discovery Engine</OutlineBtn>
        <LiveBtn type="button">Live Scan</LiveBtn>
      </Right>
    </Row>
  </div>
)

export default RadarStudioPageHeader
