import React from 'react'
import styled from 'styled-components'
import { PageMeta } from 'components/Layout/Page'
import { typography } from 'design-system/melega'
import TrendingRibbon from 'views/HomeTrade/TrendingRibbon'
import LiquidityStudioGlobalStyle from './LiquidityStudioGlobalStyle'
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
    padding: 0 0 24px;
  }
`

const Content = styled.div`
  max-width: ${liquidityStudioLayout.contentMax};
  margin: 0 auto;
  padding: ${liquidityStudioLayout.contentPaddingTop} ${liquidityStudioLayout.contentPaddingX} 0;
  box-sizing: border-box;
  min-width: 0;

  @media (max-width: 767px) {
    padding: 12px 16px 0;
  }
`

const PageGrid = styled.div`
  display: grid;
  gap: ${liquidityStudioLayout.columnGap};
  align-items: start;
  min-width: 0;

  @media (min-width: 1100px) {
    grid-template-columns: ${liquidityStudioLayout.leftWidth} ${liquidityStudioLayout.centerWidth} ${liquidityStudioLayout.rightWidth};
    grid-template-areas: 'builder preview right';
  }

  @media (max-width: 1099px) and (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
      'builder preview'
      'right right';
  }

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    grid-template-areas:
      'builder'
      'preview'
      'right';
  }
`

const AreaBuilder = styled.div`
  grid-area: builder;
  min-width: 0;
`

const AreaPreview = styled.div`
  grid-area: preview;
  min-width: 0;
`

const AreaRight = styled.div`
  grid-area: right;
  display: flex;
  flex-direction: column;
  gap: ${liquidityStudioLayout.columnGap};
  min-width: 0;
`

export const LiquidityStudioScreen: React.FC = () => (
  <Root data-liquidity-studio-screen="true">
    <PageMeta />
    <LiquidityStudioGlobalStyle />
    <TrendingRibbon />
    <Content>
      <LiquidityStudioPageHeader />
      <PageGrid>
        <AreaBuilder>
          <LiquidityBuilderPanel />
        </AreaBuilder>
        <AreaPreview>
          <PositionPreviewPanel />
        </AreaPreview>
        <AreaRight>
          <MarketIntelligencePanel />
          <AILiquidityAdvisorPanel />
          <TopPoolsPanel />
        </AreaRight>
      </PageGrid>
      <LiquidityActivityTable />
    </Content>
  </Root>
)

export default LiquidityStudioScreen
