import { LbDocsPage } from 'views/LiquidityStudio/liquidityBuilding/LbDocsPage'
import { CHAIN_IDS } from 'utils/wagmi'

const Page = () => (
  <LbDocsPage
    path="/docs/liquidity-builder/overview"
    title="AI Liquidity Builder Overview"
    lead="I provide my token reserve and AI Liquidity Builder automatically creates and improves market liquidity."
    body="AI Liquidity Builder lets founders create an automated liquidity growth program for their token. Choose Token to Grow, Create Market Against (WBNB, USDT, or USDC), allocate a Token Reserve, pick a Liquidity Goal and Strategy, then activate. You keep LP ownership. Technical readiness details stay under Technical Details — not in the primary setup flow."
  />
)

Page.chains = CHAIN_IDS
export default Page
