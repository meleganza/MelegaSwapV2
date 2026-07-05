import React from 'react'
import styled from 'styled-components'
import { PageMeta } from 'components/Layout/Page'
import { typography } from 'design-system/melega'
import TrendingRibbon from 'views/HomeTrade/TrendingRibbon'
import AIHeatmapTable from './components/AIHeatmapTable'
import TrendingFilterRow from './components/TrendingFilterRow'
import TrendingKpiRow from './components/TrendingKpiRow'
import TrendingMachinePanel from './components/TrendingMachinePanel'
import TrendingNowGrid from './components/TrendingNowGrid'
import TrendingSidebar from './components/TrendingSidebar'
import TrendingStudioPageHeader from './components/TrendingStudioPageHeader'
import { TrendingRuntimeProvider } from './trendingRuntime/TrendingRuntimeContext'
import TrendingStudioGlobalStyle from './TrendingStudioGlobalStyle'
import { trendingStudioColors, trendingStudioLayout } from './trendingStudioTokens'

const Root = styled.div`
  color: ${trendingStudioColors.white};
  font-family: ${typography.fontFamily.body};
  background: ${trendingStudioColors.canvas};
  padding: 0 0 32px;
  min-width: 0;
  overflow-x: hidden;

  @media (max-width: 767px) {
    padding: 0 0 ${trendingStudioLayout.mobileBottomPad};
  }
`

const Content = styled.div`
  max-width: ${trendingStudioLayout.contentMax};
  margin: 0 auto;
  padding: ${trendingStudioLayout.contentPaddingTop} ${trendingStudioLayout.contentPaddingX}
    ${trendingStudioLayout.contentPaddingBottom};
  box-sizing: border-box;
  min-width: 0;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: ${trendingStudioLayout.sectionGap};
`

const PageGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, ${trendingStudioLayout.mainColumnWidth}) minmax(0, ${trendingStudioLayout.sidebarWidth});
  gap: ${trendingStudioLayout.columnGap};
  align-items: start;

  @media (max-width: ${trendingStudioLayout.stackBreakpoint}) {
    grid-template-columns: 1fr;
  }
`

const MainColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${trendingStudioLayout.sectionGap};
  min-width: 0;
`

const TrendingStudioContent: React.FC = () => (
  <Root data-trending-studio-screen="true" data-r200-premium="true">
    <PageMeta />
    <TrendingStudioGlobalStyle />
    <TrendingRibbon />
    <Content>
      <PageGrid data-tr-page-grid>
        <MainColumn>
          <TrendingStudioPageHeader />
          <TrendingKpiRow />
          <TrendingFilterRow />
          <AIHeatmapTable />
          <TrendingNowGrid />
          <TrendingMachinePanel />
        </MainColumn>
        <TrendingSidebar />
      </PageGrid>
    </Content>
  </Root>
)

export const TrendingStudioScreen: React.FC = () => (
  <TrendingRuntimeProvider>
    <TrendingStudioContent />
  </TrendingRuntimeProvider>
)

export default TrendingStudioScreen
