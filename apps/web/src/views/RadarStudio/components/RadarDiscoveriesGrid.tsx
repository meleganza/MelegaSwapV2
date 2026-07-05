import React from 'react'
import styled from 'styled-components'
import { useRadarRuntime } from '../radarRuntime/RadarRuntimeContext'
import { RADAR_FONT_DISPLAY, radarStudioColors, radarStudioLayout } from '../radarStudioTokens'
import RadarDiscoveryReportCard from './RadarDiscoveryReportCard'

const Title = styled.h3`
  margin: 0;
  font-family: ${RADAR_FONT_DISPLAY};
  font-size: 18px;
  font-weight: 700;
  color: ${radarStudioColors.text};
`

const Grid = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${radarStudioLayout.cardGap};
`

export const RadarDiscoveriesGrid: React.FC = () => {
  const { discoveries } = useRadarRuntime()

  return (
    <section data-rd-discoveries>
      <Title style={{ marginBottom: 16 }}>Radar Discoveries</Title>
      <Grid>
        {discoveries.map((event) => (
          <RadarDiscoveryReportCard key={event.id} event={event} />
        ))}
      </Grid>
    </section>
  )
}

export default RadarDiscoveriesGrid
