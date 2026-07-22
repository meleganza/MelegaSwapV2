import React from 'react'
import styled from 'styled-components'
import { PageMeta } from 'components/Layout/Page'
import { typography } from 'design-system/melega'
import TrendingRibbon from 'views/HomeTrade/TrendingRibbon'
import LiquidityStudioGlobalStyle from './LiquidityStudioGlobalStyle'
import { LiquidityRuntimeProvider, useLiquidityRuntime } from './liquidityRuntime/LiquidityRuntimeContext'
import LiquidityStudioPageHeader from './components/LiquidityStudioPageHeader'
import YourLiquidityPositionsSection from './components/YourLiquidityPositionsSection'
import LiquidityBuilderPanel from './components/LiquidityBuilderPanel'
import PositionPreviewPanel from './components/PositionPreviewPanel'
import MarketIntelligencePanel from './components/MarketIntelligencePanel'
import AILiquidityAdvisorPanel from './components/AILiquidityAdvisorPanel'
import TopPoolsPanel from './components/TopPoolsPanel'
import LiquidityActivityTable from './components/LiquidityActivityTable'
import LiquidityLpInfoPanel from './components/LiquidityLpInfoPanel'
import { liquidityStudioColors, liquidityStudioLayout } from './liquidityStudioTokens'

const Root = styled.div`
  color: ${liquidityStudioColors.text};
  font-family: ${typography.fontFamily.body};
  background: ${liquidityStudioColors.canvas};
  padding: 0 0 32px;
  min-width: 0;
  overflow-x: hidden;

  @media (max-width: 767px) {
    padding: 0 0 ${liquidityStudioLayout.mobileBottomPad};
  }
`

const Content = styled.div`
  max-width: ${liquidityStudioLayout.contentMax};
  margin: 0 auto;
  padding: ${liquidityStudioLayout.contentPaddingTop} ${liquidityStudioLayout.contentPaddingX}
    ${liquidityStudioLayout.contentPaddingBottom};
  box-sizing: border-box;
  min-width: 0;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: ${liquidityStudioLayout.sectionGap};

  @media (max-width: 767px) {
    padding: 16px 16px ${liquidityStudioLayout.mobileBottomPad};
  }
`

/** R791 — institutional grid: builder | preview | right rail; activity | activity | top pools. */
const LayoutGrid = styled.div`
  display: grid;
  gap: 20px;
  align-items: stretch;
  min-width: 0;

  & > * {
    min-width: 0;
  }

  @media (min-width: 1200px) {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(300px, 0.72fr);
    grid-template-rows: auto auto;
    grid-template-areas:
      'builder preview right'
      'activity activity topPools';
  }

  @media (min-width: 768px) and (max-width: 1199px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-areas:
      'builder preview'
      'right right'
      'activity activity';
    gap: 18px;
  }

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    grid-template-areas:
      'builder'
      'preview'
      'market'
      'advisor'
      'pools'
      'activity';
  }
`

const AreaBuilder = styled.div`
  grid-area: builder;
  min-width: 0;
  min-height: ${liquidityStudioLayout.builderMinHeight};
  display: flex;
  flex-direction: column;

  & > * {
    flex: 1;
    width: 100%;
  }
`

const AreaPreview = styled.div`
  grid-area: preview;
  min-width: 0;
  min-height: ${liquidityStudioLayout.builderMinHeight};
  display: flex;
  flex-direction: column;

  & > * {
    flex: 1;
    width: 100%;
  }
`

const AreaRight = styled.div`
  grid-area: right;
  display: grid;
  grid-template-rows: auto auto;
  gap: 20px;
  align-content: start;
  min-width: 0;
  width: 100%;

  & > * {
    width: 100%;
    box-sizing: border-box;
    min-width: 0;
  }

  @media (max-width: 1199px) and (min-width: 768px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    grid-template-rows: auto;
  }

  @media (max-width: 767px) {
    display: contents;
  }
`

const AreaActivity = styled.div`
  grid-area: activity;
  min-width: 0;
  margin-top: 0;
`

const AreaLpInfo = styled.div`
  @media (min-width: 768px) {
    display: none;
  }

  @media (max-width: 767px) {
    grid-area: lpinfo;
  }
`

const AreaMarket = styled.div`
  @media (max-width: 767px) {
    grid-area: market;
  }
`

const AreaAdvisor = styled.div`
  @media (max-width: 767px) {
    grid-area: advisor;
  }
`

const AreaTopPools = styled.div`
  grid-area: topPools;
  min-width: 0;
  display: flex;
  flex-direction: column;

  & > * {
    flex: 1;
    width: 100%;
  }
`

const AreaPools = styled.div`
  @media (max-width: 767px) {
    grid-area: pools;
  }
`

const BuildingDiscovery = styled.section`
  padding: 24px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: #111111;
  color: ${liquidityStudioColors.secondary};
  font-size: 14px;
  line-height: 1.5;

  h2 {
    margin: 0 0 8px;
    color: ${liquidityStudioColors.text};
    font-size: 20px;
    font-weight: 700;
  }
`

/** Thin discovery surface for `?view=building` — full LB content redesign is out of DS001.2 scope. */
const LiquidityBuildingDiscoveryPanel: React.FC = () => (
  <BuildingDiscovery data-testid="ls-liquidity-building-discovery" data-ls-view="building">
    <h2>Liquidity Building</h2>
    <p>
      Liquidity Building discovery is available at this certified destination. Activation and execution remain
      governed by Liquidity Building V1 readiness — content redesign is deferred.
    </p>
  </BuildingDiscovery>
)

const LiquidityStudioBody: React.FC = () => {
  const { mode } = useLiquidityRuntime()
  if (mode === 'Liquidity Building') {
    return (
      <>
        <LiquidityStudioPageHeader />
        <LiquidityBuildingDiscoveryPanel />
      </>
    )
  }
  return (
    <>
      <LiquidityStudioPageHeader />
      <YourLiquidityPositionsSection />
      <LayoutGrid data-ls-explore-grid="true">
        <AreaBuilder>
          <LiquidityBuilderPanel />
        </AreaBuilder>
        <AreaPreview>
          <PositionPreviewPanel />
        </AreaPreview>
        <AreaRight>
          <AreaMarket>
            <MarketIntelligencePanel />
          </AreaMarket>
          <AreaAdvisor>
            <AILiquidityAdvisorPanel />
          </AreaAdvisor>
        </AreaRight>
        <AreaActivity>
          <LiquidityActivityTable />
        </AreaActivity>
        <AreaTopPools>
          <TopPoolsPanel />
        </AreaTopPools>
        <AreaLpInfo>
          <LiquidityLpInfoPanel />
        </AreaLpInfo>
      </LayoutGrid>
    </>
  )
}

export const LiquidityStudioScreen: React.FC = () => (
  <Root data-liquidity-studio-screen="true" data-r200-premium="true" data-ls-wallet-first="true">
    <PageMeta />
    <LiquidityStudioGlobalStyle />
    <TrendingRibbon />
    <LiquidityRuntimeProvider>
      <Content>
        <LiquidityStudioBody />
      </Content>
    </LiquidityRuntimeProvider>
  </Root>
)

export default LiquidityStudioScreen
