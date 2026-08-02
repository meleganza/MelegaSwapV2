import { LbDocsPage } from 'views/LiquidityStudio/liquidityBuilding/LbDocsPage'
import { CHAIN_IDS } from 'utils/wagmi'

const Page = () => (
  <LbDocsPage
    path="/docs/liquidity-builder/token-reserve"
    title="Token Reserve"
    lead="Your Token Reserve is the project-token inventory Liquidity Builder uses to grow your market."
    body="Amount of your token allocated to AI Liquidity Builder. The AI uses this reserve to build and optimize liquidity according to your strategy. Example: 1,000,000 TOKEN. It is not a WBNB budget. Unused reserve stays yours. Create Market Against is separate — it defines the quote side of your Melega pair."
  />
)

Page.chains = CHAIN_IDS
export default Page
