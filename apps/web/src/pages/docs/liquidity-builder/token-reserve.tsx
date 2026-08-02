import { LbDocsPage } from 'views/LiquidityStudio/liquidityBuilding/LbDocsPage'
import { CHAIN_IDS } from 'utils/wagmi'

const Page = () => (
  <LbDocsPage
    path="/docs/liquidity-builder/token-reserve"
    title="Token Reserve"
    lead="Your Token Reserve is the project-token inventory Liquidity Builder uses to grow your market."
    body="Token Reserve is the amount of your Token to Grow deposited into the program (via depositBudget). It is not a WBNB budget. Unused reserve stays yours. Quote asset (Create Market Against) is separate — it defines the market side of your Melega pair."
  />
)

Page.chains = CHAIN_IDS
export default Page
