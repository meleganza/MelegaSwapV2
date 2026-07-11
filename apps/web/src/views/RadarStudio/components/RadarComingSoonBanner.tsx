import React from 'react'
import styled from 'styled-components'
import { DEX_INTELLIGENCE_DISPOSITION } from 'lib/data-truth/dexIntelligenceDisposition'
import { RADAR_FONT_BODY, radarStudioColors } from '../radarStudioTokens'

const Banner = styled.div`
  border: 1px solid rgba(212, 175, 55, 0.35);
  background: rgba(212, 175, 55, 0.08);
  border-radius: 14px;
  padding: 14px 16px;
  font-family: ${RADAR_FONT_BODY};
`

const Title = styled.div`
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${radarStudioColors.gold};
  margin-bottom: 6px;
`

const Copy = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: ${radarStudioColors.muted};
`

export const RadarComingSoonBanner: React.FC = () => {
  if (DEX_INTELLIGENCE_DISPOSITION.publicReady) return null
  return (
    <Banner data-radar-coming-soon>
      <Title>{DEX_INTELLIGENCE_DISPOSITION.label}</Title>
      <Copy>{DEX_INTELLIGENCE_DISPOSITION.reason}</Copy>
    </Banner>
  )
}

export default RadarComingSoonBanner
