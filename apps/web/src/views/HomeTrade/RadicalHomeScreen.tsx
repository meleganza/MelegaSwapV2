/**
 * Phone home — Swap is the screen. MARCO Bridge is the next tab.
 * No rankings, KPIs, featured rails, Boost, or withdraw chips.
 */
import React from 'react'
import styled from 'styled-components'
import { PageMeta } from 'components/Layout/Page'
import { DataSurfaceErrorBoundary } from 'components/ErrorBoundary'
import { uxRebuildColors, uxRebuildFont } from 'design-system/melega/tokens/uxRebuild'
import HomeTradeGlobalStyle from './HomeTradeGlobalStyle'
import HomeSwapPanel from './HomeSwapPanel'

const Root = styled.div`
  color: ${uxRebuildColors.text};
  font-family: ${uxRebuildFont};
  min-width: 0;
`

const Content = styled.div`
  width: min(440px, 100%);
  margin: 0 auto;
  padding: 4px 0 12px;
  min-width: 0;
`

const VisuallyHidden = styled.h1`
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

const RadicalHomeScreen: React.FC = () => (
  <Root data-radical-home data-testid="radical-home">
    <PageMeta />
    <HomeTradeGlobalStyle />
    <Content>
      <VisuallyHidden>Swap</VisuallyHidden>
      <DataSurfaceErrorBoundary surface="Homepage Swap">
        <section id="swap" data-home-section="swap" data-testid="dex-home-instant-swap">
          <HomeSwapPanel />
        </section>
      </DataSurfaceErrorBoundary>
    </Content>
  </Root>
)

export default RadicalHomeScreen
