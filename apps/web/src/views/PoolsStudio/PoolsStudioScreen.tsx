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
import { PoolsFeaturedPoolBand } from './modules/PoolsFeaturedPoolBand'
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
  padding: 0 0 28px;
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
  /* ~30% denser above-the-fold: tighter section rhythm than constitution 32px. */
  gap: 14px;

  @media (max-width: 767px) {
    margin-top: 12px;
    padding: 0 4px ${poolsStudioLayout.mobileBottomPad};
    gap: 12px;
  }
`

const CreatePoolSection = styled.div`
  margin-top: 4px;
  min-width: 0;
  width: 100%;
`

/**
 * Founder Acceptance IA:
 * Hero → Compact KPI → Featured Pool → My Positions → Create Pool → Explore → Finished → Analytics
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
    data-pools-ia="founder-acceptance-v1"
    data-ps-wallet-first="true"
    data-pools-ux-fixture={isPoolsUxFixtureEnabled() ? 'true' : undefined}
  >
    <PageMeta />
    <PoolsStudioGlobalStyle />
    <PoolsVisualPolishModule />
    <PoolsRuntimeProvider>
      <PoolsActionHost />
      <Content data-ps-content data-pools-ia="founder-acceptance-v1">
        <PoolsHeroModule />
        <DataSurfaceErrorBoundary surface="Pools Overview KPIs" userReason="Pool overview metrics are temporarily unavailable.">
          <PoolsOverviewKpisModule />
        </DataSurfaceErrorBoundary>
        <DataSurfaceErrorBoundary surface="Featured Pool" userReason="Featured pool is temporarily unavailable.">
          <PoolsFeaturedPoolBand />
        </DataSurfaceErrorBoundary>
        <DataSurfaceErrorBoundary surface="Pools My Positions" userReason="Pool positions are temporarily unavailable.">
          <PoolsMyPositionsModule />
        </DataSurfaceErrorBoundary>
        <CreatePoolSection data-ps-create-pool-section>
          <DataSurfaceErrorBoundary surface="Create Pool" userReason="Create pool preview is temporarily unavailable.">
            <CreatePoolCta />
          </DataSurfaceErrorBoundary>
        </CreatePoolSection>
        <DataSurfaceErrorBoundary surface="Explore Pools" userReason="Active staking pools are temporarily unavailable.">
          <PoolsExplorePoolsModule />
        </DataSurfaceErrorBoundary>
        <DataSurfaceErrorBoundary surface="Finished Pools" userReason="Finished pool positions are temporarily unavailable.">
          <PoolsFinishedPoolsModule />
        </DataSurfaceErrorBoundary>
        <DataSurfaceErrorBoundary surface="Pools Analytics" userReason="Pool analytics are temporarily unavailable.">
          <PoolsAnalyticsModule />
        </DataSurfaceErrorBoundary>
      </Content>
    </PoolsRuntimeProvider>
  </Root>
)

export default PoolsStudioScreen
