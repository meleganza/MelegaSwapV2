import React from 'react'
import styled from 'styled-components'
import { RADAR_EVENTS } from '../radarStudioData'
import { radarStudioLayout } from '../radarStudioTokens'
import { RdSectionTitle } from './radarStudioPrimitives'
import RadarEventCard from './RadarEventCard'

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
`

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${radarStudioLayout.eventCardGap};
  width: 100%;
  max-width: ${radarStudioLayout.eventCardWidth};
`

export const RadarDiscoveriesGrid: React.FC = () => (
  <Section data-rd-discoveries>
    <RdSectionTitle>AI Discoveries</RdSectionTitle>
    <Stack>
      {RADAR_EVENTS.map((event, index) => (
        <RadarEventCard key={event.id} event={event} index={index} />
      ))}
    </Stack>
  </Section>
)

export default RadarDiscoveriesGrid
