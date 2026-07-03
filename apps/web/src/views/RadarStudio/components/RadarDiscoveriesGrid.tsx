import React from 'react'
import styled from 'styled-components'
import { useRadarRuntime } from '../radarRuntime/RadarRuntimeContext'
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
  gap: ${radarStudioLayout.columnGap};
  width: 100%;
  max-width: ${radarStudioLayout.eventCardWidth};
`

const Empty = styled.p`
  margin: 0;
  font-size: 13px;
  color: #9a9a9a;
`

export const RadarDiscoveriesGrid: React.FC = () => {
  const { discoveries } = useRadarRuntime()

  return (
    <Section data-rd-discoveries>
      <RdSectionTitle>AI Discoveries</RdSectionTitle>
      <Stack>
        {discoveries.length === 0 ? (
          <Empty>No indexed projects match this filter.</Empty>
        ) : (
          discoveries.map((event, index) => (
            <RadarEventCard key={event.id} event={event} index={index} />
          ))
        )}
      </Stack>
    </Section>
  )
}

export default RadarDiscoveriesGrid
