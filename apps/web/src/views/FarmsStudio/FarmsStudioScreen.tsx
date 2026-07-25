import React from 'react'
import styled from 'styled-components'
import { PageMeta } from 'components/Layout/Page'
import { DataSurfaceErrorBoundary } from 'components/ErrorBoundary'
import { typography } from 'design-system/melega'
import FarmsStudioGlobalStyle from './FarmsStudioGlobalStyle'
import { FarmsRuntimeProvider } from './farmsRuntime/FarmsRuntimeContext'
import FarmsActionHost from './farmsRuntime/FarmsActionHost'
import FeaturedFarmPanel from './components/FeaturedFarmPanel'
import FarmsActivityTable from './components/FarmsActivityTable'
import { farmsStudioColors, farmsStudioLayout } from './farmsStudioTokens'
import { FarmsHeroModule } from './modules/FarmsHeroModule'
import { FarmsOverviewKpisModule } from './modules/FarmsOverviewKpisModule'
import { FarmsMyFarmsModule } from './modules/FarmsMyFarmsModule'
import { FarmsExploreFarmsModule } from './modules/FarmsExploreFarmsModule'
import { FarmsFinishedFarmsModule } from './modules/FarmsFinishedFarmsModule'
import { FarmsYieldAdvisorModule } from './modules/FarmsYieldAdvisorModule'
import { FarmsAnalyticsModule } from './modules/FarmsAnalyticsModule'
import { farmsHero } from './modules/farmsHeroTokens'

const Root = styled.div`
  color: ${farmsStudioColors.text};
  font-family: ${typography.fontFamily.body};
  background: ${farmsStudioColors.canvas};
  padding: 0 0 32px;
  min-width: 0;
  overflow-x: hidden;
  width: 100%;

  @media (max-width: 767px) {
    padding: 0 0 ${farmsStudioLayout.mobileBottomPad};
  }
`

const Content = styled.div`
  /*
   * App shell supplies horizontal page padding (32px @ ≥1024).
   * Module 001 requires 24px top gap after Trending Bar and 1376 content width.
   * Legacy Studio body remains mounted beneath the Hero until Integration 009.
   */
  max-width: ${farmsHero.contentMax};
  width: 100%;
  margin: ${farmsHero.topAfterTrending} auto 0;
  padding: 0 0 ${farmsStudioLayout.contentPaddingBottom};
  box-sizing: border-box;
  min-width: 0;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: ${farmsStudioLayout.sectionGap};

  @media (max-width: 767px) {
    margin-top: 16px;
    padding: 0 4px ${farmsStudioLayout.mobileBottomPad};
  }
`

export const PageColumnGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, calc(66.666% + ${farmsStudioLayout.featuredGridAdjust}))
    minmax(0, calc(33.333% - ${farmsStudioLayout.featuredGridAdjust}));
  column-gap: ${farmsStudioLayout.pageGridGap};
  row-gap: ${farmsStudioLayout.pageGridGap};
  width: 100%;
  min-width: 0;

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
  }
`

export const FeaturedSlot = styled.div`
  min-width: 0;

  @media (max-width: 767px) {
    grid-column: span 1;
  }
`

export const AdvisorSlot = styled.div`
  min-width: 0;
  /* Legacy AI Yield Advisor superseded by Module 006 (portaled into My Farms slot). */
`

export const FarmsStudioScreen: React.FC = () => (
  <Root
    data-farms-studio-screen="true"
    data-farms-module-001="mounted"
    data-farms-module-002="mounted"
    data-farms-module-003="mounted"
    data-farms-module-004="mounted"
    data-farms-module-005="mounted"
    data-farms-module-006="mounted"
    data-farms-module-007="mounted"
    data-farms-architecture="000"
    data-r200-premium="true"
    data-fs-wallet-first="true"
  >
    <PageMeta />
    <FarmsStudioGlobalStyle />
    <FarmsRuntimeProvider>
      <FarmsActionHost />
      <Content data-fs-content>
        <FarmsHeroModule />
        <DataSurfaceErrorBoundary surface="Farms Overview KPIs" userReason="Farm overview metrics are temporarily unavailable.">
          <FarmsOverviewKpisModule />
        </DataSurfaceErrorBoundary>
        <DataSurfaceErrorBoundary surface="Farms My Farms" userReason="Farm positions are temporarily unavailable.">
          <FarmsMyFarmsModule />
        </DataSurfaceErrorBoundary>
        <DataSurfaceErrorBoundary surface="Explore Farms" userReason="Active farms are temporarily unavailable.">
          <FarmsExploreFarmsModule />
        </DataSurfaceErrorBoundary>
        <DataSurfaceErrorBoundary surface="Finished Farms" userReason="Finished farm positions are temporarily unavailable.">
          <FarmsFinishedFarmsModule />
        </DataSurfaceErrorBoundary>
        <DataSurfaceErrorBoundary surface="Yield Advisor" userReason="Yield advisor is temporarily unavailable.">
          <FarmsYieldAdvisorModule />
        </DataSurfaceErrorBoundary>
        <DataSurfaceErrorBoundary surface="Farms Analytics" userReason="Farm analytics are temporarily unavailable.">
          <FarmsAnalyticsModule />
        </DataSurfaceErrorBoundary>
        <PageColumnGrid data-fs-page-grid data-fs-featured-advisor="true">
          <FeaturedSlot>
            <DataSurfaceErrorBoundary surface="Featured Farm" userReason="Featured farm metrics are temporarily unavailable.">
              <FeaturedFarmPanel />
            </DataSurfaceErrorBoundary>
          </FeaturedSlot>
          <AdvisorSlot data-fs-advisor-superseded="module-006" aria-hidden="true" />
        </PageColumnGrid>
        <DataSurfaceErrorBoundary surface="Farms Activity" userReason="Farm activity is temporarily unavailable.">
          <FarmsActivityTable />
        </DataSurfaceErrorBoundary>
      </Content>
    </FarmsRuntimeProvider>
  </Root>
)

export default FarmsStudioScreen
