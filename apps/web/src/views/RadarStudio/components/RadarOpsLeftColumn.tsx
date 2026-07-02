import React from 'react'
import styled, { keyframes } from 'styled-components'
import { SMART_MONEY_ROWS, WHALE_ROWS } from '../radarStudioData'
import { RADAR_FONT_BODY, RADAR_FONT_DISPLAY, radarStudioColors } from '../radarStudioTokens'
import { RdPanel, RdSectionTitle } from './radarStudioPrimitives'

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
`

const OpsLabel = styled.span`
  font-family: ${RADAR_FONT_DISPLAY};
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${radarStudioColors.grey};
  margin-bottom: -4px;
`

const Panel = styled(RdPanel)`
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const whaleSlide = keyframes`
  0% { transform: translateY(0); }
  100% { transform: translateY(-50%); }
`

const WhaleScroll = styled.div`
  height: 140px;
  overflow: hidden;
`

const WhaleTrack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  animation: ${whaleSlide} 18s linear infinite;
`

const WhaleRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 4px 8px;
  font-family: ${RADAR_FONT_BODY};
  font-size: 12px;
  color: ${radarStudioColors.secondary};
`

const SmartRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 2px 8px;
  font-family: ${RADAR_FONT_BODY};
  font-size: 11px;
  color: ${radarStudioColors.secondary};
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`

export const RadarOpsLeftColumn: React.FC = () => {
  const whaleItems = [...WHALE_ROWS, ...WHALE_ROWS]

  return (
    <Column data-rd-ops-left>
      <OpsLabel>Operational Intelligence</OpsLabel>
      <Panel data-rd-panel>
        <RdSectionTitle style={{ fontSize: 18, marginBottom: 6 }}>Whale Monitor</RdSectionTitle>
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
        <RdSectionTitle style={{ fontSize: 18, marginBottom: 6 }}>Smart Money Tracker</RdSectionTitle>
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
