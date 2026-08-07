import { SUPPORT_MULTI_CHAINS } from 'config/constants/supportChains'
import LiquidityStudioV3Shell from 'views/LiquidityStudio/v3/LiquidityStudioV3Shell'

/**
 * Liquidity Studio V3 — consumer-first tabbed experience.
 * Alias: /liquidity-studio → this page.
 * Execution remains in liquidityRuntime (unchanged).
 */
const LiquidityPage = () => <LiquidityStudioV3Shell />

LiquidityPage.chains = SUPPORT_MULTI_CHAINS

export default LiquidityPage
