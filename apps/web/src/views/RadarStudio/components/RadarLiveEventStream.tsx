import React from 'react'
import styled, { keyframes } from 'styled-components'
import { LIVE_EVENTS } from '../radarStudioData'
import { RADAR_FONT_BODY, RADAR_FONT_DISPLAY, radarStudioColors, radarStudioLayout } from '../radarStudioTokens'

const Bar = styled.div`
  width: 100%;
  height: ${radarStudioLayout.eventStreamHeight};
  min-height: ${radarStudioLayout.eventStreamHeight};
  border-radius: 16px;
  border: 1px solid #282828;
  background: ${radarStudioColors.panelAlt};
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 18px;
  overflow: hidden;
  box-sizing: border-box;
`

const LiveDot = styled.span`
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: ${radarStudioColors.green};
  flex-shrink: 0;
`

const LiveLabel = styled.span`
  font-family: ${RADAR_FONT_BODY};
  font-size: 14px;
  font-weight: 700;
  color: ${radarStudioColors.green};
  flex-shrink: 0;
`

const TickerViewport = styled.div`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  mask-image: linear-gradient(90deg, transparent, #000 3%, #000 97%, transparent);

  @media (max-width: 767px) {
    overflow-x: auto;
    mask-image: none;
    -webkit-overflow-scrolling: touch;
  }
`

const TickerTrack = styled.div`
  display: flex;
  width: max-content;
  gap: 28px;
  align-items: center;

  ${TickerViewport}:hover & {
    animation-play-state: paused;
  }

  @media (max-width: 767px) {
    animation: none !important;
  }
`

const EventItem = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  white-space: nowrap;
  font-family: ${RADAR_FONT_BODY};
  font-size: 13px;
  color: ${radarStudioColors.secondary};
`

const Icon = styled.span`
  font-size: 14px;
`

const Project = styled.span`
  font-family: ${RADAR_FONT_DISPLAY};
  font-weight: 700;
  color: ${radarStudioColors.white};
`

const EventText = styled.span`
  font-weight: 400;
  color: ${radarStudioColors.subtitle};
`

const Timestamp = styled.span`
  color: ${radarStudioColors.muted};
  font-size: 12px;
`

const Confidence = styled.span`
  font-family: ${RADAR_FONT_DISPLAY};
  font-size: 12px;
  font-weight: 700;
  color: ${radarStudioColors.green};
`

export const RadarLiveEventStream: React.FC = () => {
  const items = [...LIVE_EVENTS, ...LIVE_EVENTS]

  return (
    <Bar data-rd-live-stream>
      <LiveDot data-rd-live-dot />
      <LiveLabel>LIVE</LiveLabel>
      <TickerViewport data-rd-ticker-viewport>
        <TickerTrack data-rd-ticker-track>
          {items.map((item, i) => (
            <EventItem key={`${item.id}-${i}`}>
              <Icon aria-hidden>{item.icon}</Icon>
              <Project>{item.project}</Project>
              <EventText>{item.event}</EventText>
              <Timestamp>{item.timestamp}</Timestamp>
              <Confidence>{item.confidence}</Confidence>
            </EventItem>
          ))}
        </TickerTrack>
      </TickerViewport>
    </Bar>
  )
}

export default RadarLiveEventStream
