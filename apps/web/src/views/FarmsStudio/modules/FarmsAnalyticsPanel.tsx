/**
 * FARMS_MODULE_007 — single analytics panel (compact static chart).
 */

import React from 'react'
import styled from 'styled-components'
import { typography } from 'design-system/melega'
import { farmsAnalytics } from './farmsAnalyticsTokens'
import type { AnalyticsSegment, FarmsAnalyticsPanelModel } from './farmsAnalyticsTypes'

const Panel = styled.figure`
  margin: 0;
  width: 100%;
  max-width: ${farmsAnalytics.panelW};
  height: 100%;
  min-height: ${farmsAnalytics.panelH};
  box-sizing: border-box;
  padding: ${farmsAnalytics.pad};
  border-radius: ${farmsAnalytics.radius};
  border: ${farmsAnalytics.border};
  background: ${farmsAnalytics.bg};
  box-shadow: ${farmsAnalytics.shadow};
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
  font-family: ${typography.fontFamily.body};
  justify-self: stretch;

  @media (max-width: ${farmsAnalytics.tabletBreak}) {
    max-width: none;
    min-height: 200px;
    height: auto;
  }
`

const Title = styled.figcaption`
  margin: 0;
  font-size: ${farmsAnalytics.titleSize};
  line-height: ${farmsAnalytics.titleLine};
  font-weight: ${farmsAnalytics.titleWeight};
  color: ${farmsAnalytics.titleColor};
`

const Legend = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  flex: 1;
`

const LegendItem = styled.li`
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  font-size: 11px;
  line-height: 14px;
  color: rgba(255, 255, 255, 0.72);
`

const Dot = styled.span<{ $color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: ${({ $color }) => $color};
  flex-shrink: 0;
`

const LegendLabel = styled.span`
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const LegendValue = styled.span`
  font-weight: 700;
  color: #f5f5f5;
  flex-shrink: 0;
`

const Stats = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
`

const Stat = styled.li`
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
  line-height: 16px;
  color: rgba(255, 255, 255, 0.72);
`

const StatLabel = styled.span`
  min-width: 0;
`

const StatValue = styled.span`
  font-weight: 750;
  color: #f5f5f5;
  flex-shrink: 0;
`

const Summary = styled.p`
  margin: 0;
  margin-top: auto;
  font-size: 11px;
  line-height: 14px;
  color: ${farmsAnalytics.muted};
`

const Empty = styled.p`
  margin: auto 0;
  font-size: 13px;
  font-weight: 700;
  color: #f5f5f5;
  text-align: center;
`

const Stack = styled.div`
  display: flex;
  width: 100%;
  height: 10px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.06);
`

const StackSeg = styled.div<{ $flex: number; $color: string }>`
  flex: ${({ $flex }) => $flex};
  background: ${({ $color }) => $color};
  min-width: ${({ $flex }) => ($flex > 0 ? '2px' : '0')};
`

const VisuallyHidden = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`

function StackedBar({ segments }: { segments: AnalyticsSegment[] }) {
  const total = segments.reduce((s, seg) => s + Math.max(0, seg.count), 0)
  return (
    <Stack aria-hidden="true">
      {segments.map((seg) => (
        <StackSeg key={seg.id} $flex={total > 0 ? seg.count : 0} $color={seg.color} />
      ))}
    </Stack>
  )
}

function chartAlt(panel: FarmsAnalyticsPanelModel): string {
  if (!panel.segments.length) return `${panel.title}: ${panel.summary}`
  return `${panel.title}: ${panel.segments.map((s) => `${s.label} ${s.count}`).join(', ')}`
}

export const FarmsAnalyticsPanel: React.FC<{ panel: FarmsAnalyticsPanelModel }> = ({ panel }) => {
  const showStack =
    panel.id === 'farm_distribution' || panel.id === 'farm_health' || panel.id === 'reward_distribution'
  const unavailable = panel.state === 'unavailable' || panel.state === 'loading'

  return (
    <Panel data-testid="farms-analytics-panel" data-analytics-panel={panel.id} data-panel-state={panel.state}>
      <Title>{panel.title}</Title>

      {unavailable ? (
        <Empty>{panel.state === 'loading' ? 'Loading…' : '—'}</Empty>
      ) : (
        <>
          {showStack && panel.segments.length ? (
            <>
              <StackedBar segments={panel.segments} />
              <Legend>
                {panel.segments.map((seg) => (
                  <LegendItem key={seg.id}>
                    <Dot $color={seg.color} aria-hidden="true" />
                    <LegendLabel>{seg.label}</LegendLabel>
                    <LegendValue>{seg.count}</LegendValue>
                  </LegendItem>
                ))}
              </Legend>
              <VisuallyHidden>{chartAlt(panel)}</VisuallyHidden>
            </>
          ) : null}

          {panel.id === 'participation' ? (
            <Stats>
              {panel.stats.map((stat) => (
                <Stat key={stat.id}>
                  <StatLabel>{stat.label}</StatLabel>
                  <StatValue>{stat.value}</StatValue>
                </Stat>
              ))}
            </Stats>
          ) : null}

          <Summary>{panel.summary}</Summary>
        </>
      )}
    </Panel>
  )
}

export default FarmsAnalyticsPanel
