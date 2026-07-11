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

/** R781 — institutional pixel grid: builder | preview | right rail; activity under builder+preview only. */
const LayoutGrid = styled.div`
  display: grid;
  gap: ${liquidityStudioLayout.columnGap};
  align-items: stretch;
  min-width: 0;

  @media (min-width: 1100px) {
    grid-template-columns: ${liquidityStudioLayout.leftWidth} ${liquidityStudioLayout.centerWidth} ${liquidityStudioLayout.rightWidth};
    grid-template-rows: minmax(${liquidityStudioLayout.builderMinHeight}, auto) auto;
    grid-template-areas:
      'builder preview right'
      'activity activity .';
    max-width: ${liquidityStudioLayout.gridWidth};
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
      'lpinfo'
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
  display: flex;
  flex-direction: column;
  gap: ${liquidityStudioLayout.verticalRhythm};
  min-width: 0;
  width: 100%;
  max-width: ${liquidityStudioLayout.rightWidth};
  min-height: ${liquidityStudioLayout.builderMinHeight};

  & > * {
    width: 100%;
    max-width: ${liquidityStudioLayout.rightWidth};
    box-sizing: border-box;
  }

  @media (max-width: 1099px) {
    max-width: 100%;
  }

  @media (max-width: 767px) {
    display: contents;
  }
`

const AreaActivity = styled.div`
  grid-area: activity;
  min-width: 0;
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
