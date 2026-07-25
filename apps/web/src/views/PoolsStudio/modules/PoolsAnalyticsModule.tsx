/**
 * POOLS_MODULE_007 — Analytics (ecosystem health summary).
 * Desktop: 1376 × 240, four equal panels, 18px gap.
 * Does not modify Modules 001–006. Does not mount Modules 008–010.
 */

import React from 'react'
import styled, { keyframes } from 'styled-components'
import { typography } from 'design-system/melega'
import { poolsAnalytics } from './poolsAnalyticsTokens'
import { usePoolsAnalytics } from './usePoolsAnalytics'
import { PoolsAnalyticsPanel } from './PoolsAnalyticsPanel'

const pulse = keyframes`
  0% { opacity: 0.45; }
  50% { opacity: 0.8; }
  100% { opacity: 0.45; }
`

const Module = styled.section`
  width: 100%;
  max-width: ${poolsAnalytics.contentMax};
  margin-top: -16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
  font-family: ${typography.fontFamily.body};

  @media (max-width: ${poolsAnalytics.mobileBreak}) {
    max-width: none;
  }

  @media (prefers-reduced-motion: reduce) {
    * {
      animation: none !important;
      transition: none !important;
    }
  }
`

const Header = styled.header`
  display: flex;
  align-items: center;
  min-height: 0;
`

const Title = styled.h2`
  margin: 0;
  font-size: 18px;
  line-height: 22px;
  font-weight: 750;
  color: #f5f5f5;
`

const Grid = styled.div`
  width: 100%;
  height: ${poolsAnalytics.panelH};
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: ${poolsAnalytics.panelGap};
  min-width: 0;
  box-sizing: border-box;

  @media (max-width: ${poolsAnalytics.tabletBreak}) {
    height: auto;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: ${poolsAnalytics.mobileBreak}) {
    grid-template-columns: 1fr;
  }
`

const Skeleton = styled.div`
  height: 100%;
  min-height: ${poolsAnalytics.panelH};
  border-radius: ${poolsAnalytics.radius};
  border: ${poolsAnalytics.border};
  background: rgba(255, 255, 255, 0.04);
  animation: ${pulse} 1.4s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 0.55;
  }
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

export const PoolsAnalyticsModule: React.FC = () => {
  const vm = usePoolsAnalytics()

  return (
    <Module
      data-testid="pools-analytics-module"
      data-pools-module="007"
      data-pools-module-007="mounted"
      data-module-state={vm.state}
      aria-labelledby="pools-analytics-title"
    >
      <Header>
        <Title id="pools-analytics-title">Analytics</Title>
      </Header>
      <Grid data-testid="pools-analytics-grid">
        {vm.state === 'loading'
          ? [0, 1, 2, 3].map((i) => <Skeleton key={i} data-testid="pools-analytics-skeleton" />)
          : vm.panels.map((panel) => <PoolsAnalyticsPanel key={panel.id} panel={panel} />)}
      </Grid>
      <VisuallyHidden aria-live="polite">{vm.liveRegion}</VisuallyHidden>
    </Module>
  )
}

export default PoolsAnalyticsModule
