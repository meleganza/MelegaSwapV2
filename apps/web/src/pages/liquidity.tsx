import { SUPPORT_MULTI_CHAINS } from 'config/constants/supportChains'
import styled from 'styled-components'
import Liquidity from 'views/Pool'
import { LiquidityHeroModule } from 'views/LiquidityStudio/modules/LiquidityHeroModule'
import { liquidityHero } from 'views/LiquidityStudio/modules/liquidityHeroTokens'

/**
 * LIQUIDITY_MODULE_001 — Hero mounted above LEGACY_IMPLEMENTATION body.
 * Legacy `views/Pool` remains untouched; Modules 002–010 are not mounted here.
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
  <Page data-liquidity-module-001="mounted" data-liquidity-architecture="000">
    <LiquidityHeroModule />
    <LegacyBody data-liquidity-legacy-body="LEGACY_IMPLEMENTATION">
      <Liquidity />
    </LegacyBody>
  </Page>
)

LiquidityPage.chains = SUPPORT_MULTI_CHAINS

export default LiquidityPage
