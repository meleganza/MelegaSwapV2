import React, { useEffect } from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/router'
import { PageMeta } from 'components/Layout/Page'
import { DataSurfaceErrorBoundary } from 'components/ErrorBoundary'
import { typography } from 'design-system/melega'
import PoolsStudioGlobalStyle from './PoolsStudioGlobalStyle'
import { PoolsRuntimeProvider } from './poolsRuntime/PoolsRuntimeContext'
import PoolsActionHost from './poolsRuntime/PoolsActionHost'
import { poolsStudioColors, poolsStudioLayout } from './poolsStudioTokens'
import { isPoolsUxFixtureEnabled } from './poolsRuntime/poolsUxFixture'
import { PoolsHeroModule } from './modules/PoolsHeroModule'
import { PoolsOverviewKpisModule } from './modules/PoolsOverviewKpisModule'
import { PoolsMyPositionsModule } from './modules/PoolsMyPositionsModule'
import { PoolsExplorePoolsModule } from './modules/PoolsExplorePoolsModule'
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
  /* Home shell: 1380px border box with a 32px desktop content inset. */
  max-width: 1380px;
  width: 100%;
  margin: ${poolsHero.topAfterTrending} auto 0;
  padding: 0 32px ${poolsStudioLayout.contentPaddingBottom};
  box-sizing: border-box;
  min-width: 0;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (max-width: 767px) {
    margin-top: 12px;
    padding: 0 0 ${poolsStudioLayout.mobileBottomPad};
    gap: 14px;
  }
`

/**
 * Pools product IA:
 * Hero (Featured compact) → KPIs → My Positions → Explore Pools
 * Public pool creation is hidden until an end-to-end user flow is available.
 */
export const PoolsStudioScreen: React.FC = () => {
  const router = useRouter()
  useEffect(() => {
    if (!router.isReady) return
    const hash = router.asPath.split('#')[1]
    if (router.query.create === undefined && hash !== 'create-pool') return
    const query = { ...router.query }
    delete query.create
    Promise.resolve(
      router.replace(
        { pathname: router.pathname, query, hash: hash === 'create-pool' ? undefined : hash },
        undefined,
        { shallow: true, scroll: false },
      ),
    ).catch(() => undefined)
  }, [router.isReady, router.asPath, router.query, router.pathname, router.replace])

  return (
    <Root
      data-pools-studio-screen="true"
      data-pools-module-001="mounted"
      data-pools-module-002="mounted"
      data-pools-module-003="mounted"
      data-pools-module-004="mounted"
      data-pools-module-005="unmounted"
      data-pools-module-006="unmounted"
      data-pools-module-007="unmounted"
      data-pools-module-008="mounted"
      data-pools-architecture="000"
      data-pools-ia="product-ux-redesign-v1"
      data-pools-create-pool="hidden"
      data-ps-wallet-first="true"
      data-pools-ux-fixture={isPoolsUxFixtureEnabled() ? 'true' : undefined}
    >
      <PageMeta />
      <PoolsStudioGlobalStyle />
      <PoolsVisualPolishModule />
      <PoolsRuntimeProvider>
        <PoolsActionHost />
        <Content data-ps-content data-pools-ia="product-ux-redesign-v1">
          <PoolsHeroModule />
          <DataSurfaceErrorBoundary
            surface="Pools Overview KPIs"
            userReason="Pool overview metrics are temporarily unavailable."
          >
            <PoolsOverviewKpisModule />
          </DataSurfaceErrorBoundary>
          <DataSurfaceErrorBoundary surface="Pools My Positions" userReason="Pool positions are temporarily unavailable.">
            <PoolsMyPositionsModule variant="with-create-side" />
          </DataSurfaceErrorBoundary>
          <DataSurfaceErrorBoundary surface="Explore Pools" userReason="Active staking pools are temporarily unavailable.">
            <PoolsExplorePoolsModule />
          </DataSurfaceErrorBoundary>
        </Content>
      </PoolsRuntimeProvider>
    </Root>
  )
}

export default PoolsStudioScreen
