import React from 'react'
import styled from 'styled-components'
import { useRadarRuntime } from '../radarRuntime/RadarRuntimeContext'
import { radarStudioColors, radarStudioLayout } from '../radarStudioTokens'
import { RdPanel, RdSectionTitle } from './radarStudioPrimitives'
import RadarEventCard from './RadarEventCard'

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
  height: 100%;
`

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${radarStudioLayout.columnGap};
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
`

const EmptyPanel = styled(RdPanel)`
  min-height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 6px;
  padding: 28px 20px;
`

const EmptyTitle = styled.p`
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: ${radarStudioColors.white};
`

const EmptyDesc = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: ${radarStudioColors.muted};
  max-width: 320px;
`

export const RadarDiscoveriesGrid: React.FC = () => {
  const { discoveries } = useRadarRuntime()

  return (
    <Section data-rd-discoveries>
      <RdSectionTitle>AI Discoveries</RdSectionTitle>
      <Stack>
        {discoveries.length === 0 ? (
          <EmptyPanel data-rd-discoveries-empty>
            <EmptyTitle>No discoveries for this filter</EmptyTitle>
            <EmptyDesc>Indexed intelligence events appear here when registry and subgraph data align.</EmptyDesc>
          </EmptyPanel>
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
