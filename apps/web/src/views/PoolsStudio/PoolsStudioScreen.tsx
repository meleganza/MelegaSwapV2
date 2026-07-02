import React from 'react'
import styled from 'styled-components'
import { PageMeta } from 'components/Layout/Page'
import { typography } from 'design-system/melega'
import TrendingRibbon from 'views/HomeTrade/TrendingRibbon'
import PoolsStudioGlobalStyle from './PoolsStudioGlobalStyle'
import PoolsStudioPageHeader from './components/PoolsStudioPageHeader'
import PoolsKpiRow from './components/PoolsKpiRow'
import FeaturedPoolPanel from './components/FeaturedPoolPanel'
import AIRewardAdvisorPanel from './components/AIRewardAdvisorPanel'
import PoolsFilterRow from './components/PoolsFilterRow'
import PoolsGrid from './components/PoolsGrid'
import CreatePoolCta from './components/CreatePoolCta'
import PoolsAnalyticsRow from './components/PoolsAnalyticsRow'
import PoolsActivityTable from './components/PoolsActivityTable'
import { poolsStudioColors, poolsStudioLayout } from './poolsStudioTokens'

const Root = styled.div`
  color: ${poolsStudioColors.text};
  font-family: ${typography.fontFamily.body};
  background: ${poolsStudioColors.canvas};
  padding: 0 0 32px;
  min-width: 0;
  overflow-x: hidden;

  @media (max-width: 767px) {
    padding: 0 0 ${poolsStudioLayout.mobileBottomPad};
  }
`

const Content = styled.div`
  max-width: ${poolsStudioLayout.contentMax};
  margin: 0 auto;
  padding: ${poolsStudioLayout.contentPaddingTop} ${poolsStudioLayout.contentPaddingX}
    ${poolsStudioLayout.contentPaddingBottom};
  box-sizing: border-box;
  min-width: 0;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: ${poolsStudioLayout.sectionGap};

  @media (max-width: 767px) {
    padding: 16px 16px ${poolsStudioLayout.mobileBottomPad};
  }
`

export const PageGrid12 = styled.div`
  display: grid;
  grid-template-columns: repeat(${poolsStudioLayout.pageGridColumns}, minmax(0, 1fr));
  column-gap: ${poolsStudioLayout.pageGridGap};
  row-gap: ${poolsStudioLayout.pageGridGap};
  width: 100%;
  min-width: 0;

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
  }
`

export const FeaturedSlot = styled.div`
  grid-column: span 8;
  min-width: 0;

  @media (max-width: 767px) {
    grid-column: span 1;
  }
`

export const AdvisorSlot = styled.div`
  grid-column: span 4;
  min-width: 0;

  @media (max-width: 767px) {
    grid-column: span 1;
  }
`

export const PoolsStudioScreen: React.FC = () => (
  <Root data-pools-studio-screen="true">
    <PageMeta />
    <PoolsStudioGlobalStyle />
    <TrendingRibbon />
    <Content>
      <PoolsStudioPageHeader />
      <PoolsKpiRow />
      <PageGrid12 data-ps-page-grid>
        <FeaturedSlot>
          <FeaturedPoolPanel />
        </FeaturedSlot>
        <AdvisorSlot>
          <AIRewardAdvisorPanel />
        </AdvisorSlot>
      </PageGrid12>
      <PoolsFilterRow />
      <PoolsGrid />
      <CreatePoolCta />
      <PoolsAnalyticsRow />
      <PoolsActivityTable />
    </Content>
  </Root>
)

export default PoolsStudioScreen
