import { SUPPORT_MULTI_CHAINS } from 'config/constants/supportChains'
import styled from 'styled-components'
import Liquidity from 'views/Pool'
import { LiquidityHeroModule } from 'views/LiquidityStudio/modules/LiquidityHeroModule'
import { LiquidityActionsModule } from 'views/LiquidityStudio/modules/LiquidityActionsModule'
import { LiquidityPoolDiscoveryModule } from 'views/LiquidityStudio/modules/LiquidityPoolDiscoveryModule'
import { LiquidityAddModule } from 'views/LiquidityStudio/modules/LiquidityAddModule'
import { LiquidityMarketSnapshotModule } from 'views/LiquidityStudio/modules/LiquidityMarketSnapshotModule'
import { liquidityHero } from 'views/LiquidityStudio/modules/liquidityHeroTokens'

/**
 * LIQUIDITY_MODULE_001–005 — Hero → Actions → Discovery → Add → Market Snapshot → legacy.
 * Legacy `views/Pool` remains untouched; Modules 006–010 are not mounted here.
 */
const Page = styled.div`
  width: 100%;
  min-width: 0;
  overflow-x: hidden;
  background: ${liquidityHero.pageBg};
  box-sizing: border-box;
`

const LegacyBody = styled.div`
  width: 100%;
  min-width: 0;
  margin-top: 16px;
`

const LiquidityPage = () => (
  <Page
    data-liquidity-module-001="mounted"
    data-liquidity-module-002="mounted"
    data-liquidity-module-003="mounted"
    data-liquidity-module-004="mounted"
    data-liquidity-module-005="mounted"
    data-liquidity-architecture="000"
  >
    <LiquidityHeroModule />
    <LiquidityActionsModule />
    <LiquidityPoolDiscoveryModule />
    <LiquidityAddModule />
    <LiquidityMarketSnapshotModule />
    <LegacyBody data-liquidity-legacy-body="LEGACY_IMPLEMENTATION">
      <Liquidity />
    </LegacyBody>
  </Page>
)

LiquidityPage.chains = SUPPORT_MULTI_CHAINS

export default LiquidityPage
