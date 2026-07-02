import React from 'react'
import styled, { keyframes } from 'styled-components'
import {
  AI_OPPORTUNITY,
  AI_WARNINGS,
  SMART_MONEY_ROWS,
  WHALE_ROWS,
} from '../radarStudioData'
import { RADAR_FONT, radarStudioColors, radarStudioLayout } from '../radarStudioTokens'
import { RdGhostBtn, RdPanel, RdSectionTitle, StatusDot } from './radarStudioPrimitives'

const Sidebar = styled.aside`
  display: flex;
  flex-direction: column;
  gap: ${radarStudioLayout.sectionGap};
  min-width: 0;
`

const Panel = styled(RdPanel)`
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const scrollUp = keyframes`
  0% { transform: translateY(0); }
  100% { transform: translateY(-50%); }
`

const ScrollList = styled.div`
  flex: 1;
  min-height: 0;
  overflow: hidden;
`

const ScrollTrack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  animation: ${scrollUp} 16s linear infinite;
`

const WhaleRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 4px 8px;
  font-family: ${RADAR_FONT};
  font-size: 12px;
  color: ${radarStudioColors.secondary};
`

const SmartRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 2px 8px;
  font-family: ${RADAR_FONT};
  font-size: 11px;
  color: ${radarStudioColors.secondary};
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
`

const GaugeWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`

const Gauge = styled.div<{ $score: number }>`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${RADAR_FONT};
  font-size: 28px;
  font-weight: 800;
  color: ${radarStudioColors.green};
  background: conic-gradient(
    ${radarStudioColors.green} ${({ $score }) => $score * 3.6}deg,
    rgba(255, 255, 255, 0.08) 0
  );
  position: relative;
  flex-shrink: 0;

  &::after {
    content: '';
    position: absolute;
    inset: 14px;
    border-radius: 50%;
    background: ${radarStudioColors.panel};
  }

  span {
    position: relative;
    z-index: 1;
  }
`

const WarningRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: ${RADAR_FONT};
  font-size: 12px;
  color: ${radarStudioColors.secondary};
`

export const RadarSidebar: React.FC = () => {
  const whaleItems = [...WHALE_ROWS, ...WHALE_ROWS]

  return (
    <Sidebar data-rd-sidebar>
      <Panel $height={radarStudioLayout.whaleHeight} data-rd-panel>
        <RdSectionTitle style={{ fontSize: 20, marginBottom: 4 }}>Whale Monitor</RdSectionTitle>
        <ScrollList>
          <ScrollTrack>
            {whaleItems.map((row, i) => (
              <WhaleRow key={`${row.wallet}-${i}`}>
                <span>
                  <strong style={{ color: radarStudioColors.white }}>{row.wallet}</strong> · {row.token}
                </span>
                <span style={{ color: row.action === 'buy' ? radarStudioColors.green : radarStudioColors.red }}>
                  {row.action === 'buy' ? '↑' : '↓'} {row.amount}
                </span>
              </WhaleRow>
            ))}
          </ScrollTrack>
        </ScrollList>
      </Panel>

      <Panel $height={radarStudioLayout.smartMoneyHeight} data-rd-panel>
        <RdSectionTitle style={{ fontSize: 20, marginBottom: 4 }}>Smart Money Tracker</RdSectionTitle>
        {SMART_MONEY_ROWS.map((row) => (
          <SmartRow key={row.wallet}>
            <div>
              <div style={{ color: radarStudioColors.white, fontWeight: 700 }}>{row.wallet}</div>
              <div>{row.lastActivity}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: radarStudioColors.green, fontWeight: 800 }}>{row.roi}</div>
              <div>{row.winRate} · {row.confidence}</div>
            </div>
          </SmartRow>
        ))}
      </Panel>

      <Panel $height={radarStudioLayout.opportunityHeight} data-rd-panel>
        <RdSectionTitle style={{ fontSize: 20, marginBottom: 4 }}>AI Opportunity Score</RdSectionTitle>
        <GaugeWrap>
          <Gauge $score={AI_OPPORTUNITY.score} data-rd-gauge>
            <span>{AI_OPPORTUNITY.score}</span>
          </Gauge>
          <div>
            <div style={{ fontFamily: RADAR_FONT, fontSize: 16, fontWeight: 800, color: radarStudioColors.green }}>
              {AI_OPPORTUNITY.recommendation}
            </div>
            <div
              style={{
                fontFamily: RADAR_FONT,
                fontSize: 12,
                color: radarStudioColors.secondary,
                marginTop: 6,
                lineHeight: 1.45,
              }}
            >
              {AI_OPPORTUNITY.summary}
            </div>
            <RdGhostBtn type="button" style={{ marginTop: 10, height: 36, fontSize: 12 }}>
              View Full Analysis
            </RdGhostBtn>
          </div>
        </GaugeWrap>
      </Panel>

      <Panel $height={radarStudioLayout.warningsHeight} data-rd-panel>
        <RdSectionTitle style={{ fontSize: 20, marginBottom: 4 }}>AI Warnings</RdSectionTitle>
        {AI_WARNINGS.map((row) => (
          <WarningRow key={row.label}>
            <StatusDot level={row.level} />
            {row.label}
          </WarningRow>
        ))}
      </Panel>
    </Sidebar>
  )
}

export default RadarSidebar
