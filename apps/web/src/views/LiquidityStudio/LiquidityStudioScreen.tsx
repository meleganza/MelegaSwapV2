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
  /*
   * App shell <main> already supplies horizontal page padding (32px @ ≥1024).
   * Fill that area up to 1376 — do not subtract another 64px (double inset).
   * At 1440: main pad 32 → content 1376 → margins 32.
   */
  max-width: ${liqOne.contentMax};
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
  min-width: 0;
  overflow-x: hidden;

  @media (max-width: 767px) {
    width: 100%;
    /* Shell already pads ~12px; avoid a second inset that collapses text <280px */
    padding: 0;
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
