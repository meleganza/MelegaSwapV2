import React from 'react'
import styled, { keyframes } from 'styled-components'
import { SMART_MONEY_ROWS, WHALE_ROWS } from '../radarStudioData'
import { RADAR_FONT_BODY, RADAR_FONT_DISPLAY, radarStudioColors, radarStudioLayout } from '../radarStudioTokens'
import { RdPanel, RdSectionTitle } from './radarStudioPrimitives'

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
  width: 100%;
  max-width: ${radarStudioLayout.opsPanelWidth};
`

const Panel = styled(RdPanel)`
  width: ${radarStudioLayout.opsPanelWidth};
  max-width: 100%;
  min-height: 160px;
  padding: 16px;
  background: ${radarStudioColors.panel};
  border-color: ${radarStudioColors.borderMuted};
`

const whaleSlide = keyframes`
  0% { transform: translateY(0); }
  100% { transform: translateY(-50%); }
`

const WhaleScroll = styled.div`
  height: 120px;
  overflow: hidden;
`

const WhaleTrack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  animation: ${whaleSlide} 18s linear infinite;
`

const WhaleRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 4px 8px;
  height: 30px;
  align-items: center;
  font-family: ${RADAR_FONT_BODY};
  font-size: 12px;
  color: ${radarStudioColors.muted};
`

const SmartRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 2px 8px;
  height: 30px;
  align-items: center;
  font-family: ${RADAR_FONT_BODY};
  font-size: 11px;
  color: ${radarStudioColors.muted};
`

export const RadarOpsLeftColumn: React.FC = () => {
  const whaleItems = [...WHALE_ROWS, ...WHALE_ROWS]

  return (
    <Column data-rd-ops-left>
      <RdSectionTitle style={{ fontSize: 22, marginBottom: 0 }}>Operational Intelligence</RdSectionTitle>
      <Panel data-rd-panel>
        <RdSectionTitle style={{ fontSize: 18, marginBottom: 8 }}>Whale Monitor</RdSectionTitle>
        <WhaleScroll data-rd-whale-feed>
          <WhaleTrack>
            {whaleItems.map((row, i) => (
              <WhaleRow key={`${row.wallet}-${i}`}>
                <span>
                  <strong style={{ color: radarStudioColors.white, fontFamily: RADAR_FONT_DISPLAY }}>
                    {row.wallet}
                  </strong>{' '}
                  · {row.token}
                </span>
                <span style={{ color: row.action === 'buy' ? radarStudioColors.green : radarStudioColors.red }}>
                  {row.action === 'buy' ? '↑' : '↓'} {row.amount}
                </span>
              </WhaleRow>
            ))}
          </WhaleTrack>
        </WhaleScroll>
      </Panel>

      <Panel data-rd-panel>
        <RdSectionTitle style={{ fontSize: 18, marginBottom: 8 }}>Smart Money Tracker</RdSectionTitle>
        {SMART_MONEY_ROWS.map((row) => (
          <SmartRow key={row.wallet}>
            <div>
              <div style={{ color: radarStudioColors.white, fontWeight: 700, fontFamily: RADAR_FONT_DISPLAY }}>
                {row.wallet}
              </div>
              <div>{row.lastActivity}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: radarStudioColors.green, fontWeight: 800, fontFamily: RADAR_FONT_DISPLAY }}>
                {row.roi}
              </div>
              <div>
                {row.winRate} · {row.confidence}
              </div>
            </div>
          </SmartRow>
        ))}
      </Panel>
    </Column>
  )
}

export default RadarOpsLeftColumn
