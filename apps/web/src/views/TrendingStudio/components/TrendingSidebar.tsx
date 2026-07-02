import React from 'react'
import styled from 'styled-components'
import {
  AI_DISCOVERIES,
  AI_OPPORTUNITY,
  AI_WARNINGS,
  SMART_MONEY_ROWS,
  WHALE_ACTIVITY,
} from '../trendingStudioData'
import { trendingStudioColors, trendingStudioLayout } from '../trendingStudioTokens'
import { TrLabel, TrPanel, TrSectionTitle, TrStatusBadge } from './trendingStudioPrimitives'

const Sidebar = styled.aside`
  display: flex;
  flex-direction: column;
  gap: ${trendingStudioLayout.sectionGap};
  min-width: 0;
`

const Panel = styled(TrPanel)`
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const WhalePanel = styled(Panel)`
  height: ${trendingStudioLayout.whaleMonitorHeight};
  min-height: ${trendingStudioLayout.whaleMonitorHeight};
`

const SmartPanel = styled(Panel)`
  height: ${trendingStudioLayout.smartMoneyHeight};
  min-height: ${trendingStudioLayout.smartMoneyHeight};
`

const DiscoveriesPanel = styled(Panel)`
  height: ${trendingStudioLayout.discoveriesHeight};
  min-height: ${trendingStudioLayout.discoveriesHeight};
`

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-height: 0;
  overflow: auto;
`

const WhaleRow = styled.div`
  display: grid;
  grid-template-columns: 18px 1fr auto;
  gap: 8px;
  align-items: center;
  font-size: 13px;
`

const Arrow = styled.span<{ $direction: 'buy' | 'sell' | 'transfer' }>`
  font-size: 14px;
  font-weight: 800;
  color: ${({ $direction }) =>
    $direction === 'buy'
      ? trendingStudioColors.green
      : $direction === 'sell'
        ? trendingStudioColors.red
        : trendingStudioColors.orange};
`

const SmartRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 4px 8px;
  font-size: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`

const OpportunityWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`

const Ring = styled.div<{ $score: number }>`
  width: ${trendingStudioLayout.opportunityRing};
  height: ${trendingStudioLayout.opportunityRing};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 800;
  color: ${trendingStudioColors.green};
  background: conic-gradient(
    ${trendingStudioColors.green} ${({ $score }) => $score * 3.6}deg,
    rgba(255, 255, 255, 0.08) 0
  );
  position: relative;

  &::after {
    content: '';
    position: absolute;
    inset: 10px;
    border-radius: 50%;
    background: ${trendingStudioColors.panel};
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
  font-size: 13px;
  color: ${trendingStudioColors.gray};
`

const Dot = styled.span<{ $level: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${({ $level }) =>
    $level === 'green'
      ? trendingStudioColors.green
      : $level === 'yellow'
        ? trendingStudioColors.yellow
        : $level === 'orange'
          ? trendingStudioColors.orange
          : trendingStudioColors.red};
`

const DiscoveryTable = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-height: 0;
  overflow: auto;
`

const DiscoveryRow = styled.div`
  display: grid;
  grid-template-columns: 52px 1fr auto;
  gap: 8px;
  align-items: center;
  font-size: 12px;
`

export const TrendingSidebar: React.FC = () => (
  <Sidebar data-tr-sidebar>
    <WhalePanel data-tr-panel>
      <TrSectionTitle style={{ fontSize: 22, marginBottom: 4 }}>Whale Monitor</TrSectionTitle>
      <List>
        {WHALE_ACTIVITY.map((row) => (
          <WhaleRow key={`${row.wallet}-${row.time}`}>
            <Arrow $direction={row.direction}>
              {row.direction === 'buy' ? '↑' : row.direction === 'sell' ? '↓' : '↔'}
            </Arrow>
            <span>
              <strong style={{ color: trendingStudioColors.white }}>{row.wallet}</strong>
              <br />
              {row.amount} {row.token}
            </span>
            <span style={{ color: trendingStudioColors.gray }}>{row.time}</span>
          </WhaleRow>
        ))}
      </List>
    </WhalePanel>

    <SmartPanel data-tr-panel>
      <TrSectionTitle style={{ fontSize: 22, marginBottom: 4 }}>Smart Money Tracker</TrSectionTitle>
      <List>
        {SMART_MONEY_ROWS.map((row) => (
          <SmartRow key={row.wallet}>
            <div>
              <div style={{ color: trendingStudioColors.white, fontWeight: 700 }}>{row.wallet}</div>
              <div>{row.performance}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: trendingStudioColors.green, fontWeight: 800 }}>{row.roi}</div>
              <div>{row.lastTrade}</div>
              <div>{row.confidence}</div>
            </div>
          </SmartRow>
        ))}
      </List>
    </SmartPanel>

    <Panel data-tr-panel>
      <TrSectionTitle style={{ fontSize: 22, marginBottom: 4 }}>AI Opportunity Score</TrSectionTitle>
      <OpportunityWrap>
        <Ring data-tr-opportunity-ring $score={AI_OPPORTUNITY.score}>
          <span>{AI_OPPORTUNITY.score}</span>
        </Ring>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: trendingStudioColors.green }}>
            {AI_OPPORTUNITY.recommendation}
          </div>
          <div style={{ fontSize: 13, color: trendingStudioColors.gray, marginTop: 6, lineHeight: 1.45 }}>
            {AI_OPPORTUNITY.summary}
          </div>
        </div>
      </OpportunityWrap>
    </Panel>

    <Panel data-tr-panel>
      <TrSectionTitle style={{ fontSize: 22, marginBottom: 4 }}>AI Warnings</TrSectionTitle>
      <List>
        {AI_WARNINGS.map((warning) => (
          <WarningRow key={warning.label}>
            <Dot $level={warning.level} />
            {warning.label}
          </WarningRow>
        ))}
      </List>
    </Panel>

    <DiscoveriesPanel data-tr-panel>
      <TrSectionTitle style={{ fontSize: 22, marginBottom: 4 }}>Recent AI Discoveries</TrSectionTitle>
      <DiscoveryTable>
        {AI_DISCOVERIES.map((row) => (
          <DiscoveryRow key={`${row.project}-${row.time}`}>
            <span style={{ color: trendingStudioColors.gray }}>{row.time}</span>
            <span>
              <strong style={{ color: trendingStudioColors.white }}>{row.project}</strong> · {row.event}
              <br />
              <TrLabel>{row.score}</TrLabel>
            </span>
            <TrStatusBadge $status={row.status}>{row.status}</TrStatusBadge>
          </DiscoveryRow>
        ))}
      </DiscoveryTable>
    </DiscoveriesPanel>
  </Sidebar>
)

export default TrendingSidebar
