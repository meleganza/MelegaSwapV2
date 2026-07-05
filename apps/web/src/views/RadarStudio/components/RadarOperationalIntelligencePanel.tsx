import React from 'react'
import styled from 'styled-components'
import { useRadarRuntime } from '../radarRuntime/RadarRuntimeContext'
import {
  RADAR_FONT_BODY,
  radarStudioColors,
  radarStudioLayout,
  radarStudioType,
} from '../radarStudioTokens'
import { RdPanel } from './radarStudioPrimitives'

const AWAITING_FEED = 'Awaiting live intelligence feed.'

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: ${radarStudioLayout.cardGap};

  @media (max-width: ${radarStudioLayout.stackBreakpoint}) {
    grid-template-columns: 1fr;
  }
`

const Card = styled(RdPanel)`
  height: ${radarStudioLayout.opsCardHeight};
  padding: 20px 22px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-sizing: border-box;

  @media (max-width: ${radarStudioLayout.mobileBreakpoint}) {
    height: ${radarStudioLayout.opsCardHeightMobile};
    padding: 16px 18px;
  }
`

const Icon = styled.div`
  width: ${radarStudioType.opsIcon};
  height: ${radarStudioType.opsIcon};
  font-size: ${radarStudioType.opsIcon};
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  @media (max-width: ${radarStudioLayout.mobileBreakpoint}) {
    width: ${radarStudioType.opsIconMobile};
    height: ${radarStudioType.opsIconMobile};
    font-size: ${radarStudioType.opsIconMobile};
  }
`

const Title = styled.h3`
  margin: 0;
  font-family: ${RADAR_FONT_BODY};
  font-size: ${radarStudioType.opsTitle};
  font-weight: 700;
  color: ${radarStudioColors.text};
`

const Desc = styled.p`
  margin: 0;
  font-family: ${RADAR_FONT_BODY};
  font-size: ${radarStudioType.opsDesc};
  line-height: 1.45;
  color: ${radarStudioColors.secondary};
`

const OPS = [
  { id: 'whale', icon: '🐋', title: 'Whale Monitor', key: 'whales' as const },
  { id: 'smart', icon: '◈', title: 'Smart Money', key: 'smartMoney' as const },
  { id: 'wallet', icon: '◎', title: 'Wallet Accumulation', key: 'walletAccumulation' as const },
]

export const RadarOperationalIntelligencePanel: React.FC = () => {
  const runtime = useRadarRuntime()
  const hasAnyLive = OPS.some((op) => {
    const rows = runtime[op.key]
    return Array.isArray(rows) && rows.length > 0
  })

  if (!hasAnyLive) return null

  return (
    <Grid data-rd-ops-intelligence>
      {OPS.map((op) => {
        const rows = runtime[op.key]
        const hasLive = Array.isArray(rows) && rows.length > 0
        return (
          <Card key={op.id}>
            <Icon aria-hidden>{op.icon}</Icon>
            <Title>{op.title}</Title>
            <Desc>{hasLive ? `${rows.length} signal(s) indexed` : AWAITING_FEED}</Desc>
          </Card>
        )
      })}
    </Grid>
  )
}

export default RadarOperationalIntelligencePanel
