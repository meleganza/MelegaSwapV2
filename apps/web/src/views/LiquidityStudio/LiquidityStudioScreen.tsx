import React from 'react'
import styled from 'styled-components'
import { PageMeta } from 'components/Layout/Page'
import { typography } from 'design-system/melega'
import TrendingRibbon from 'views/HomeTrade/TrendingRibbon'
import LiquidityStudioGlobalStyle from './LiquidityStudioGlobalStyle'
import { LiquidityRuntimeProvider } from './liquidityRuntime/LiquidityRuntimeContext'
import LiquidityStudioPageHeader from './components/LiquidityStudioPageHeader'
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

/** R788 — institutional pixel grid: builder | preview | right rail; activity spans builder+preview only. */
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
      'activity activity .';
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
  grid-template-rows: auto auto auto;
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

const AreaPools = styled.div`
  @media (max-width: 767px) {
    grid-area: pools;
  }
`

export const LiquidityStudioScreen: React.FC = () => (
  <Root data-liquidity-studio-screen="true" data-r200-premium="true">
    <PageMeta />
    <LiquidityStudioGlobalStyle />
    <TrendingRibbon />
    <LiquidityRuntimeProvider>
      <Content>
        <LiquidityStudioPageHeader />
        <LayoutGrid>
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
            <AreaPools>
              <TopPoolsPanel />
            </AreaPools>
          </AreaRight>
          <AreaActivity>
            <LiquidityActivityTable />
          </AreaActivity>
          <AreaLpInfo>
            <LiquidityLpInfoPanel />
          </AreaLpInfo>
        </LayoutGrid>
      </Content>
    </LiquidityRuntimeProvider>
  </Root>
)

export default LiquidityStudioScreen
