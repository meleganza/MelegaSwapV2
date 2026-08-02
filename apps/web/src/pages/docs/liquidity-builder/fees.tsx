import { LbDocsPage } from 'views/LiquidityStudio/liquidityBuilding/LbDocsPage'
import { CHAIN_IDS } from 'utils/wagmi'

const Page = () => (
  <LbDocsPage
    path="/docs/liquidity-builder/fees"
    title="Liquidity Builder Fees"
    lead="Protocol success fees for Liquidity Building are published on-chain — this page explains the product meaning only."
    body="Liquidity Builder charges a success fee on the program success path (currently 10% / 1000 bps on mainnet Factory). Fee schedules are set by contracts, not by this UI. See Pricing & Fees for broader DEX fee surfaces. This documentation does not change economics."
  />
)

Page.chains = CHAIN_IDS
export default Page
