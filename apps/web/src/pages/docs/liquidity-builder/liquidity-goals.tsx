import { LbDocsPage } from 'views/LiquidityStudio/liquidityBuilding/LbDocsPage'
import { CHAIN_IDS } from 'utils/wagmi'

const Page = () => (
  <LbDocsPage
    path="/docs/liquidity-builder/liquidity-goals"
    title="Liquidity Goals"
    lead="Goals describe the market intent of your program — how you want liquidity to grow."
    sections={[
      {
        title: 'Steady Growth',
        body: (
          <p>
            Gradual liquidity expansion with lower market impact. Best when you want consistent depth over time
            without aggressive deployment.
          </p>
        ),
      },
      {
        title: 'Deeper Market',
        body: (
          <p>
            Prioritize liquidity depth to reduce slippage for traders. Useful for established tokens that need
            thicker books on TOKEN/WBNB, TOKEN/USDT, or TOKEN/USDC.
          </p>
        ),
      },
      {
        title: 'Launch Support',
        body: (
          <p>
            Designed for initial market formation — helping a new token build its first usable trading market
            with structured liquidity growth.
          </p>
        ),
      },
    ]}
  />
)

Page.chains = CHAIN_IDS
export default Page
