import React from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/router'
import { PageMeta } from 'components/Layout/Page'
import { uxRebuildColors, uxRebuildFont } from 'design-system/melega/tokens/uxRebuild'
import LiquidityStudioGlobalStyle from './LiquidityStudioGlobalStyle'
import { LiquidityRuntimeProvider } from './liquidityRuntime/LiquidityRuntimeContext'
import LiquidityStudioHome from './components/LiquidityStudioHome'
import { UnifiedLiquidityPage } from './onePage/UnifiedLiquidityPage'
import { liquidityStudioLayout } from './liquidityStudioTokens'
import { liqOne } from './onePage/onePageTokens'

const Root = styled.div`
  color: ${uxRebuildColors.text};
  font-family: ${uxRebuildFont};
  background: ${liqOne.pageBg};
  padding: 0;
  min-width: 0;
  overflow-x: hidden;

  @media (max-width: 767px) {
    padding: 0 0 0;
  }
`

const Content = styled.div`
  /* 1440 canvas → 32px margins → 1376 content */
  max-width: ${liqOne.contentMax};
  width: calc(100% - 64px);
  margin: 0 auto;
  box-sizing: border-box;
  min-width: 0;
  overflow-x: hidden;

  @media (max-width: 1439px) {
    width: calc(100% - 64px);
  }

  @media (max-width: 1279px) {
    width: calc(100% - 48px);
  }

  @media (max-width: 767px) {
    width: 100%;
    padding: 0 16px;
    padding-bottom: ${liquidityStudioLayout.mobileBottomPad};
  }
`

function isLegacyHomeView(view: unknown): boolean {
  const raw = Array.isArray(view) ? view[0] : view
  return typeof raw === 'string' && raw.trim().toLowerCase() === 'home'
}

/**
 * Liquidity Studio — one unified page (DEX-LIQ-ONE-002).
 * Public tab rail removed. Legacy marketing home retained at ?view=home.
 */
export const LiquidityStudioScreen: React.FC = () => {
  const router = useRouter()
  const legacyHome = isLegacyHomeView(router.query.view)

  return (
    <Root
      data-liquidity-studio-screen="true"
      data-r200-premium="true"
      data-ls-wallet-first="true"
      data-ux-rebuild-liquidity="true"
      data-liquidity-one-page="true"
    >
      <PageMeta />
      <LiquidityStudioGlobalStyle />
      <LiquidityRuntimeProvider>
        <Content>{legacyHome ? <LiquidityStudioHome /> : <UnifiedLiquidityPage />}</Content>
      </LiquidityRuntimeProvider>
    </Root>
  )
}

export default LiquidityStudioScreen
