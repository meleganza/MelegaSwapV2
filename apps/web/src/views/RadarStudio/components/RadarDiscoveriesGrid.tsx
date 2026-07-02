import React from 'react'
import styled from 'styled-components'
import { RADAR_DISCOVERIES } from '../radarStudioData'
import { radarStudioLayout } from '../radarStudioTokens'
import { RdSectionTitle } from './radarStudioPrimitives'
import RadarDiscoveryCard from './RadarDiscoveryCard'

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 14px;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${radarStudioLayout.discoveryCardGap};

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
  }
`

export const RadarDiscoveriesGrid: React.FC = () => (
  <Section data-rd-discoveries>
    <RdSectionTitle>AI Discoveries</RdSectionTitle>
    <Grid>
      {RADAR_DISCOVERIES.map((project) => (
        <RadarDiscoveryCard key={project.name} project={project} />
      ))}
    </Grid>
  </Section>
)

export default RadarDiscoveriesGrid
