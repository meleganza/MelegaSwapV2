import { LbDocsPage } from 'views/LiquidityStudio/liquidityBuilding/LbDocsPage'
import { CHAIN_IDS } from 'utils/wagmi'

const Page = () => (
  <LbDocsPage
    path="/docs/liquidity-builder/strategies"
    title="Liquidity Strategies"
    lead="Choose how aggressively Liquidity Builder grows your market from real demand."
    body="Conservative: lower execution frequency; prioritizes stability. Balanced: balances liquidity growth and price stability. AI Optimized: AI dynamically adapts execution based on demand, volume and volatility. Aggressive: faster liquidity deployment with higher market impact tolerance. Presets map to existing on-chain strategy modes — they do not change fee economics."
  />
)

Page.chains = CHAIN_IDS
export default Page
