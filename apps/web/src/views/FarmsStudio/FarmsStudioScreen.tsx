import React from 'react'
import styled from 'styled-components'
import { PageMeta } from 'components/Layout/Page'
import { typography } from 'design-system/melega'
import TrendingRibbon from 'views/HomeTrade/TrendingRibbon'
import FarmsStudioGlobalStyle from './FarmsStudioGlobalStyle'
import FarmsStudioPageHeader from './components/FarmsStudioPageHeader'
import FarmsKpiRow from './components/FarmsKpiRow'
import FeaturedFarmPanel from './components/FeaturedFarmPanel'
import AIYieldAdvisorPanel from './components/AIYieldAdvisorPanel'
import FarmsFilterRow from './components/FarmsFilterRow'
import FarmsGrid from './components/FarmsGrid'
import FarmsActivityTable from './components/FarmsActivityTable'
import { farmsStudioColors, farmsStudioLayout } from './farmsStudioTokens'

const Root = styled.div`
  color: ${farmsStudioColors.text};
  font-family: ${typography.fontFamily.body};
  background: ${farmsStudioColors.canvas};
  padding: 0 0 32px;
  min-width: 0;
  overflow-x: hidden;

  @media (max-width: 767px) {
    padding: 0 0 ${farmsStudioLayout.mobileBottomPad};
  }
`

const Content = styled.div`
  max-width: ${farmsStudioLayout.contentMax};
  margin: 0 auto;
  padding: ${farmsStudioLayout.contentPaddingTop} ${farmsStudioLayout.contentPaddingX}
    ${farmsStudioLayout.contentPaddingBottom};
  box-sizing: border-box;
  min-width: 0;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: ${farmsStudioLayout.sectionGap};

  @media (max-width: 767px) {
    padding: 16px 16px ${farmsStudioLayout.mobileBottomPad};
  }
`

export const PageColumnGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(${farmsStudioLayout.pageGridColumns}, minmax(0, 1fr));
  column-gap: ${farmsStudioLayout.pageGridGap};
  row-gap: ${farmsStudioLayout.pageGridGap};
  width: 100%;
  min-width: 0;

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
  }
`

export const FeaturedSlot = styled.div`
  grid-column: span 2;
  min-width: 0;

  @media (max-width: 767px) {
    grid-column: span 1;
  }
`

export const AdvisorSlot = styled.div`
  grid-column: span 1;
  min-width: 0;
`

export const FarmsStudioScreen: React.FC = () => (
  <Root data-farms-studio-screen="true">
    <PageMeta />
    <FarmsStudioGlobalStyle />
    <TrendingRibbon />
    <Content>
      <FarmsStudioPageHeader />
      <FarmsKpiRow />
      <PageColumnGrid data-fs-page-grid>
        <FeaturedSlot>
          <FeaturedFarmPanel />
        </FeaturedSlot>
        <AdvisorSlot>
          <AIYieldAdvisorPanel />
        </AdvisorSlot>
      </PageColumnGrid>
      <FarmsFilterRow />
      <FarmsGrid />
      <FarmsActivityTable />
    </Content>
  </Root>
)

export default FarmsStudioScreen
