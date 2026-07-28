import { SUPPORT_MULTI_CHAINS } from 'config/constants/supportChains'
import styled from 'styled-components'
import { LiquidityRuntimeProvider } from 'views/LiquidityStudio/liquidityRuntime/LiquidityRuntimeContext'
import { LiquidityHeroModule } from 'views/LiquidityStudio/modules/LiquidityHeroModule'
import { LiquidityActionsModule } from 'views/LiquidityStudio/modules/LiquidityActionsModule'
import { LiquidityPoolDiscoveryModule } from 'views/LiquidityStudio/modules/LiquidityPoolDiscoveryModule'
import { LiquidityMyPositionsModule } from 'views/LiquidityStudio/modules/LiquidityMyPositionsModule'
import { LiquidityInsightsModule } from 'views/LiquidityStudio/modules/LiquidityInsightsModule'
import { LiquidityVisualPolishModule } from 'views/LiquidityStudio/modules/LiquidityVisualPolishModule'
import { liquidityHero } from 'views/LiquidityStudio/modules/liquidityHeroTokens'

/**
 * LIQUIDITY V1 — information architecture redesign (presentation only).
 *
 * Order:
 * 001 Hero
 * 002 Primary workspace (Add Liquidity + AI Builder expanded)
 * 003 My Positions
 * 004 Liquidity Insights (Market Snapshot + Analytics merged)
 * 005 Explore Pools (discovery, bottom)
 */
const Page = styled.div`
  width: 100%;
  min-width: 0;
  overflow-x: hidden;
  background: ${liquidityHero.pageBg};
  box-sizing: border-box;
  padding-bottom: 32px;
`

const LiquidityPage = () => (
  <Page
    data-liquidity-studio-screen="true"
    data-liquidity-module-001="mounted"
    data-liquidity-module-002="mounted"
    data-liquidity-module-003="mounted"
    data-liquidity-module-004="mounted"
    data-liquidity-module-005="mounted"
    data-liquidity-module-006="mounted"
    data-liquidity-module-007="mounted"
    data-liquidity-module-008="mounted"
    data-liquidity-architecture="000"
    data-liquidity-ia="provider-first-v1"
    data-liquidity-legacy-body="archived"
  >
    <LiquidityVisualPolishModule />
    <LiquidityHeroModule />
    <LiquidityRuntimeProvider>
      <LiquidityActionsModule />
      <LiquidityMyPositionsModule />
    </LiquidityRuntimeProvider>
    <LiquidityInsightsModule />
    <LiquidityPoolDiscoveryModule />
  </Page>
)

LiquidityPage.chains = SUPPORT_MULTI_CHAINS

export default LiquidityPage
