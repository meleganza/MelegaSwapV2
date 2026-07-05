import React from 'react'
import styled from 'styled-components'
import { useRadarRuntime } from '../radarRuntime/RadarRuntimeContext'
import {
  RADAR_FONT_BODY,
  RADAR_FONT_DISPLAY,
  radarStudioColors,
  radarStudioLayout,
  radarStudioType,
} from '../radarStudioTokens'
import { RdPanel } from './radarStudioPrimitives'

const Panel = styled(RdPanel)`
  height: ${radarStudioLayout.timelineHeight};
  padding: 24px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const Title = styled.h3`
  margin: 0 0 16px;
  font-family: ${RADAR_FONT_DISPLAY};
  font-size: 18px;
  font-weight: 700;
  color: ${radarStudioColors.text};
`

const List = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
`

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  height: ${radarStudioLayout.timelineRowHeight};
  min-height: ${radarStudioLayout.timelineRowHeight};
  padding: 0 4px;
  box-sizing: border-box;
`

const Dot = styled.span`
  width: ${radarStudioLayout.timelineDotSize};
  height: ${radarStudioLayout.timelineDotSize};
  border-radius: 50%;
  background: ${radarStudioColors.gold};
  flex-shrink: 0;
`

const Middle = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const EventTitle = styled.div`
  font-family: ${RADAR_FONT_BODY};
  font-size: ${radarStudioType.timelineTitle};
  font-weight: 700;
  line-height: 1.3;
  color: ${radarStudioColors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const EventSubtitle = styled.div`
  font-family: ${RADAR_FONT_BODY};
  font-size: ${radarStudioType.timelineSub};
  font-weight: 400;
  line-height: 1.3;
  color: ${radarStudioColors.muted};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Right = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  flex-shrink: 0;
`

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid ${radarStudioColors.green};
  background: rgba(27, 231, 122, 0.08);
  font-family: ${RADAR_FONT_BODY};
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${radarStudioColors.green};
  line-height: 1;
`

const Time = styled.span`
  font-family: ${RADAR_FONT_BODY};
  font-size: ${radarStudioType.timelineSub};
  font-weight: 400;
  color: ${radarStudioColors.muted};
  white-space: nowrap;
`

export const RadarEventTimeline: React.FC = () => {
  const { liveEvents } = useRadarRuntime()

  return (
    <Panel data-rd-event-timeline>
      <Title>Event Timeline</Title>
      <List>
        {liveEvents.length === 0 ? (
          <Row>
            <Dot aria-hidden />
            <Middle>
              <EventTitle>No events indexed</EventTitle>
              <EventSubtitle>Radar runtime</EventSubtitle>
            </Middle>
          </Row>
        ) : (
          liveEvents.slice(0, 8).map((item) => (
            <Row key={item.id}>
              <Dot aria-hidden />
              <Middle>
                <EventTitle>{item.event}</EventTitle>
                <EventSubtitle>
                  {item.project} · {item.source}
                </EventSubtitle>
              </Middle>
              <Right>
                <StatusBadge>Live</StatusBadge>
                <Time>{item.timestamp}</Time>
              </Right>
            </Row>
          ))
        )}
      </List>
    </Panel>
  )
}

export default RadarEventTimeline
