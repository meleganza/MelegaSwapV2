import React from 'react'
import styled from 'styled-components'
import { useTrendingRuntime } from '../trendingRuntime/TrendingRuntimeContext'
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
  height: auto;
  min-height: 0;
`

const SmartPanel = styled(Panel)`
  height: auto;
  min-height: 0;
`

const DiscoveriesPanel = styled(Panel)`
  height: auto;
  min-height: 0;
  max-height: ${trendingStudioLayout.discoveriesHeight};
`

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-height: 0;
  overflow: auto;
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

const Unavailable = styled.p`
  margin: 0;
  font-size: 13px;
  color: ${trendingStudioColors.gray};
  line-height: 1.45;
`

export const TrendingSidebar: React.FC = () => {
  const { discoveries, warnings, opportunity } = useTrendingRuntime()

  return (
    <Sidebar data-tr-sidebar>
      <WhalePanel data-tr-panel>
        <TrSectionTitle style={{ fontSize: 22, marginBottom: 4 }}>Whale Monitor</TrSectionTitle>
        <Unavailable>Unavailable — whale activity feed is not connected to a live data source.</Unavailable>
      </WhalePanel>

      <SmartPanel data-tr-panel>
        <TrSectionTitle style={{ fontSize: 22, marginBottom: 4 }}>Smart Money Tracker</TrSectionTitle>
        <Unavailable>Unavailable — smart money tracking requires external wallet intelligence.</Unavailable>
      </SmartPanel>

      <Panel data-tr-panel>
        <TrSectionTitle style={{ fontSize: 22, marginBottom: 4 }}>Runtime Signal</TrSectionTitle>
        <OpportunityWrap>
          <Ring data-tr-opportunity-ring $score={opportunity.score}>
            <span>{opportunity.score > 0 ? opportunity.score : '—'}</span>
          </Ring>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: trendingStudioColors.gold }}>
              {opportunity.signalLabel}
            </div>
            <div style={{ fontSize: 13, color: trendingStudioColors.gray, marginTop: 6, lineHeight: 1.45 }}>
              {opportunity.summary}
            </div>
          </div>
        </OpportunityWrap>
      </Panel>

      <Panel data-tr-panel>
        <TrSectionTitle style={{ fontSize: 22, marginBottom: 4 }}>Availability Warnings</TrSectionTitle>
        <List>
          {warnings.map((warning) => (
            <WarningRow key={warning.label}>
              <Dot $level={warning.level} />
              {warning.label}
            </WarningRow>
          ))}
        </List>
      </Panel>

      <DiscoveriesPanel data-tr-panel>
        <TrSectionTitle style={{ fontSize: 22, marginBottom: 4 }}>Recent Registry Discoveries</TrSectionTitle>
        <DiscoveryTable>
          {discoveries.map((row) => (
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
}

export default TrendingSidebar
