import React from 'react'
import styled from 'styled-components'
import { useRadarRuntime } from '../radarRuntime/RadarRuntimeContext'
import { RADAR_FONT_BODY, RADAR_FONT_DISPLAY, radarStudioColors, radarStudioLayout } from '../radarStudioTokens'
import { RdPanel, RdSectionTitle } from './radarStudioPrimitives'

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
  width: 100%;
  max-width: ${radarStudioLayout.opsPanelWidth};
  height: 100%;
`

const Panel = styled(RdPanel)`
  width: ${radarStudioLayout.opsPanelWidth};
  max-width: 100%;
  padding: ${radarStudioLayout.cardPadding};
`

const WhaleRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 4px 8px;
  height: 30px;
  align-items: center;
  font-family: ${RADAR_FONT_BODY};
  font-size: 12px;
  font-weight: 500;
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
  font-weight: 500;
  color: ${radarStudioColors.muted};
`

const AccumRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 6px 8px;
  height: 30px;
  align-items: center;
  font-family: ${RADAR_FONT_BODY};
  font-size: 12px;
  font-weight: 500;
  color: ${radarStudioColors.muted};
`

export const RadarOpsLeftColumn: React.FC = () => {
  const { whales, smartMoney, walletAccumulation, intelligenceFeedsAvailable } = useRadarRuntime()

  if (!intelligenceFeedsAvailable) {
    return null
  }

  return (
    <Column data-rd-ops-left>
      <RdSectionTitle>Operational Intelligence</RdSectionTitle>
      <Panel data-rd-panel>
        <RdSectionTitle style={{ fontSize: 18, marginBottom: 10 }}>Whale Monitor</RdSectionTitle>
        {whales.map((row) => (
          <WhaleRow key={row.wallet}>
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
      </Panel>

      <Panel data-rd-panel>
        <RdSectionTitle style={{ fontSize: 18, marginBottom: 10 }}>Smart Money Tracker</RdSectionTitle>
        {smartMoney.map((row) => (
          <SmartRow key={row.wallet}>
            <div>
              <div style={{ color: radarStudioColors.white, fontWeight: 800, fontFamily: RADAR_FONT_DISPLAY }}>
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

      <Panel data-rd-panel>
        <RdSectionTitle style={{ fontSize: 18, marginBottom: 10 }}>Top Wallet Accumulation</RdSectionTitle>
        {walletAccumulation.map((row) => (
          <AccumRow key={row.wallet}>
            <span>
              <strong style={{ color: radarStudioColors.white, fontFamily: RADAR_FONT_DISPLAY }}>
                {row.wallet}
              </strong>{' '}
              · {row.token}
            </span>
            <span style={{ color: radarStudioColors.green, fontWeight: 800 }}>{row.amount}</span>
            <span style={{ color: radarStudioColors.green, fontFamily: RADAR_FONT_DISPLAY, fontWeight: 800 }}>
              {row.confidence}
            </span>
          </AccumRow>
        ))}
      </Panel>
    </Column>
  )
}

export default RadarOpsLeftColumn
