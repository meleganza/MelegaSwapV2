import React from 'react'
import styled from 'styled-components'
import { PageMeta } from 'components/Layout/Page'
import { DataSurfaceErrorBoundary } from 'components/ErrorBoundary'
import { typography } from 'design-system/melega'
import PoolsStudioGlobalStyle from './PoolsStudioGlobalStyle'
import { PoolsRuntimeProvider } from './poolsRuntime/PoolsRuntimeContext'
import PoolsActionHost from './poolsRuntime/PoolsActionHost'
import CreatePoolCta from './components/CreatePoolCta'
import { poolsStudioColors, poolsStudioLayout } from './poolsStudioTokens'
import { isPoolsUxFixtureEnabled } from './poolsRuntime/poolsUxFixture'
import { PoolsHeroModule } from './modules/PoolsHeroModule'
import { PoolsOverviewKpisModule } from './modules/PoolsOverviewKpisModule'
import { PoolsMyPositionsModule } from './modules/PoolsMyPositionsModule'
import { PoolsExplorePoolsModule } from './modules/PoolsExplorePoolsModule'
import { PoolsFinishedPoolsModule } from './modules/PoolsFinishedPoolsModule'
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

const CreatePoolSection = styled.div`
  margin-top: 24px;
  min-width: 0;
  width: 100%;

  @media (max-width: 767px) {
    margin-top: 20px;
  }
`

/**
 * Wave 03 IA:
 * Hero → KPI → My Positions → Analytics → Explore Active → Finished → Create Pool
 * Removed: Reward Advisor, How-it-works sidebar, donut / health guide side columns.
 */
export const PoolsStudioScreen: React.FC = () => (
  <Root
    data-pools-studio-screen="true"
    data-pools-module-001="mounted"
    data-pools-module-002="mounted"
    data-pools-module-003="mounted"
    data-pools-module-004="mounted"
    data-pools-module-005="mounted"
    data-pools-module-007="mounted"
    data-pools-module-008="mounted"
    data-pools-architecture="000"
    data-pools-ia="wave-03-founder"
    data-ps-wallet-first="true"
    data-pools-ux-fixture={isPoolsUxFixtureEnabled() ? 'true' : undefined}
  >
    <PageMeta />
    <PoolsStudioGlobalStyle />
    <PoolsVisualPolishModule />
    <PoolsRuntimeProvider>
      <PoolsActionHost />
      <Content data-ps-content data-pools-ia="wave-03-founder">
        <PoolsHeroModule />
        <DataSurfaceErrorBoundary surface="Pools Overview KPIs" userReason="Pool overview metrics are temporarily unavailable.">
          <PoolsOverviewKpisModule />
        </DataSurfaceErrorBoundary>
        <DataSurfaceErrorBoundary surface="Pools My Positions" userReason="Pool positions are temporarily unavailable.">
          <PoolsMyPositionsModule />
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
        <CreatePoolSection data-ps-create-pool-section>
          <DataSurfaceErrorBoundary surface="Create Pool" userReason="Create pool preview is temporarily unavailable.">
            <CreatePoolCta />
          </DataSurfaceErrorBoundary>
        </CreatePoolSection>
      </Content>
    </PoolsRuntimeProvider>
  </Root>
)

export default PoolsStudioScreen
