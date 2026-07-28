/**
 * POOLS_MODULE_007 — single analytics panel (compact static chart).
 */

import React from 'react'
import styled from 'styled-components'
import { typography } from 'design-system/melega'
import { poolsAnalytics } from './poolsAnalyticsTokens'
import type { AnalyticsSegment, PoolsAnalyticsPanelModel } from './poolsAnalyticsTypes'

const Panel = styled.article`
  width: 100%;
  height: 100%;
  min-height: ${poolsAnalytics.panelH};
  box-sizing: border-box;
  padding: ${poolsAnalytics.pad};
  border-radius: ${poolsAnalytics.radius};
  border: ${poolsAnalytics.border};
  background: ${poolsAnalytics.bg};
  box-shadow: ${poolsAnalytics.shadow};
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
  font-family: ${typography.fontFamily.body};

  @media (max-width: ${poolsAnalytics.tabletBreak}) {
    min-height: 200px;
    height: auto;
  }
`

const Title = styled.h3`
  margin: 0;
  font-size: ${poolsAnalytics.titleSize};
  line-height: ${poolsAnalytics.titleLine};
  font-weight: ${poolsAnalytics.titleWeight};
  color: ${poolsAnalytics.titleColor};
`

const ChartRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
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
  color: ${poolsAnalytics.muted};
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

function Pie({ segments }: { segments: AnalyticsSegment[] }) {
  const total = segments.reduce((s, seg) => s + seg.count, 0)
  const size = 72
  const r = 28
  const cx = size / 2
  const cy = size / 2
  if (total <= 0) {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="12" />
      </svg>
    )
  }
  let angle = -Math.PI / 2
  const paths: React.ReactNode[] = []
  segments.forEach((seg) => {
    if (seg.count <= 0) return
    const sweep = (seg.count / total) * Math.PI * 2
    const x1 = cx + r * Math.cos(angle)
    const y1 = cy + r * Math.sin(angle)
    angle += sweep
    const x2 = cx + r * Math.cos(angle)
    const y2 = cy + r * Math.sin(angle)
    const large = sweep > Math.PI ? 1 : 0
    if (Math.abs(sweep - Math.PI * 2) < 1e-6) {
      paths.push(
        <circle key={seg.id} cx={cx} cy={cy} r={r} fill="none" stroke={seg.color} strokeWidth="12" />,
      )
      return
    }
    paths.push(
      <path
        key={seg.id}
        d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`}
        fill="none"
        stroke={seg.color}
        strokeWidth="12"
        strokeLinecap="butt"
      />,
    )
  })
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      {paths}
    </svg>
  )
}

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

export const PoolsAnalyticsPanel: React.FC<{ panel: PoolsAnalyticsPanelModel }> = ({ panel }) => {
  const showPie = panel.id === 'pool_distribution' || panel.id === 'reward_distribution'
  const showStack = panel.id === 'pool_health'
  const unavailable = panel.state === 'unavailable' || panel.state === 'loading'

  return (
    <Panel data-testid="pools-analytics-panel" data-analytics-panel={panel.id} data-panel-state={panel.state}>
      <Title>{panel.title}</Title>

      {unavailable ? (
        <Empty>{panel.state === 'loading' ? 'Loading…' : '—'}</Empty>
      ) : (
        <>
          {showPie && panel.segments.length ? (
            <ChartRow>
              <Pie segments={panel.segments} />
              <Legend>
                {panel.segments.map((seg) => (
                  <LegendItem key={seg.id}>
                    <Dot $color={seg.color} />
                    <LegendLabel>{seg.label}</LegendLabel>
                    <LegendValue>{seg.count}</LegendValue>
                  </LegendItem>
                ))}
              </Legend>
            </ChartRow>
          ) : null}

          {showStack && panel.segments.length ? (
            <>
              <StackedBar segments={panel.segments} />
              <Legend>
                {panel.segments.map((seg) => (
                  <LegendItem key={seg.id}>
                    <Dot $color={seg.color} />
                    <LegendLabel>{seg.label}</LegendLabel>
                    <LegendValue>{seg.count}</LegendValue>
                  </LegendItem>
                ))}
              </Legend>
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

export default PoolsAnalyticsPanel
