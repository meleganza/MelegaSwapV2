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

const LayoutGrid = styled.div`
  display: grid;
  gap: ${liquidityStudioLayout.columnGap};
  align-items: stretch;
  min-width: 0;

  @media (min-width: 1100px) {
    grid-template-columns: ${liquidityStudioLayout.leftWidth} ${liquidityStudioLayout.centerWidth} ${liquidityStudioLayout.rightWidth};
    grid-template-areas:
      'builder preview right'
      'activity activity activity';
    max-width: ${liquidityStudioLayout.gridWidth};
    align-items: stretch;
  }

  @media (max-width: 1099px) and (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
      'builder preview'
      'right right'
      'activity activity';
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
`

const AreaPreview = styled.div`
  grid-area: preview;
  min-width: 0;
  min-height: ${liquidityStudioLayout.builderMinHeight};
  display: flex;
  flex-direction: column;
`

const AreaRight = styled.div`
  grid-area: right;
  display: flex;
  flex-direction: column;
  gap: ${liquidityStudioLayout.verticalRhythm};
  min-width: 0;
  width: 100%;
  max-width: ${liquidityStudioLayout.rightWidth};
  min-height: ${liquidityStudioLayout.builderMinHeight};

  @media (max-width: 767px) {
    display: contents;
  }
`

const AreaPools = styled.div`
  @media (max-width: 767px) {
    grid-area: pools;
  }

  @media (min-width: 1100px) {
    margin-top: auto;
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

const AreaActivity = styled.div`
  grid-area: activity;
  min-width: 0;
  margin-top: 2px;

  @media (min-width: 1100px) {
    margin-top: 16px;
    width: 100%;
    max-width: ${liquidityStudioLayout.gridWidth};
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
        </LayoutGrid>
      </Content>
    </LiquidityRuntimeProvider>
  </Root>
)

export default LiquidityStudioScreen
