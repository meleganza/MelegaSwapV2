import { LbDocsPage } from 'views/LiquidityStudio/liquidityBuilding/LbDocsPage'
import { CHAIN_IDS } from 'utils/wagmi'

const Page = () => (
  <LbDocsPage
    path="/docs/liquidity-builder/execution"
    title="Program Execution"
    lead="How an AI Liquidity Program is created and run after you activate."
    body="Activation creates a program, deposits your Token Reserve, and turns the program on. The builder then reviews markets on your chosen check frequency and only acts when conditions are safe. You confirm every wallet step. Pause or stop anytime. Technical readiness details live under Advanced in the product UI."
  />
)

Page.chains = CHAIN_IDS
export default Page
