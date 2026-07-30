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
  gap: 14px;

  @media (max-width: 767px) {
    margin-top: 12px;
    padding: 0 4px ${poolsStudioLayout.mobileBottomPad};
    gap: 12px;
  }
`

const PositionsCreateRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.85fr) minmax(280px, 1fr);
  gap: 14px;
  align-items: start;
  min-width: 0;
  width: 100%;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`

const CreatePoolSide = styled.div`
  min-width: 0;
  width: 100%;
  align-self: start;

  /* Permanently expanded Create Pool workspace — full-height side column */
  [data-ps-create-pool],
  [data-testid='create-pool-cta'] {
    max-width: 100%;
  }
`

/**
 * Founder IA (economics repair):
 * Hero (with compact Featured) → KPI → My Positions + Create Pool → Explore → Analytics
 * No standalone Finished section; no full-width Featured band below KPIs.
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
    data-pools-ia="founder-economics-repair-v1"
    data-ps-wallet-first="true"
    data-pools-ux-fixture={isPoolsUxFixtureEnabled() ? 'true' : undefined}
  >
    <PageMeta />
    <PoolsStudioGlobalStyle />
    <PoolsVisualPolishModule />
    <PoolsRuntimeProvider>
      <PoolsActionHost />
      <Content data-ps-content data-pools-ia="founder-economics-repair-v1">
        <PoolsHeroModule />
        <DataSurfaceErrorBoundary surface="Pools Overview KPIs" userReason="Pool overview metrics are temporarily unavailable.">
          <PoolsOverviewKpisModule />
        </DataSurfaceErrorBoundary>
        <PositionsCreateRow data-ps-positions-create-row>
          <DataSurfaceErrorBoundary surface="Pools My Positions" userReason="Pool positions are temporarily unavailable.">
            <PoolsMyPositionsModule variant="with-create-side" />
          </DataSurfaceErrorBoundary>
          <CreatePoolSide data-ps-create-pool-section id="create-pool">
            <DataSurfaceErrorBoundary surface="Create Pool" userReason="Create pool preview is temporarily unavailable.">
              <CreatePoolCta />
            </DataSurfaceErrorBoundary>
          </CreatePoolSide>
        </PositionsCreateRow>
        <DataSurfaceErrorBoundary surface="Explore Pools" userReason="Active staking pools are temporarily unavailable.">
          <PoolsExplorePoolsModule />
        </DataSurfaceErrorBoundary>
        <DataSurfaceErrorBoundary surface="Pools Analytics" userReason="Pool analytics are temporarily unavailable.">
          <PoolsAnalyticsModule />
        </DataSurfaceErrorBoundary>
      </Content>
    </PoolsRuntimeProvider>
  </Root>
)

export default PoolsStudioScreen
