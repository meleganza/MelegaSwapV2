import { LbDocsPage } from 'views/LiquidityStudio/liquidityBuilding/LbDocsPage'
import { CHAIN_IDS } from 'utils/wagmi'

const Page = () => (
  <LbDocsPage
    path="/docs/liquidity-builder/strategies"
    title="Liquidity Strategies"
    lead="Choose how aggressively Liquidity Builder grows your market from real demand."
    body="Conservative grows carefully when markets are calm. Balanced uses moderate intensity. AI Optimized lets Melega decide timing and size from eligible demand. Aggressive builds faster when demand is strong. These presets map to existing on-chain strategy modes — they do not change fee economics."
  />
)

Page.chains = CHAIN_IDS
export default Page
