import React, { useEffect } from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/router'
import { PageMeta } from 'components/Layout/Page'
import { uxRebuildColors, uxRebuildFont, uxRebuildLayout } from 'design-system/melega/tokens/uxRebuild'
import LiquidityStudioGlobalStyle from './LiquidityStudioGlobalStyle'
import { LiquidityRuntimeProvider, useLiquidityRuntime } from './liquidityRuntime/LiquidityRuntimeContext'
import LiquidityStudioChrome from './components/LiquidityStudioChrome'
import LiquidityStudioHome from './components/LiquidityStudioHome'
import LiquidityExploreSection from './components/LiquidityExploreSection'
import YourLiquidityPositionsSection from './components/YourLiquidityPositionsSection'
import LiquidityBuilderPanel from './components/LiquidityBuilderPanel'
import LiquidityBuildingPanel from './components/LiquidityBuildingPanel'
import PositionPreviewPanel from './components/PositionPreviewPanel'
import { liquidityStudioLayout } from './liquidityStudioTokens'
import { liquidityStudioModeFromView } from './liquidityRuntime/liquidityStudioView'

const Root = styled.div`
  color: ${uxRebuildColors.text};
  font-family: ${uxRebuildFont};
  background: ${uxRebuildColors.pageBg};
  padding: 0 0 32px;
  min-width: 0;
  overflow-x: hidden;

  @media (max-width: 767px) {
    padding: 0 0 ${liquidityStudioLayout.mobileBottomPad};
  }
`

const Content = styled.div`
  max-width: ${uxRebuildLayout.contentMax};
  width: calc(100% - 64px);
  margin: 0 auto;
  padding: 24px 0 64px;
  box-sizing: border-box;
  min-width: 0;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 24px;

  @media (max-width: 1279px) {
    width: calc(100% - 48px);
  }

  @media (max-width: 767px) {
    width: 100%;
    padding: 16px 16px ${liquidityStudioLayout.mobileBottomPad};
  }
`

const ProductLayout = styled.div`
  display: grid;
  gap: 20px;
  min-width: 0;

  @media (min-width: 1024px) {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }
`

const ScrollTop: React.FC<{ viewKey: string }> = ({ viewKey }) => {
  useEffect(() => {
    if (typeof window !== 'undefined') window.scrollTo(0, 0)
  }, [viewKey])
  return null
}

function isExploreView(view: unknown): boolean {
  const raw = Array.isArray(view) ? view[0] : view
  return typeof raw === 'string' && raw.trim().toLowerCase() === 'explore'
}

function isLegacyHomeView(view: unknown): boolean {
  const raw = Array.isArray(view) ? view[0] : view
  return typeof raw === 'string' && raw.trim().toLowerCase() === 'home'
}

const LiquidityStudioBody: React.FC = () => {
  const router = useRouter()
  useLiquidityRuntime()
  const viewParam = router.query.view

  // Legacy two-product marketing home preserved behind ?view=home
  if (isLegacyHomeView(viewParam)) {
    return (
      <>
        <ScrollTop viewKey="home" />
        <LiquidityStudioHome />
      </>
    )
  }

  const resolvedFromQuery = liquidityStudioModeFromView(viewParam)
  // Default (no view) → Positions dense studio (do not inherit runtime Add Liquidity default)
  const activeMode = resolvedFromQuery ?? 'My Positions'
  const explore = isExploreView(viewParam)

  return (
    <>
      <ScrollTop viewKey={String(viewParam ?? 'positions')} />
      <LiquidityStudioChrome mode={activeMode} />
      {activeMode === 'Liquidity Building' ? (
        <div
          data-testid="ls-liquidity-building-surface"
          data-ls-liquidity-building-layout
          data-ls-view="building"
          className="ls-liquidity-building-layout"
        >
          <LiquidityBuildingPanel />
        </div>
      ) : null}
      {activeMode === 'My Positions' ? (
        <div data-testid="ls-positions-surface" data-ls-view="positions">
          <YourLiquidityPositionsSection />
        </div>
      ) : null}
      {explore ? <LiquidityExploreSection /> : null}
      {!explore &&
      (activeMode === 'Add Liquidity' || activeMode === 'Remove Liquidity' || activeMode === 'Simulation') ? (
        <ProductLayout
          data-ls-view={
            activeMode === 'Add Liquidity' ? 'add' : activeMode === 'Remove Liquidity' ? 'remove' : 'simulation'
          }
        >
          <LiquidityBuilderPanel />
          <PositionPreviewPanel />
        </ProductLayout>
      ) : null}
    </>
  )
}

export const LiquidityStudioScreen: React.FC = () => (
  <Root
    data-liquidity-studio-screen="true"
    data-r200-premium="true"
    data-ls-wallet-first="true"
    data-ux-rebuild-liquidity="true"
  >
    <PageMeta />
    <LiquidityStudioGlobalStyle />
    <LiquidityRuntimeProvider>
      <Content>
        <LiquidityStudioBody />
      </Content>
    </LiquidityRuntimeProvider>
  </Root>
)

export default LiquidityStudioScreen
