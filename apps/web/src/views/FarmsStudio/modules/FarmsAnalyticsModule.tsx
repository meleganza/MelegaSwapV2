/**
 * FARMS_MODULE_007 — Analytics (ecosystem health summary).
 * Desktop: 1376 × 240, four equal panels, 18px gap.
 * Does not modify Modules 001–006. Does not mount Module 008.
 */

import React from 'react'
import styled, { keyframes } from 'styled-components'
import { typography } from 'design-system/melega'
import { farmsAnalytics } from './farmsAnalyticsTokens'
import { useFarmsAnalytics } from './useFarmsAnalytics'
import { FarmsAnalyticsPanel } from './FarmsAnalyticsPanel'

const pulse = keyframes`
  0% { opacity: 0.45; }
  50% { opacity: 0.8; }
  100% { opacity: 0.45; }
`

const Module = styled.section`
  width: 100%;
  max-width: ${farmsAnalytics.contentMax};
  margin-top: -16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
  font-family: ${typography.fontFamily.body};

  @media (max-width: ${farmsAnalytics.mobileBreak}) {
    max-width: ${farmsAnalytics.mobileContent390};
    margin-left: auto;
    margin-right: auto;
  }

  @media (min-width: 391px) and (max-width: 430px) {
    max-width: ${farmsAnalytics.mobileContent430};
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
  height: ${farmsAnalytics.panelH};
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: ${farmsAnalytics.panelGap};
  min-width: 0;
  box-sizing: border-box;

  @media (max-width: ${farmsAnalytics.tabletBreak}) {
    height: auto;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: ${farmsAnalytics.mobileBreak}) {
    grid-template-columns: 1fr;
  }
`

const Skeleton = styled.div`
  height: 100%;
  min-height: ${farmsAnalytics.panelH};
  max-width: ${farmsAnalytics.panelW};
  width: 100%;
  border-radius: ${farmsAnalytics.radius};
  border: ${farmsAnalytics.border};
  background: rgba(255, 255, 255, 0.04);
  animation: ${pulse} 1.4s ease-in-out infinite;

  @media (max-width: ${farmsAnalytics.tabletBreak}) {
    max-width: none;
  }

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

export const FarmsAnalyticsModule: React.FC = () => {
  const vm = useFarmsAnalytics()

  return (
    <Module
      data-testid="farms-analytics-module"
      data-farms-module="007"
      data-farms-module-007="mounted"
      data-module-state={vm.state}
      aria-labelledby="farms-analytics-title"
    >
      <Header>
        <Title id="farms-analytics-title">Analytics</Title>
      </Header>
      <Grid data-testid="farms-analytics-grid">
        {vm.state === 'loading'
          ? [0, 1, 2, 3].map((i) => <Skeleton key={i} data-testid="farms-analytics-skeleton" />)
          : vm.panels.map((panel) => <FarmsAnalyticsPanel key={panel.id} panel={panel} />)}
      </Grid>
      <VisuallyHidden aria-live="polite">{vm.liveRegion}</VisuallyHidden>
    </Module>
  )
}

export default FarmsAnalyticsModule
