import { LbDocsPage } from 'views/LiquidityStudio/liquidityBuilding/LbDocsPage'
import { CHAIN_IDS } from 'utils/wagmi'

const Page = () => (
  <LbDocsPage
    path="/docs/liquidity-builder/liquidity-goals"
    title="Liquidity Goals"
    lead="Choose how your program should prioritize market growth."
    body="Steady Growth: gradual liquidity expansion with lower market impact. Deeper Market: prioritizes liquidity depth and lower slippage for larger trades. Launch Support: designed for new tokens requiring initial market formation. Goals guide presentation and strategy intensity mapping — they do not change on-chain fee economics."
  />
)

Page.chains = CHAIN_IDS
export default Page
