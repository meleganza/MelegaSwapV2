import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/router'
import { PageMeta } from 'components/Layout/Page'
import { DataSurfaceErrorBoundary } from 'components/ErrorBoundary'
import { MelegaModal, typography } from 'design-system/melega'
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

/**
 * Pools product IA:
 * Hero (Featured compact) → KPIs → My Positions → Explore Pools
 * Create Pool opens as a modal / ?create=1 — never a permanent page column.
 */
export const PoolsStudioScreen: React.FC = () => {
  const router = useRouter()
  const [createOpen, setCreateOpen] = useState(false)

  useEffect(() => {
    const q = router.query.create
    const hash = typeof window !== 'undefined' ? window.location.hash : ''
    if (q === '1' || q === 'true' || hash === '#create-pool') {
      setCreateOpen(true)
    }
  }, [router.query.create])

  const openCreate = useCallback(() => {
    setCreateOpen(true)
    void router.replace({ pathname: router.pathname, query: { ...router.query, create: '1' } }, undefined, {
      shallow: true,
    })
  }, [router])

  const closeCreate = useCallback(() => {
    setCreateOpen(false)
    const nextQuery = { ...router.query }
    delete nextQuery.create
    void router.replace({ pathname: router.pathname, query: nextQuery }, undefined, { shallow: true })
  }, [router])

  useEffect(() => {
    const onOpen = () => openCreate()
    window.addEventListener('melega:open-create-pool', onOpen)
    return () => window.removeEventListener('melega:open-create-pool', onOpen)
  }, [openCreate])

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
      data-pools-create-pool="modal"
      data-ps-wallet-first="true"
      data-pools-create-modal={createOpen ? 'open' : 'closed'}
      data-pools-ux-fixture={isPoolsUxFixtureEnabled() ? 'true' : undefined}
    >
      <PageMeta />
      <PoolsStudioGlobalStyle />
      <PoolsVisualPolishModule />
      <PoolsRuntimeProvider>
        <PoolsActionHost />
        <Content data-ps-content data-pools-ia="product-ux-redesign-v1">
          <PoolsHeroModule onRequestCreatePool={openCreate} />
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
        <MelegaModal
          open={createOpen}
          onClose={closeCreate}
          title="Create Pool"
          subtitle="Configure stake, rewards, schedule and safety."
          size="md"
          testId="create-pool-modal"
          closeTestId="create-pool-modal-close"
          ariaLabel="Create Pool"
          flush
        >
          <div id="create-pool" data-ps-create-pool-section>
            <DataSurfaceErrorBoundary surface="Create Pool" userReason="Create pool preview is temporarily unavailable.">
              <CreatePoolCta />
            </DataSurfaceErrorBoundary>
          </div>
        </MelegaModal>
      </PoolsRuntimeProvider>
    </Root>
  )
}

export default PoolsStudioScreen
