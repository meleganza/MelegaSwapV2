import React from 'react'
import styled from 'styled-components'
import { PageMeta } from 'components/Layout/Page'
import { DataSurfaceErrorBoundary } from 'components/ErrorBoundary'
import { typography } from 'design-system/melega'
import PoolsStudioGlobalStyle from './PoolsStudioGlobalStyle'
import { PoolsRuntimeProvider } from './poolsRuntime/PoolsRuntimeContext'
import PoolsActionHost from './poolsRuntime/PoolsActionHost'
import PoolsSidebar from './components/PoolsSidebar'
import CreatePoolCta from './components/CreatePoolCta'
import PoolsBelowFold from './components/PoolsBelowFold'
import { poolsStudioColors, poolsStudioLayout } from './poolsStudioTokens'
import { isPoolsUxFixtureEnabled } from './poolsRuntime/poolsUxFixture'
import { PoolsHeroModule } from './modules/PoolsHeroModule'
import { PoolsOverviewKpisModule } from './modules/PoolsOverviewKpisModule'
import { PoolsMyPositionsModule } from './modules/PoolsMyPositionsModule'
import { PoolsExplorePoolsModule } from './modules/PoolsExplorePoolsModule'
import { PoolsFinishedPoolsModule } from './modules/PoolsFinishedPoolsModule'
import { PoolsRewardAdvisorModule } from './modules/PoolsRewardAdvisorModule'
import { PoolsAnalyticsModule } from './modules/PoolsAnalyticsModule'
import { PoolsVisualPolishModule } from './modules/PoolsVisualPolishModule'
import { poolsHero } from './modules/poolsHeroTokens'

const Root = styled.div`
  color: ${poolsStudioColors.text};
  font-family: ${typography.fontFamily.body};
  background: ${poolsStudioColors.canvas};
  padding: 0 0 32px;
  min-width: 0;
  overflow-x: hidden;
  width: 100%;

  @media (max-width: 767px) {
    padding: 0 0 ${poolsStudioLayout.mobileBottomPad};
  }
`

const Content = styled.div`
  /*
   * App shell supplies horizontal page padding (32px @ ≥1024).
   * Module 001 requires 24px top gap after Trending Bar and 1376 content width.
   * Legacy Studio body remains mounted beneath the Hero until Integration 009.
   */
  max-width: ${poolsHero.contentMax};
  width: 100%;
  margin: ${poolsHero.topAfterTrending} auto 0;
  padding: 0 0 ${poolsStudioLayout.contentPaddingBottom};
  box-sizing: border-box;
  min-width: 0;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: ${poolsStudioLayout.sectionGap};

  @media (max-width: 767px) {
    margin-top: 16px;
    padding: 0 4px ${poolsStudioLayout.mobileBottomPad};
  }
`

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 820px) 340px;
  grid-template-rows: auto auto;
  column-gap: 24px;
  row-gap: 0;
  align-items: stretch;
  min-width: 0;

  @media (max-width: 1099px) {
    grid-template-columns: 1fr;
  }

  @media (max-width: 767px) {
    display: flex;
    flex-direction: column;
  }
`

const MainColumn = styled.div`
  min-width: 0;
  width: 100%;
  max-width: 820px;
  grid-column: 1;
  grid-row: 1;
  display: flex;
  flex-direction: column;

  @media (max-width: 767px) {
    order: 1;
  }
`

const SidebarColumn = styled.div`
  grid-column: 2;
  grid-row: 1 / span 2;
  min-width: 0;
  display: flex;
  flex-direction: column;

  @media (max-width: 1099px) {
    grid-column: 1;
    grid-row: auto;
  }

  @media (max-width: 767px) {
    order: 2;
    margin-top: 20px;
  }
`

const CreatePoolSection = styled.div`
  grid-column: 1;
  grid-row: 2;
  margin-top: 48px;
  min-width: 0;
  width: 100%;
  max-width: ${poolsStudioLayout.explorerMaxWidth};

  @media (max-width: 1099px) {
    grid-column: 1;
  }

  @media (max-width: 767px) {
    order: 3;
    margin-top: 32px;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }
`

const BelowFold = styled.div`
  margin-top: 48px;
  display: flex;
  flex-direction: column;
  gap: ${poolsStudioLayout.gapBuilderBottom};
  min-width: 0;

  @media (max-width: 767px) {
    margin-top: 32px;
  }
`

export const PoolsStudioScreen: React.FC = () => (
  <Root
    data-pools-studio-screen="true"
    data-pools-module-001="mounted"
    data-pools-module-002="mounted"
    data-pools-module-003="mounted"
    data-pools-module-004="mounted"
    data-pools-module-005="mounted"
    data-pools-module-006="mounted"
    data-pools-module-007="mounted"
    data-pools-module-008="mounted"
    data-pools-architecture="000"
    data-ps-wallet-first="true"
    data-r706b-step2b="true"
    data-r711-pools-screen
    data-r712-pools-screen
    data-r713-pools-screen
    data-r715-pools-screen
    data-r716-pools-screen
    data-pools-ux-fixture={isPoolsUxFixtureEnabled() ? 'true' : undefined}
  >
    <PageMeta />
    <PoolsStudioGlobalStyle />
    <PoolsVisualPolishModule />
    <PoolsRuntimeProvider>
      <PoolsActionHost />
      <Content data-ps-content data-pools-ia="provider-first-v1">
        {/* Hero owns Create Pool CTA, Featured Pool, Why Stake, Advisor summary */}
        <PoolsHeroModule />
        {/* My Positions immediately after Hero — never demoted below discovery */}
        <DataSurfaceErrorBoundary surface="Pools My Positions" userReason="Pool positions are temporarily unavailable.">
          <PoolsMyPositionsModule />
        </DataSurfaceErrorBoundary>
        <DataSurfaceErrorBoundary surface="Pools Overview KPIs" userReason="Pool overview metrics are temporarily unavailable.">
          <PoolsOverviewKpisModule />
        </DataSurfaceErrorBoundary>
        <DataSurfaceErrorBoundary surface="Pools Analytics" userReason="Pool analytics are temporarily unavailable.">
          <PoolsAnalyticsModule />
        </DataSurfaceErrorBoundary>
        <DataSurfaceErrorBoundary surface="Explore Pools" userReason="Active staking pools are temporarily unavailable.">
          <PoolsExplorePoolsModule />
        </DataSurfaceErrorBoundary>
        <DataSurfaceErrorBoundary surface="Finished Pools" userReason="Finished pool positions are temporarily unavailable.">
          <PoolsFinishedPoolsModule />
        </DataSurfaceErrorBoundary>
        <DataSurfaceErrorBoundary surface="Reward Advisor" userReason="Reward advisor is temporarily unavailable.">
          <PoolsRewardAdvisorModule />
        </DataSurfaceErrorBoundary>
        <MainGrid data-ps-main-grid>
          <MainColumn>
            <div data-ps-featured-archived="true" aria-hidden="true" />
          </MainColumn>
          <SidebarColumn>
            <PoolsSidebar />
          </SidebarColumn>
          {/* Create Pool wizard near bottom */}
          <CreatePoolSection data-ps-create-pool-section>
            <DataSurfaceErrorBoundary surface="Create Pool" userReason="Create pool preview is temporarily unavailable.">
              <CreatePoolCta />
            </DataSurfaceErrorBoundary>
          </CreatePoolSection>
        </MainGrid>
        <BelowFold data-ps-below-fold>
          <PoolsBelowFold />
        </BelowFold>
      </Content>
    </PoolsRuntimeProvider>
  </Root>
)

export default PoolsStudioScreen
