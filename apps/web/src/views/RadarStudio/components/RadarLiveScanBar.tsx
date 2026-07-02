import React from 'react'
import styled from 'styled-components'
import { LIVE_SCAN_ITEMS } from '../radarStudioData'
import { RADAR_FONT, radarStudioColors, radarStudioLayout } from '../radarStudioTokens'

const Bar = styled.div`
  height: ${radarStudioLayout.liveScanHeight};
  min-height: ${radarStudioLayout.liveScanHeight};
  border-radius: ${radarStudioLayout.liveScanRadius};
  border: 1px solid ${radarStudioColors.borderAlt};
  background: ${radarStudioColors.panelAlt};
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0 16px;
  overflow: hidden;
  box-sizing: border-box;
`

const LiveDot = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${radarStudioColors.green};
  box-shadow: 0 0 10px ${radarStudioColors.green};
  flex-shrink: 0;
`

const LiveLabel = styled.span`
  font-family: ${RADAR_FONT};
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: ${radarStudioColors.green};
  flex-shrink: 0;
`

const TickerViewport = styled.div`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  mask-image: linear-gradient(90deg, transparent, #000 4%, #000 96%, transparent);
`

const TickerTrack = styled.div`
  display: flex;
  width: max-content;
  gap: 32px;
`

const TickerItem = styled.span`
  font-family: ${RADAR_FONT};
  font-size: 13px;
  font-weight: 500;
  color: ${radarStudioColors.secondary};
  white-space: nowrap;
`

export const RadarLiveScanBar: React.FC = () => {
  const items = [...LIVE_SCAN_ITEMS, ...LIVE_SCAN_ITEMS]

  return (
    <Bar data-rd-live-scan>
      <LiveDot data-rd-live-dot />
      <LiveLabel>LIVE</LiveLabel>
      <TickerViewport>
        <TickerTrack data-rd-ticker-track>
          {items.map((item, i) => (
            <TickerItem key={`${item}-${i}`}>{item}</TickerItem>
          ))}
        </TickerTrack>
      </TickerViewport>
    </Bar>
  )
}

export default RadarLiveScanBar
