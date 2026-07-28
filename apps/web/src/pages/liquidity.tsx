import { SUPPORT_MULTI_CHAINS } from 'config/constants/supportChains'
import styled from 'styled-components'
import { LiquidityRuntimeProvider } from 'views/LiquidityStudio/liquidityRuntime/LiquidityRuntimeContext'
import { LiquidityHeroModule } from 'views/LiquidityStudio/modules/LiquidityHeroModule'
import { LiquidityActionsModule } from 'views/LiquidityStudio/modules/LiquidityActionsModule'
import { LiquidityPoolDiscoveryModule } from 'views/LiquidityStudio/modules/LiquidityPoolDiscoveryModule'
import { LiquidityAddModule } from 'views/LiquidityStudio/modules/LiquidityAddModule'
import { LiquidityMarketSnapshotModule } from 'views/LiquidityStudio/modules/LiquidityMarketSnapshotModule'
import { LiquidityMyPositionsModule } from 'views/LiquidityStudio/modules/LiquidityMyPositionsModule'
import { LiquidityAnalyticsModule } from 'views/LiquidityStudio/modules/LiquidityAnalyticsModule'
import { LiquidityVisualPolishModule } from 'views/LiquidityStudio/modules/LiquidityVisualPolishModule'
import { liquidityHero } from 'views/LiquidityStudio/modules/liquidityHeroTokens'

/**
 * LIQUIDITY V1 — certified modular stack only.
 * Legacy views/Pool body removed from production mount (archive remains in repo).
 * One LiquidityRuntimeProvider wraps Add + My Positions.
 */
const Page = styled.div`
  width: 100%;
  min-width: 0;
  overflow-x: hidden;
  background: ${liquidityHero.pageBg};
  box-sizing: border-box;
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
    data-liquidity-legacy-body="archived"
  >
    <LiquidityVisualPolishModule />
    <LiquidityHeroModule />
    <LiquidityActionsModule />
    <LiquidityPoolDiscoveryModule />
    <LiquidityRuntimeProvider>
      <LiquidityAddModule />
      <LiquidityMarketSnapshotModule />
      <LiquidityMyPositionsModule />
    </LiquidityRuntimeProvider>
    <LiquidityAnalyticsModule />
  </Page>
)

LiquidityPage.chains = SUPPORT_MULTI_CHAINS

export default LiquidityPage
