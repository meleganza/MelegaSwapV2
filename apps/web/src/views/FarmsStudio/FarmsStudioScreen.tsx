import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/router'
import { PageMeta } from 'components/Layout/Page'
import { DataSurfaceErrorBoundary } from 'components/ErrorBoundary'
import { MelegaModal, typography } from 'design-system/melega'
import FarmsStudioGlobalStyle from './FarmsStudioGlobalStyle'
import { FarmsRuntimeProvider } from './farmsRuntime/FarmsRuntimeContext'
import FarmsActionHost from './farmsRuntime/FarmsActionHost'
import { farmsStudioColors, farmsStudioLayout } from './farmsStudioTokens'
import { FarmsHeroModule } from './modules/FarmsHeroModule'
import { FarmsOverviewKpisModule } from './modules/FarmsOverviewKpisModule'
import { FarmsMyFarmsModule } from './modules/FarmsMyFarmsModule'
import { CreateFarmWorkspace } from './modules/CreateFarmWorkspace'
import { FarmsExploreFarmsModule } from './modules/FarmsExploreFarmsModule'
import { FarmsVisualPolishModule } from './modules/FarmsVisualPolishModule'
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
  max-width: ${farmsHero.contentMax};
  width: 100%;
  margin: ${farmsHero.topAfterTrending} auto 0;
  padding: 0 0 ${farmsStudioLayout.contentPaddingBottom};
  box-sizing: border-box;
  min-width: 0;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 14px;

  @media (max-width: 767px) {
    margin-top: 16px;
    padding: 0 4px ${farmsStudioLayout.mobileBottomPad};
    gap: 12px;
  }
`

/**
 * Farms product IA:
 * Hero (Featured compact) → KPIs → My Farms → Explore Farms
 * Create Farm opens as a modal / ?create=1 — never a permanent page column.
 */
export const FarmsStudioScreen: React.FC = () => {
  const router = useRouter()
  const [createOpen, setCreateOpen] = useState(false)

  useEffect(() => {
    const q = router.query.create
    const hash = typeof window !== 'undefined' ? window.location.hash : ''
    if (q === '1' || q === 'true' || hash === '#create-farm') {
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
    window.addEventListener('melega:open-create-farm', onOpen)
    return () => window.removeEventListener('melega:open-create-farm', onOpen)
  }, [openCreate])

  return (
    <Root
      data-farms-studio-screen="true"
      data-farms-module-001="mounted"
      data-farms-module-002="mounted"
      data-farms-module-003="mounted"
      data-farms-module-004="mounted"
      data-farms-module-005="unmounted"
      data-farms-module-006="unmounted"
      data-farms-module-007="unmounted"
      data-farms-module-008="mounted"
      data-farms-create-farm="modal"
      data-farms-architecture="000"
      data-farms-ia="product-ux-redesign-v1"
      data-r200-premium="true"
      data-fs-wallet-first="true"
      data-farms-create-modal={createOpen ? 'open' : 'closed'}
    >
      <PageMeta />
      <FarmsStudioGlobalStyle />
      <FarmsRuntimeProvider>
        <FarmsVisualPolishModule />
        <FarmsActionHost />
        <Content data-fs-content data-farms-ia="product-ux-redesign-v1">
          <FarmsHeroModule onRequestCreateFarm={openCreate} />
          <DataSurfaceErrorBoundary
            surface="Farms Overview KPIs"
            userReason="Farm overview metrics are temporarily unavailable."
          >
            <FarmsOverviewKpisModule />
          </DataSurfaceErrorBoundary>
          <DataSurfaceErrorBoundary surface="Farms My Farms" userReason="Farm positions are temporarily unavailable.">
            <FarmsMyFarmsModule />
          </DataSurfaceErrorBoundary>
          <DataSurfaceErrorBoundary surface="Explore Farms" userReason="Active farms are temporarily unavailable.">
            <FarmsExploreFarmsModule />
          </DataSurfaceErrorBoundary>
        </Content>
        <MelegaModal
          open={createOpen}
          onClose={closeCreate}
          title="Create Farm"
          subtitle="Configure pair, rewards, budget and duration."
          size="md"
          testId="create-farm-modal"
          closeTestId="create-farm-modal-close"
          ariaLabel="Create Farm"
          flush
        >
          <div id="create-farm" data-fs-create-farm-section>
            <DataSurfaceErrorBoundary
              surface="Create Farm"
              userReason="Create Farm configuration is temporarily unavailable."
            >
              <CreateFarmWorkspace />
            </DataSurfaceErrorBoundary>
          </div>
        </MelegaModal>
      </FarmsRuntimeProvider>
    </Root>
  )
}

export default FarmsStudioScreen
