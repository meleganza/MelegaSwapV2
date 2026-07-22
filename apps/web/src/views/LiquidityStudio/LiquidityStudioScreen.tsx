import React, { useEffect } from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/router'
import { PageMeta } from 'components/Layout/Page'
import { typography } from 'design-system/melega'
import { ds001Layout } from 'design-system/melega/tokens/ds001'
import TrendingRibbon from 'views/HomeTrade/TrendingRibbon'
import LiquidityStudioGlobalStyle from './LiquidityStudioGlobalStyle'
import { LiquidityRuntimeProvider, useLiquidityRuntime } from './liquidityRuntime/LiquidityRuntimeContext'
import LiquidityStudioHome from './components/LiquidityStudioHome'
import LiquidityStudioProductHeader from './components/LiquidityStudioProductHeader'
import YourLiquidityPositionsSection from './components/YourLiquidityPositionsSection'
import LiquidityBuilderPanel from './components/LiquidityBuilderPanel'
import LiquidityBuildingPanel from './components/LiquidityBuildingPanel'
import PositionPreviewPanel from './components/PositionPreviewPanel'
import { liquidityStudioColors, liquidityStudioLayout } from './liquidityStudioTokens'
import { liquidityStudioModeFromView } from './liquidityRuntime/liquidityStudioView'

const Root = styled.div`
  color: ${liquidityStudioColors.text};
  font-family: ${typography.fontFamily.body};
  background: ${liquidityStudioColors.canvas};
  padding: 0 0 32px;
  min-width: 0;
  overflow-x: hidden;

  @media (max-width: 767px) {
    padding: 0 0 ${liquidityStudioLayout.mobileBottomPad};
  }
`

const Content = styled.div`
  max-width: ${ds001Layout.contentMaxWidth};
  width: calc(100% - 64px);
  margin: 0 auto;
  padding: ${ds001Layout.pagePaddingTopBelowHeader} 0 64px;
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
    padding: 16px 24px ${liquidityStudioLayout.mobileBottomPad};
  }

  @media (max-width: 390px) {
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

const LiquidityStudioBody: React.FC = () => {
  const router = useRouter()
  const { mode } = useLiquidityRuntime()
  const viewParam = router.query.view
  const resolvedFromQuery = liquidityStudioModeFromView(viewParam)
  const isHome = !resolvedFromQuery

  if (isHome) {
    return (
      <>
        <ScrollTop viewKey="home" />
        <LiquidityStudioHome />
      </>
    )
  }

  const activeMode = resolvedFromQuery ?? mode

  return (
    <>
      <ScrollTop viewKey={String(viewParam)} />
      <LiquidityStudioProductHeader mode={activeMode} />
      {activeMode === 'Liquidity Building' ? (
        <div data-testid="ls-liquidity-building-surface" data-ls-view="building">
          <LiquidityBuildingPanel />
        </div>
      ) : null}
      {activeMode === 'My Positions' ? (
        <div data-testid="ls-positions-surface" data-ls-view="positions">
          <YourLiquidityPositionsSection />
        </div>
      ) : null}
      {activeMode === 'Add Liquidity' || activeMode === 'Remove Liquidity' || activeMode === 'Simulation' ? (
        <ProductLayout data-ls-view={activeMode === 'Add Liquidity' ? 'add' : activeMode === 'Remove Liquidity' ? 'remove' : 'simulation'}>
          <LiquidityBuilderPanel />
          <PositionPreviewPanel />
        </ProductLayout>
      ) : null}
    </>
  )
}

export const LiquidityStudioScreen: React.FC = () => (
  <Root data-liquidity-studio-screen="true" data-r200-premium="true" data-ls-wallet-first="true" data-ds0013-home="true">
    <PageMeta />
    <LiquidityStudioGlobalStyle />
    <TrendingRibbon />
    <LiquidityRuntimeProvider>
      <Content>
        <LiquidityStudioBody />
      </Content>
    </LiquidityRuntimeProvider>
  </Root>
)

export default LiquidityStudioScreen
