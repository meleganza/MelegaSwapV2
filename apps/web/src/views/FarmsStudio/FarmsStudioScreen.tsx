import React, { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/router'
import { PageMeta } from 'components/Layout/Page'
import { DataSurfaceErrorBoundary } from 'components/ErrorBoundary'
import { EarnPremiumShell, EarnSection } from 'views/Earn/EarnPremiumShell'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { isNativeYieldOperationAllowed } from 'config/nativeYieldPolicy'
import { MelegaModal, typography } from 'design-system/melega'
import FarmsStudioGlobalStyle from './FarmsStudioGlobalStyle'
import { FarmsRuntimeProvider } from './farmsRuntime/FarmsRuntimeContext'
import FarmsActionHost from './farmsRuntime/FarmsActionHost'
import { farmsStudioColors, farmsStudioLayout } from './farmsStudioTokens'
import { FarmsMyFarmsModule } from './modules/FarmsMyFarmsModule'
import { CreateFarmWorkspace } from './modules/CreateFarmWorkspace'
import { FarmsExploreFarmsModule } from './modules/FarmsExploreFarmsModule'
import { FarmsFinishedFarmsModule } from './modules/FarmsFinishedFarmsModule'
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
  /* Home shell: 1380px border box with a 32px desktop content inset. */
  max-width: 1380px;
  width: 100%;
  margin: ${farmsHero.topAfterTrending} auto 0;
  padding: 0 32px ${farmsStudioLayout.contentPaddingBottom};
  box-sizing: border-box;
  min-width: 0;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (max-width: 767px) {
    margin-top: 16px;
    padding: 0 0 ${farmsStudioLayout.mobileBottomPad};
    gap: 14px;
  }
`

/**
 * Farms product IA:
 * Earn shell → Active opportunities → My positions → Terminated positions
 * Create Farm opens as a modal / ?create=1 — never a permanent page column.
 */
export const FarmsStudioScreen: React.FC = () => {
  const router = useRouter()
  const { chainId } = useActiveChainId()
  const [createOpen, setCreateOpen] = useState(false)
  const [everOpened, setEverOpened] = useState(false)
  const createOpenRef = useRef(false)

  useEffect(() => {
    createOpenRef.current = createOpen
  }, [createOpen])

  useEffect(() => {
    if (!router.isReady) return
    const q = router.query.create
    const hash = typeof window !== 'undefined' ? window.location.hash : ''
    const shouldOpen = q === '1' || q === 'true' || hash === '#create-farm'
    if (shouldOpen && isNativeYieldOperationAllowed(chainId, 'create')) {
      setCreateOpen(true)
      setEverOpened(true)
    }
  }, [router.isReady, router.query.create, chainId])

  const openCreate = useCallback(() => {
    if (!isNativeYieldOperationAllowed(chainId, 'create')) return
    if (createOpenRef.current) return
    setCreateOpen(true)
    setEverOpened(true)
    const q = router.query.create
    if (q === '1' || q === 'true') return
    void router.replace({ pathname: router.pathname, query: { ...router.query, create: '1' } }, undefined, {
      shallow: true,
    })
  }, [router, chainId])

  const closeCreate = useCallback(() => {
    setCreateOpen(false)
    const q = router.query.create
    if (q !== '1' && q !== 'true') return
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
      data-farms-module-001="unmounted"
      data-farms-module-002="unmounted"
      data-farms-module-003="mounted"
      data-farms-module-004="mounted"
      data-farms-module-005="mounted"
      data-farms-module-006="unmounted"
      data-farms-module-007="unmounted"
      data-farms-module-008="mounted"
      data-farms-create-farm="modal"
      data-farms-architecture="000"
      data-farms-ia="product-ux-redesign-v1"
      data-r200-premium="true"
      data-fs-wallet-first="true"
      data-farms-create-modal={createOpen ? 'open' : 'closed'}
      data-create-farm-first-open-stable="true"
    >
      <PageMeta />
      <FarmsStudioGlobalStyle />
      <FarmsRuntimeProvider>
        <FarmsVisualPolishModule />
        <FarmsActionHost />
        <Content data-fs-content data-farms-ia="product-ux-redesign-v1">
          <EarnPremiumShell kind="farms" />
          <EarnSection id="opportunities">
            <DataSurfaceErrorBoundary surface="Earn opportunities" userReason="Active farms are temporarily unavailable.">
              <FarmsExploreFarmsModule />
            </DataSurfaceErrorBoundary>
          </EarnSection>
          <EarnSection id="positions">
            <DataSurfaceErrorBoundary surface="My positions" userReason="Farm positions are temporarily unavailable.">
              <FarmsMyFarmsModule />
            </DataSurfaceErrorBoundary>
          </EarnSection>
          <EarnSection id="terminated">
            <DataSurfaceErrorBoundary surface="Terminated positions" userReason="Terminated farm positions are temporarily unavailable.">
              <FarmsFinishedFarmsModule />
            </DataSurfaceErrorBoundary>
          </EarnSection>
        </Content>
        {everOpened ? (
          <MelegaModal
            open={createOpen}
            onClose={closeCreate}
            title="Create Farm"
            subtitle="Configure pair, rewards, budget and duration."
            size="lg"
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
        ) : null}
      </FarmsRuntimeProvider>
    </Root>
  )
}

export default FarmsStudioScreen
