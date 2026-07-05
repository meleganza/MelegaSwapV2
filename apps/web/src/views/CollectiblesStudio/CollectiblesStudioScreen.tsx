import React from 'react'
import styled from 'styled-components'
import { PageMeta } from 'components/Layout/Page'
import TrendingRibbon from 'views/HomeTrade/TrendingRibbon'
import CollectiblesStudioGlobalStyle from './CollectiblesStudioGlobalStyle'
import { CollectiblesRuntimeProvider } from './collectiblesRuntime/CollectiblesRuntimeContext'
import AICollectionAdvisorPanel from './components/AICollectionAdvisorPanel'
import CollectiblesBottomCta from './components/CollectiblesBottomCta'
import CollectiblesFilterRow from './components/CollectiblesFilterRow'
import CollectiblesGrid from './components/CollectiblesGrid'
import CollectiblesKpiRow from './components/CollectiblesKpiRow'
import CollectiblesRightSidebar from './components/CollectiblesRightSidebar'
import CollectiblesStudioPageHeader from './components/CollectiblesStudioPageHeader'
import FeaturedCollectionPanel from './components/FeaturedCollectionPanel'
import { CS_FONT_BODY, collectiblesStudioColors, collectiblesStudioLayout } from './collectiblesStudioTokens'

const Root = styled.div`
  color: ${collectiblesStudioColors.white};
  font-family: ${CS_FONT_BODY};
  background: ${collectiblesStudioColors.pageBg};
  padding: 0 0 32px;
  min-width: 0;
  overflow-x: hidden;

  @media (max-width: 768px) {
    padding: 0 0 ${collectiblesStudioLayout.mobileBottomPad};
  }
`

const Content = styled.div`
  max-width: ${collectiblesStudioLayout.contentMax};
  margin: 0 auto;
  padding: ${collectiblesStudioLayout.contentPaddingTop} ${collectiblesStudioLayout.contentPaddingX}
    ${collectiblesStudioLayout.contentPaddingBottom};
  box-sizing: border-box;
  min-width: 0;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: ${collectiblesStudioLayout.sectionGap};

  @media (max-width: 768px) {
    padding: 20px;
  }
`

const FeaturedRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) ${collectiblesStudioLayout.advisorWidth};
  gap: ${collectiblesStudioLayout.gridGap};
  align-items: stretch;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const MainRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) ${collectiblesStudioLayout.sidebarWidth};
  gap: ${collectiblesStudioLayout.gridGap};
  align-items: start;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const GridSlot = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: ${collectiblesStudioLayout.sectionGap};
`

export const CollectiblesStudioScreen: React.FC = () => (
  <CollectiblesRuntimeProvider>
  <Root data-collectibles-studio-screen="true" data-r200-premium="true">
    <PageMeta />
    <CollectiblesStudioGlobalStyle />
    <TrendingRibbon />
    <Content>
      <CollectiblesStudioPageHeader />
      <CollectiblesKpiRow />
      <FeaturedRow data-cs-featured-row>
        <FeaturedCollectionPanel />
        <AICollectionAdvisorPanel />
      </FeaturedRow>
      <MainRow data-cs-main-row>
        <GridSlot>
          <CollectiblesFilterRow />
          <CollectiblesGrid />
        </GridSlot>
        <CollectiblesRightSidebar />
      </MainRow>
      <CollectiblesBottomCta />
    </Content>
  </Root>
  </CollectiblesRuntimeProvider>
)

export default CollectiblesStudioScreen
